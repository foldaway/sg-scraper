import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model';
import { ChainNames } from './constants';

export default async function liho(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  /**
   * Block other domain stuff
   * Seems like lihosg.com includes some malware scripts that contain weird redirects.
   */
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!url.hostname.endsWith('lihosg.com')) {
      request.abort();
      return;
    }

    request.continue();
  });

  await page.goto('https://lihosg.com/liho-outlets/', {
    waitUntil: 'networkidle0',
  });

  const outlets: Omit<Boba, 'location' | 'chain'>[] = [];

  const elements = await page.$$('.kt-row-has-bg');
  for (const elementHandle of elements) {
    try {
      const bobaPartial = await elementHandle.evaluate((element) => {
        const innerContainer = element.querySelector('.kt-inside-inner-col');
        const [
          titleElement,
          addressElement,
          openingHoursElement,
          phoneElement,
        ] = Array.from(innerContainer.children);

        const title = titleElement.textContent;
        // Remove "Address:" element
        addressElement.querySelector('strong')?.remove();
        const address = addressElement.textContent;
        // Remove "Opening & Closing Time:" element
        openingHoursElement.querySelector('strong')?.remove();
        const openingHours = openingHoursElement.textContent;
        // Remove "Phone:" element
        phoneElement.querySelector('strong')?.remove();
        const phone = phoneElement.textContent;

        return {
          title,
          address,
          openingHours,
          phone,
        } satisfies Omit<Boba, 'location' | 'chain'>;
      });

      outlets.push(bobaPartial);
    } catch (e) {
      console.log('Skipping malformatted entry');
      console.error(e);
    }
  }

  const chain = ChainNames.liho;
  const data = outlets.map((outlet) => {
    return {
      ...outlet,
      chain,
    };
  });
  return Bluebird.map(data, autoLocation, {
    concurrency: 1,
  });
}
