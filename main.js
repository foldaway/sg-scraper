/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import Promise from 'bluebird';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import {spawnSync} from 'child_process';
import puppeteer from 'puppeteer';
import Sentry from '@sentry/node';
import MODULES from './modules.js';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

const isProduction = process.env.NODE_ENV === 'production';

if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
}

const main = async () => {
  const browser = await puppeteer.launch({
    headless: isProduction,
    args: isProduction ? ['--no-sandbox'] : [],
  });

  for (const module of MODULES) {
    console.log(`[MODULE] ${module}`);
    const filename = path.join('temp', `${module}.json`);
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
    const data = [];
    const dataSources = Object.keys(module).filter(key => key !== 'toString');
    for (const dataSource of dataSources) {
      try {
        const results = await module[dataSource](browser);
        data.push(...results);
        console.log(`[DATA SOURCE] '${dataSource}'`, `- scraped ${results.length} items`);
      } catch (e) {
        console.error(`[DATA SOURCE] '${dataSource}'`, e);

        const pages = await browser.pages();
        const pageTitles = await Promise.map(pages, async page => page.title());
        let screenshots = null;
        if (process.env.IMGBB_API_KEY) {
          screenshots = await Promise.map(
            pages,
            async page => {
              const screenshot = await page.screenshot({encoding: 'base64'}); // base64
              const resp = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                `image=${encodeURIComponent(screenshot)}&name=${encodeURIComponent(
                  `${module}-${dataSource}`
                )}`,
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  responseType: 'json',
                }
              );
              return resp.data.data.url_viewer;
            },
            {concurrency: 1}
          );
        }
        // eslint-disable-next-line func-names, prefer-arrow-callback
        Sentry.configureScope(function(scope) {
          scope.setExtras(Object.fromEntries(pages.map((_, i) => [pageTitles[i], screenshots[i]])));
          Sentry.captureException(e);
        });
      }
    }
    fs.writeFileSync(filename, JSON.stringify(data, null, isProduction ? 0 : 2));
  }

  await browser.close();

  if (process.env.GITHUB_TOKEN) {
    spawnSync(
      'dpl',
      [
        '--provider=pages',
        '--committer-from-gh',
        `--github-token=${process.env.GITHUB_TOKEN}`,
        `--repo=${process.env.GITHUB_REPO}`,
        `--local-dir=temp`,
      ],
      {
        stdio: 'inherit',
      }
    );
  }

  Sentry.flush();

  return null;
};

main();
