import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { Boba } from './model';

export default async function koi(browser: Browser): Promise<Boba[]> {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.koithe.com/en/global/koi-singapore',
    },
    {
      type: 'elementsQuery',
      selector: '.global-wrap .item',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: '.titlebox',
            address: '.txt a',
            phone: '.titlebox',
            opening_hours: '.txt',
          },
        },
      ],
    },
  ]);

  const data = outlets.map((outlet) => Object.assign(outlet, { chain: 'KOI' }));

  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
