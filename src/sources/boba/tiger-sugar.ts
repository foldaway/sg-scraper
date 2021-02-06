import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model.js';

export default async function tigersugar(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();
  await page.goto('https://tigersugar.com/#section_abroad');
  await page.click('div[data-target="#continent_modal_Asia"]');

  await page.waitForXPath('//a[text() = "新加坡"]', { timeout: 10000 });
  await page.waitFor(2000);

  const [singaporeTab] = await page.$x('//a[text() = "新加坡"]');
  await singaporeTab?.click();

  await page.waitFor(2000);

  const pageButtons = await page.$$('.paginate_button');

  const outlets: Boba[] = [];

  for (const pageButton of pageButtons) {
    const isVisible = await page.evaluate(
      (elem) => elem.offsetParent !== null,
      pageButton
    );

    if (!isVisible) {
      continue;
    }

    await page.evaluate((elem) => {
      elem.scrollIntoView();
    }, pageButton);
    await pageButton.click();
    await page.waitFor(5000);

    const pageOutlets: Boba[] = await page.evaluate(() => {
      const outlets: Boba[] = [];

      const tables = [...document.querySelectorAll('.city_table')];
      const table = tables.find(
        (tbl) => (tbl as HTMLElement).offsetParent !== null
      );

      const rows = [...table.querySelectorAll('tbody tr')];

      for (const row of rows) {
        const columns = [...row.querySelectorAll('td')];

        const boba: Boba = {
          title: columns[0].textContent,
          address: columns[1].textContent,
          phone: columns[2].textContent,
          location: '',
          openingHours: '',
          chain: 'Tiger Sugar',
        };

        outlets.push(boba);
      }

      return outlets;
    });

    outlets.push(...pageOutlets);
  }

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
