import { Browser } from 'puppeteer';
import { ChainNames } from './constants';
import { Boba } from './model';
import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';

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

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
