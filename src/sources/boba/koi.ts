import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { Boba } from './model';
import { ChainNames } from './constants';

export default async function koi(browser: Browser): Promise<Boba[]> {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.koithe.com/en/global/koi-singapore',
    },
    {
      type: 'elementsQuery',
      selector: '.tab-pane.active .global-wrap .item',
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

  const chain = ChainNames.koi;
  const data = outlets.map((outlet) => Object.assign(outlet, { chain }));

  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
