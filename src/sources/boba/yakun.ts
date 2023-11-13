import { Browser } from 'puppeteer';
import { ChainNames } from './constants';
import { Boba } from './model';
import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';

const REGIONS = ['north', 'north-east', 'east', 'south', 'west', 'central'];

export default async function yakun(browser: Browser) {
  const outlets: Boba[] = [];

  for (const region of REGIONS) {
    const page = await browser.newPage();

    await page.goto(`http://yakun.com/find-us/local/${region}`);

    const chain = ChainNames.kopifellas;

    const scrapedOutlets: Boba[] = await page.evaluate((chain) => {
      const outlets: Boba[] = [];

      const boxes = document.querySelectorAll('.col-md-9');

      for (const box of boxes) {
        const title = box.querySelector('.title').textContent;
        const table = box.querySelector('table table') as HTMLTableElement;
        const [, address, , , phone, , openingHours] = table.innerText
          .trim()
          .split('\t')
          .filter((x) => x.trim().length > 0)
          .map((x) => x.trim().replace(/\n/g, ' '));

        const boba: Boba = {
          title,
          address,
          openingHours,
          phone,
          location: '',
          chain,
        };

        outlets.push(boba);
      }

      return outlets;
    }, chain);

    outlets.push(...scrapedOutlets);
  }

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
