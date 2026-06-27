import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model.js';

export default async function playmade(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://www.playmade.com.sg/say-hello');

  const chain = ChainNames.playmade;
  const outlets: Omit<Boba, 'location'>[] = await page.evaluate((chain) => {
    const outlets: Omit<Boba, 'location'>[] = [];

    const container = document.querySelector(
      '#comp-kbz2ze2r',
    ) as HTMLDivElement;
    const lines = container.innerText
      .replace(/[\u200Bb]/g, '')
      .trim()
      .split(/\n+/g)
      .filter((x) => x.length > 0)
      .filter((x) => x !== `""`);

    const boba: Omit<Boba, 'location'> = {
      title: '',
      openingHours: '',
      phone: '',
      address: '',
      chain,
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      switch (true) {
        case boba.title.length === 0: {
          boba.title = line.trim();
          break;
        }
        case line.match(/^Address:\s?/im) !== null: {
          boba.address = line.replace(/Address:\s?/im, '');
          break;
        }
        case line.match(/^Opening hours:\s?/im) !== null: {
          boba.openingHours = line.replace(/^Opening hours:\s?/im, '');
          break;
        }
        case line.match(/^Contact:\s?/im) !== null: {
          boba.phone = line.replace(/^Contact:\s?/im, '');
          break;
        }
        // Partial match - they have a typo
        case line.match(/^Avail?/im) !== null: {
          outlets.push({ ...boba });
          boba.title = '';
          break;
        }
      }
    }

    return outlets;
  }, chain);

  assert(outlets.length > 0, 'Expected at least one scraped outlet');
  await page.close();

  return Promise.all(outlets.map(autoLocation));
}
