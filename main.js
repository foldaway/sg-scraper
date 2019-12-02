/* eslint-disable no-restricted-syntax */
import path from 'path';
import fs from 'fs';
import * as boba from './src/sources/boba/index.js';

const isProduction = process.env.NODE_ENV === 'production';
const MODULES = [boba];

if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
}

const main = async () => {
  for (const module of MODULES) {
    console.log(`[MODULE] ${module}`);
    const filename = path.join('temp', `${module}.json`);
    fs.unlinkSync(filename);
    const data = [];
    const dataSources = Object.keys(module)
      .filter((key) => key !== 'toString');
    for (const dataSource of dataSources) {
      try {
        const results = await module[dataSource]();
        data.push(...results);
        console.log(`[DATA SOURCE] '${dataSource}'`, `- scraped ${results.length} items`);
      } catch (e) {
        console.error(`[DATA SOURCE] '${dataSource}'`, e);
      }
    }
    fs.writeFileSync(filename, JSON.stringify(data, null, isProduction ? 0 : 2));
  }

  return null;
};

main();
