import fs from 'fs';

import path from 'path';

const DIRECTORY_DIST = path.join(process.cwd(), 'output');

try {
  fs.mkdirSync(DIRECTORY_DIST);
} catch (e) {}

export function readStore(fileName: string): Record<string, unknown> {
  const filePath = path.join(DIRECTORY_DIST, fileName);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const data = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });

  return JSON.parse(data) as Record<string, unknown>;
}

export function writeStore(
  fileName: string,
  data: Record<string, unknown>
): void {
  const filePath = path.join(DIRECTORY_DIST, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data));
}
