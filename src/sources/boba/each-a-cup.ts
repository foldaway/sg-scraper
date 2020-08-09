/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { Boba } from './model.js';

const REGIONS = ['Central', 'North', 'West', 'East'];

export default async function eachACup(browser: Browser): Promise<Boba[]> {
  const outlets = await autoParse(
    browser,
    [
      {
        type: 'iterator',
        childSteps: [
          {
            type: 'navigate',
            url: (_, region) =>
              `http://www.each-a-cup.com/home/outlets/${region}`,
          },
          {
            type: 'elementWait',
            selector: '.service-item',
          },
          {
            type: 'elementsQuery',
            querySource: 'document',
            selector: '.service-item',
          },
          {
            type: 'iterator',
            childSteps: [
              {
                type: 'elementQueryShape',
                queryShape: {
                  title: 'h3',
                  address: 'p:nth-child(2)',
                  phone: 'p:nth-child(3)',
                },
              },
            ],
          },
        ],
      },
    ],
    REGIONS
  );

  const data = outlets
    .flat()
    .map((outlet) => Object.assign(outlet, { chain: 'Each-A-Cup' }));
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
