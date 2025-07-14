import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fsp } from 'fs';
import path from 'path';

import { getAccountById, updateAccount } from '../models/account.model';
import { getProxyById } from '../models/proxy.model';
import { addAuthCookie } from '../models/authcookies.model';

puppeteer.use(StealthPlugin());

type initSettings = {
  userId: number,
  proxyId: number,
  target: {
    loginUrl: string,
    userNameSelector: string,
    passwordSelector: string,
    submitSelector: string,
  },
};

export default async function generateAuthCookies(settings: initSettings) {
  const { userId, proxyId, target } = settings;

  if (!userId || !proxyId || !target) {
    throw new Error('Missing required settings: userId, proxyId, target');
  }

  const account = await getAccountById(userId);
  const proxy = await getProxyById(proxyId);
  if (!account) throw new Error(`User ID ${userId} not found`);
  if (!proxy) throw new Error(`Proxy ID ${proxyId} not found`);

  const proxyURL = `http://${proxy.host}:${proxy.port}`;
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // `--proxy-server=${proxyURL}`,
      '--start-maximized',
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Block images
  // await page.setRequestInterception(true);
  // page.on('request', (req) => {
  //   if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/138.0.7204.92 Safari/537.36'
  );

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });

  try {
    console.log('[*] Navigating to login page...');
    await page.goto(target.loginUrl, { waitUntil: 'networkidle2' });

    console.log('[*] Typing email and password...');
    await page.waitForSelector(target.userNameSelector);
    await page.type(target.userNameSelector, account.username, { delay: 50 });

    await page.waitForSelector(target.passwordSelector);
    await page.type(target.passwordSelector, account.password, { delay: 50 });

    console.log('[*] Submitting login...');
    await page.click(target.submitSelector);

    // Wait for either a navigation or a post-login indicator
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
      page.waitForSelector('img.global-nav__me-photo, .feed-identity-module', { timeout: 20000 }),
    ]);

    console.log('[*] Login appears successful!');
    console.log('[*] Current URL:', page.url());

    // Optional screenshot for debug
    await page.screenshot({ path: `cookies/debug-login-${userId}.png` });

    // Get cookies
    const cookies = await page.cookies();
    const cookieFileName = `${userId}-cookies.json`;
    const cookiePath = path.join('cookies', cookieFileName);

    await fsp.mkdir('cookies', { recursive: true });
    await fsp.writeFile(cookiePath, JSON.stringify(cookies, null, 2));
    console.log(`[✓] Cookies saved to ${cookiePath}`);

    const updated = await updateAccount(userId, { cookies: cookieFileName });
    if (updated) {
      await addAuthCookie({ proxy_id: proxyId, account_id: userId, cookie_url: cookieFileName });
      console.log(`[✓] Account and auth cookie database updated`);
    } else {
      console.error('[✘] Failed to update account with cookie path');
    }

  } catch (err) {
    console.error('[❌] Login process failed:', err);
  }

  await browser.close();
}
