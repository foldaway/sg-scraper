import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { Boba } from './model';

export default async function gongCha(browser: Browser): Promise<Boba[]> {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://www.gong-cha-sg.com/stores/',
    },
    {
      type: 'elementWait',
      selector: '.item',
      timeout: 15000,
    },
    {
      type: 'elementsQuery',
      selector: '.item',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: '.p-title',
            address: '.p-area',
            opening_hours: '.p-time',
          },
        },
      ],
    },
  ]);

  const data = outlets.map((outlet) =>
    Object.assign(outlet, {
      chain: 'Gong Cha',
    })
  );
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
