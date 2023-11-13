import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model.js';
import { ChainNames } from './constants';

export default async function chicha(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://www.chichasanchen.com.sg/');

  const chain = ChainNames.chicha;
  const outlets: Boba[] = await page.evaluate((chain) => {
    const outlets: Boba[] = [];

    const container = document.querySelector(
      'div[data-mesh-id="Containerc1dmpinlineContent-gridContainer"]'
    );
    const stores = container.querySelectorAll(
      'div[data-testid="richTextElement"]'
    );

    for (const store of stores) {
      const spans = [...store.querySelectorAll('span')].filter((span) => {
        const childTextNodes = [...span.childNodes].filter(
          (node) => node.nodeType === Node.TEXT_NODE
        );

        return childTextNodes.length > 0;
      });

      if (spans.length < 3) {
        continue;
      }

      const boba: Boba = {
        title: '',
        address: '',
        openingHours: '',
        phone: '',
        location: '',
        chain,
      };

      for (let i = 0; i < spans.length; i++) {
        const span = spans[i];

        const { textContent } = span;

        switch (true) {
          case textContent.startsWith('CHICHA'): {
            boba.title = textContent.trim();
            break;
          }
          case textContent.match(/^Address/gim) !== null: {
            boba.address = spans[i + 1].textContent.trim();
            i += 1;
            break;
          }
          case textContent.match(/^Opening/gim) !== null: {
            boba.openingHours = spans[i + 1].textContent.trim();
            i += 1;
            break;
          }
        }
      }

      if (boba.address.length === 0) {
        continue;
      }

      outlets.push(boba);
    }

    return outlets;
  }, chain);

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
