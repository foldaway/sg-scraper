import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { Boba } from './model.js';

export default async function blackball(browser: Browser): Promise<Boba[]> {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://blackball.com.sg/index.php/outlet-location/',
    },
    {
      type: 'elementsQuery',
      selector: '.location',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: '.location-title-pro',
            address: '.location-address-pro',
            opening_hours: '.location-time-pro',
          },
        },
      ],
    },
  ]);

  const data = outlets.map((outlet) =>
    Object.assign(outlet, { chain: 'Blackball' })
  );
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
