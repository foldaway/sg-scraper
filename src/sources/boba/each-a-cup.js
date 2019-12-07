/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

const REGIONS = ['Central', 'North', 'West', 'East'];

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function eachACup(browser) {
  const outlets = await autoParse(
    browser,
    [
      {
        type: 'iterator',
        childSteps: [
          {
            type: 'navigate',
            url: (_, region) => `http://www.each-a-cup.com/home/outlets/${region}`,
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

  const data = outlets.flat().map(outlet => Object.assign(outlet, {chain: 'Each-A-Cup'}));
  return Promise.map(data, autoLocation, {concurrency: 1});
}
