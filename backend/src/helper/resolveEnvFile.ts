import path from 'path';
import fs from 'fs';

export default function resolveEnvFile(fileNameOrPath: string): string {
  const candidates = [
    path.resolve(process.cwd(), fileNameOrPath),
    path.resolve(process.cwd(), 'accounts', fileNameOrPath),
    path.resolve(process.cwd(), '..', fileNameOrPath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  console.error(`Cannot find env file "${fileNameOrPath}" in ./, ./accounts/, or ../`);
  process.exit(1);
}