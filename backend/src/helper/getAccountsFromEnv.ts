import dotenv from 'dotenv';
import resolveEnvFile from './resolveEnvFile';


export default function getAccountsFromEnv(sessionPrefix = 'BRICKBUILDER') {
  const accounts: { id: number; email: string; password: string }[] = [];

  dotenv.config({ path: resolveEnvFile(sessionPrefix) })
  const env = process.env;

  let index = 1;
  while (true) {
    const email = env[`${sessionPrefix}_USER_${index}`];
    const password = env[`${sessionPrefix}_PASS_${index}`];

    if (!email && !password) break; // end when both missing

    accounts.push({
      id: index,
      email: email || '',
      password: password || '',
    });

    index++;
  }

  return accounts;
}