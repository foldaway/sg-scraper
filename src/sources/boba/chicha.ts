import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model.js';

export default async function chicha(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://www.chichasanchen.com.sg/');

  const outlets: Boba[] = await page.evaluate(() => {
    const outlets: Boba[] = [];

    const container = document.querySelector('#comp-jwncx772');
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

      const boba: Boba = {
        title: '',
        address: '',
        openingHours: '',
        phone: '',
        location: '',
        chain: '',
      };

      let l = spans.length;

      for (let i = 0; i < l; i++) {
        const span = spans[i];

        const { textContent } = span;

        switch (true) {
          case textContent.startsWith('CHICHA'): {
            boba.title = textContent.trim();
            break;
          }
          case textContent.match(/^Address/gim) !== null: {
            l--;
            boba.address = spans[i + 1].textContent.trim();
            break;
          }
          case textContent.match(/^Opening/gim) !== null: {
            l--;
            boba.openingHours = spans[i + 1].textContent.trim();
            break;
          }
        }
      }

      outlets.push(boba);
    }

    return outlets;
  });

  const data = outlets.map((outlet) =>
    Object.assign(outlet, { chain: 'ChiCha' })
  );
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
