import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model';

export default async function localCoffeePeople(
  browser: Browser,
): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://localcoffeepeople.com/', {
    waitUntil: 'domcontentloaded',
  });

  const chain = ChainNames.localCoffeePeople;

  const outlets: Omit<Boba, 'location'>[] = await page.evaluate((chain) => {
    const outlets: Omit<Boba, 'location'>[] = [];

    const columns = document.querySelectorAll(
      '#locateus .vc_column-inner .vc_column-inner',
    );

    for (const column of columns) {
      const containerElement = column.querySelector('.wpb_text_column');
      if (containerElement == null) {
        continue;
      }
      const titleElement = containerElement.querySelector('h5');
      const [addressElement, phoneElement, openingHoursElement] = Array.from(
        containerElement.querySelectorAll('p'),
      );

      const boba: Omit<Boba, 'location'> = {
        title: titleElement.textContent.trim(),
        address: addressElement.textContent.trim(),
        openingHours: openingHoursElement.textContent.trim(),
        phone: phoneElement.textContent.trim(),
        chain,
      };

      outlets.push(boba);
    }

    return outlets;
  }, chain);

  assert(outlets.length > 0, 'Expected at least one scraped outlet');
  await page.close();

  return Promise.all(outlets.map(autoLocation));
}
