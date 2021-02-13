import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import { Browser } from 'puppeteer';
import { Boba } from './model.js';

export default async function playmade(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.tracing.start({ path: 'traces/playmade.json', screenshots: true });

  await page.goto('https://www.playmade.com.sg/say-hello');

  const outlets: Boba[] = await page.evaluate(() => {
    const outlets: Boba[] = [];

    const container = document.querySelector('#comp-kbz2ze2r');

    const elements = [...container.querySelectorAll('span')].filter((elem) => {
      const childTextNodes = [...elem.childNodes].filter(
        (node) => node.nodeType === Node.TEXT_NODE
      );

      return (
        childTextNodes.length > 0 &&
        elem.classList.contains('wixGuard') === false
      );
    });

    const boba: Boba = {
      title: '',
      location: '',
      openingHours: '',
      phone: '',
      address: '',
      chain: 'Playmade',
    };

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const { textContent } = element;

      switch (true) {
        case boba.title.length === 0: {
          boba.title = textContent.trim();
          break;
        }
        case textContent.match(/^Address/gim) !== null: {
          if (elements[i + 1].textContent.match(/^Address/gim) !== null) {
            // Handle edge case
            i += 1;
          }
          boba.address = elements[i + 1].textContent;
          i += 1;
          break;
        }
        case textContent.match(/^Opening/gim) !== null: {
          boba.openingHours = textContent.replace(/^Opening hours:\s?/gi, '');
          i += 1;
          break;
        }
        case textContent.match(/^Contact/gim) !== null: {
          boba.phone = textContent.replace(/^Contact:\s?/gi, '');
          i += 1;

          break;
        }
        case textContent.match(/^Available/gim) !== null: {
          i += 1;

          outlets.push({ ...boba });
          boba.title = '';
          break;
        }
      }
    }

    return outlets;
  });

  await page.tracing.stop();

  return Bluebird.map(outlets, autoLocation, { concurrency: 1 });
}
