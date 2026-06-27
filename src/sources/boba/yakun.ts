import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model';

export default async function yakun(browser: Browser) {
  const outlets: Omit<Boba, 'location'>[] = [];

  const page = await browser.newPage();

  await page.goto(`https://app.yakun.com/find-us`);

  const chain = ChainNames.yakun;

  const scrapedOutlets: Omit<Boba, 'location'>[] = await page.evaluate(
    (chain) => {
      const outlets: Omit<Boba, 'location'>[] = [];

      const boxes = document.querySelectorAll('#local__all li');

      for (const box of boxes) {
        const title = box.querySelector('.con_add_title').textContent;
        const address = box.querySelector('.con_add_address').textContent;
        const phone = box.querySelector('.con_add_phone').textContent;
        const openingHours = box.querySelector('.con_add_time').textContent;

        const boba: Omit<Boba, 'location'> = {
          title,
          address,
          openingHours,
          phone,
          chain,
        };

        outlets.push(boba);
      }

      return outlets;
    },
    chain,
  );

  outlets.push(...scrapedOutlets);

  assert(outlets.length > 0, 'Expected at least one scraped outlet');
  await page.close();

  return Promise.all(outlets.map(autoLocation));
}
