import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model';

export default async function kopifellas(browser: Browser) {
  const page = await browser.newPage();

  await page.goto('https://www.kopifellas.com.sg/singapore/');

  const chain = ChainNames.kopifellas;

  const outlets: Omit<Boba, 'location'>[] = await page.evaluate((chain) => {
    const outlets: Omit<Boba, 'location'>[] = [];

    const headers = document.querySelectorAll('.et_pb_module_header');

    for (const header of headers) {
      const description = (header.nextElementSibling as HTMLElement).innerText;
      const [address, openingHours] = description.split('\n');

      const boba: Omit<Boba, 'location'> = {
        title: header.textContent,
        address: address.replace(/^Address:\s?/i, ''),
        openingHours,
        phone: '',
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
