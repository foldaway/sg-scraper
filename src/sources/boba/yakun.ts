import { Browser } from 'puppeteer';
import { ChainNames } from './constants';
import { Boba } from './model';
import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';


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
    chain
  );

  outlets.push(...scrapedOutlets);

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
