import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model.js';

export default async function eachACup(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();
  await page.goto('https://www.each-a-cup.com/stores/');

  const chain = ChainNames.eachACup;
  const outlets: Omit<Boba, 'location'>[] = [];

  const storeElements = await page.$$('.store-itemBox');

  for (const storeElement of storeElements) {
    const contentBox = await storeElement.$('.store-contentBox');

    const titleElement = await contentBox.$('h4');
    const title = await titleElement.evaluate((node) => node.textContent);

    const detailElements = await contentBox.$$('ul li p');

    const [addressElement, openingHoursElement] = detailElements;
    const address = await addressElement.evaluate((node) => node.textContent);

    const openingHours = await openingHoursElement.evaluate(
      (node) => node.textContent,
    );

    const boba: Omit<Boba, 'location'> = {
      title,
      address,
      openingHours,
      phone: '',
      chain,
    };

    outlets.push(boba);
  }

  const data = outlets.flat().map((outlet) => Object.assign(outlet, { chain }));
  assert(data.length > 0, 'Expected at least one scraped outlet');
  await page.close();
  return Promise.all(data.map(autoLocation));
}
