import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model';
import { ChainNames } from './constants';

export default async function mrCoconut(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://mrcoconut.sg/outlets/');

  const outlets: Boba[] = await page.evaluate(() => {
    const outlets: Boba[] = [];

    const stores = [];
    [...document.querySelectorAll('div[data-widget_type="heading.default"]')]
      .filter((node) => node.parentNode.childElementCount > 1)
      .forEach((node) => {
        if (!stores.includes(node.parentNode)) {
          stores.push(node.parentNode);
        }
      });

    for (const store of stores) {
      const h2s = store.querySelectorAll('h2');

      if (h2s.length < 3) {
        continue;
      }

      // Remove newlines and clean extraneous spaces
      const address = h2s[1].textContent
        .trim()
        .replace(/\n/g, ' ')
        .split(' ')
        .filter((token) => token !== '')
        .join(' ');

      const boba: Boba = {
        title: h2s[0].textContent.trim(),
        address: address,
        openingHours: h2s[2].textContent.trim(),
        phone: '',
        location: '',
        chain: ChainNames.mrCoconut,
      };

      outlets.push(boba);
    }
    return outlets;
  });

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
