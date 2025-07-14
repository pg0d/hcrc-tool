import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';
import path from 'path';
import xlsx from 'xlsx';

import { getAccountById } from '../models/account.model';
import { getProxyById } from '../models/proxy.model';
import { createCursor } from 'ghost-cursor';

import { addLinkedInProfile } from '../models/profile.model';

puppeteer.use(StealthPlugin());

export type CrawlStats = {
  total: number;
  crawled: number;
  errors: number;
};

export type NewProfile = {
  name: string | null;
  location: string | null;
  bio: string | null;
  about: string | null;
  profile_url: string;
  crawl_status: string;
  experience: any[];
  education?: any[];
  certificates?: any[];
  skills?: any[];
  cons_int_id?: string;
};

function waitRandom(min: number, max: number): Promise<void> {
  const delay = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function crawlLinkedInProfilesFromSheet(
  sheetPath: string,
  maxCount = 400,
  logCallback?: (msg: string) => void,
  statsCallback?: (stats: CrawlStats) => void,
  settings: string[] = [],
  cookieFile?: string,
  proxyId?: number,
  accountId?: number,
) {
  if (!accountId || !proxyId) return;

  const workbook = xlsx.readFile(sheetPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const headers = rows[0];
  const dataRows = rows.slice(1);

  const urlColIndex = headers.indexOf('LinkedIn_URL');
  const consIntIdColIndex = headers.indexOf('Cons_Int_ID'); // ✅ get column index
  let statusColIndex = headers.indexOf('Crawl_Status');

  if (statusColIndex === -1) {
    headers.push('Crawl_Status');
    statusColIndex = headers.length - 1;
  }

  const toVisit = dataRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) =>
      typeof row[urlColIndex] === 'string' &&
      row[urlColIndex].startsWith('http') &&
      row[statusColIndex] !== 'success'
    )
    .slice(0, maxCount);

  const allUncrawled = dataRows.filter(row =>
    typeof row[urlColIndex] === 'string' &&
    row[urlColIndex].startsWith('http') &&
    !['success', 'fail'].includes(row[statusColIndex])
  );

  const stats: CrawlStats = { total: allUncrawled.length, crawled: 0, errors: 0 };

  const accountDetails = await getAccountById(accountId);
  const proxyDetails = await getProxyById(proxyId);

  logCallback?.(`🗂️ Loaded ${toVisit.length} links from spreadsheet`);
  logCallback?.(`⚙️ Settings used: ${settings.join(', ')}`);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  if (settings.includes('Block Images')) {
    await page.setRequestInterception(true);
    page.on('request', req => (req.resourceType() === 'image' ? req.abort() : req.continue()));
    logCallback?.('🖼️ Image blocking is active');
  }

  if (cookieFile) {
    try {
      const cookies = JSON.parse(await fs.readFile(path.resolve('cookies', cookieFile), 'utf-8'));
      await page.setCookie(...cookies);
      logCallback?.(`🍪 Cookies loaded from ${cookieFile}`);
    } catch (err: any) {
      logCallback?.(`⚠️ Failed to load cookies from ${cookieFile}: ${err.message}`);
      await browser.close();
      throw err;
    }
  }

  for (const { row, index } of toVisit) {
    const url = row[urlColIndex];
    const consIntId = row[consIntIdColIndex]?.toString().trim() || null;

    logCallback?.(`🔗 Visiting (${stats.crawled + stats.errors + 1}/${toVisit.length}): ${url}`);

    try {
      await page.goto(url, { timeout: 60000 });
      if (page.url().includes('/login')) throw new Error('Redirected to login — cookies may be invalid');

      await page.waitForSelector('a h1', { timeout: 20000 });
      await waitRandom(1500, 1500);

      const cursor = createCursor(page);
      const { width = 1366, height = 768 } = (await page.viewport()) || {};
      await cursor.moveTo({ x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) });

      const profileData = await page.evaluate(() => {
        const getText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || null;
        return {
          name: getText('a h1'),
          location: getText('.pb5 span.text-body-small.inline.t-black--light.break-words'),
          bio: getText('.pb5 .text-body-medium.break-words'),
          about: getText('.artdeco-card.pv-profile-card [dir="ltr"] span')
        };
      });

      let experienceData: any[] = [];
      try {
        const seeAllExp = await page.$('#navigation-index-see-all-experiences');
        if (seeAllExp) {
          await seeAllExp.click();
          await page.waitForSelector('[aria-label="Experience"] ul > li.pvs-list__paged-list-item', { timeout: 15000 });
          await waitRandom(1500, 1500);
        }

        experienceData = await page.evaluate(() => {
          const list = document.querySelectorAll('[aria-label="Experience"] ul > li.pvs-list__paged-list-item');
          const results: any[] = [];

          list.forEach(item => {
            if (item.closest('.pvs-entity__sub-components')) return;
            const company = item.querySelector('a .t-bold span[aria-hidden="true"]')?.textContent?.trim();
            const meta = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();
            const dateRange = item.querySelector('.t-black--light .pvs-entity__caption-wrapper span[aria-hidden="true"]')?.textContent?.trim();
            const location = item.querySelectorAll('.t-black--light span[aria-hidden="true"]')[1]?.textContent?.trim();

            const summary: any[] = [];
            const summaryMap = new Map<string, string | undefined>();
            const subs = item.querySelectorAll('.pvs-entity__sub-components ul > li');

            if (subs.length > 0) {
              subs.forEach(sub => {
                const title = sub.querySelector('.t-bold span[aria-hidden="true"]')?.textContent?.trim();
                const desc = sub.querySelector('.t-14.t-normal.t-black span[aria-hidden="true"]')?.textContent?.trim();
                if (title && (!summaryMap.has(title) || (desc?.length ?? 0) > (summaryMap.get(title)?.length ?? 0))) {
                  summaryMap.set(title, desc);
                }
              });
            } else {
              const title = item.querySelector('.t-bold span[aria-hidden="true"]')?.textContent?.trim();
              const desc = item.querySelector('.t-14.t-normal.t-black span[aria-hidden="true"]')?.textContent?.trim();
              if (title) summaryMap.set(title, desc);
            }

            for (const [title, desc] of summaryMap.entries()) {
              summary.push(desc ? { title, description: desc } : { title });
            }

            results.push({ company, meta, location: location || dateRange, summary });
          });

          return results;
        });
      } catch (err: any) {
        console.warn(`⚠️ Experience section error: ${err.message}`);
      }

      const fullProfile: NewProfile = {
        name: profileData.name,
        location: profileData.location,
        bio: profileData.bio,
        about: profileData.about,
        profile_url: url,
        crawl_status: 'success',
        experience: experienceData,
        education: [],
        certificates: [],
        skills: [],
        cons_int_id: consIntId
      };

      try {
        await addLinkedInProfile(fullProfile);
        logCallback?.(`💾 Saved profile to database: ${profileData.name}`);
      } catch (saveErr) {
        console.error(`❌ Failed to save to DB for ${url}:`, saveErr);
      }

      stats.crawled++;
      dataRows[index][statusColIndex] = 'success';
    } catch (err: any) {
      stats.errors++;
      dataRows[index][statusColIndex] = 'fail';
      logCallback?.(`❌ Error visiting ${url}: ${err.message}`);
    }

    statsCallback?.({ ...stats });
    await waitRandom(3000, 4000);
  }

  await browser.close();
  logCallback?.(`✅ Crawled ${stats.crawled}, Errors: ${stats.errors}`);

  for (const row of dataRows) while (row.length < headers.length) row.push('');
  const updatedSheet = xlsx.utils.aoa_to_sheet([headers, ...dataRows]);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, updatedSheet, sheetName);
  xlsx.writeFile(newWorkbook, sheetPath);
  logCallback?.('📁 Excel file updated');
}
