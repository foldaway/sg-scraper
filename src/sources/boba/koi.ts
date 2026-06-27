import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model';

export default async function koi(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  const chain = ChainNames.koi;

  const outlets: Omit<Boba, 'location'>[] = [];

  await page.goto('https://www.koithe.com/en/store.php?c=51');

  // Limit to 20 pages
  for (let i = 0; i < 20; i++) {
    console.log(`[KOI] Iteration ${i}`);

    const currentPageOutlets = await page.evaluate((chain) => {
      const storeOutletElements = document.querySelectorAll('.storeList li');

      const _results: Omit<Boba, 'location'>[] = [];

      for (const storeOutletElement of storeOutletElements) {
        const title =
          storeOutletElement.querySelector('.title')?.textContent?.trim() ??
          null;
        const phone =
          storeOutletElement.querySelector('.phone')?.textContent ?? null;
        const openingHours =
          storeOutletElement.querySelector('.time')?.textContent ?? null;
        const address =
          storeOutletElement.querySelector('.address')?.textContent?.trim() ??
          null;
        const brandImg =
          storeOutletElement.querySelector('.brand img')?.getAttribute('src') ??
          null;

        if (
          title == null &&
          phone == null &&
          openingHours == null &&
          address == null
        ) {
          continue;
        }

        let titleFull = title;
        if (brandImg.includes('storeBrand_79.png')) {
          titleFull += ' (KOI Thé)';
        } else if (brandImg.includes('storeBrand_216.png')) {
          titleFull += ' (Signature KOI)';
        } else if (brandImg.includes('storeBrand_80.png')) {
          titleFull += ' (KOI Thé Express)';
        }

        _results.push({
          chain,
          title: titleFull,
          phone,
          openingHours,
          address,
        });
      }

      return _results;
    }, chain);

    console.log(
      `[KOI] collected ${currentPageOutlets.length} outlets from ${page.url()}`,
    );

    outlets.push(...currentPageOutlets);

    const nextButton = await page.$('.next a');
    if (nextButton != null) {
      console.log('[KOI] Going next page.');
      const url = await nextButton.evaluate(
        (element) => (element as HTMLAnchorElement).href,
      );
      await page.goto(url);
    } else {
      console.log('[KOI] Nothing to do.');
      break;
    }
  }

  const data = outlets.map((outlet) => Object.assign(outlet, { chain }));

  assert(data.length > 0, 'Expected at least one scraped outlet');
  await page.close();

  return Promise.all(data.map(autoLocation));
}
