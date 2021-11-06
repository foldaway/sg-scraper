import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model';
import { ChainNames } from './constants';

export default async function gongCha(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://www.gong-cha-sg.com/stores/', {
    waitUntil: 'networkidle0',
  });

  async function scrapeItems(): Promise<Boba[]> {
    const items = await page.evaluate(() => {
      const results: Boba[] = [];
      const itemElements = document.querySelectorAll('.item');

      for (const element of itemElements) {
        const title = element.querySelector('.p-title')?.textContent;
        const address = element.querySelector('.p-area')?.textContent;
        const openingHours = element.querySelector('.p-time')?.textContent;

        if (title == null || address == null || openingHours == null) {
          continue;
        }

        const outlet: Boba = {
          title,
          address,
          openingHours,
          phone: '',
          location: '',
          chain: ChainNames.gongCha,
        };

        results.push(outlet);
      }

      return results;
    });

    return items;
  }

  const openOutlets = await scrapeItems();

  // Click the open/close toggle switch
  await page.click('label[for="asl-open-close"]');

  const closedOutlets = await scrapeItems();

  const outlets = [...openOutlets, ...closedOutlets];

  await page.close();

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
