import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function koi(browser) {
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
            openingHours: '.txt',
          },
        },
      ],
    },
  ]);

  const data = outlets.map(outlet => Object.assign(outlet, {chain: 'KOI'}));

  return Promise.map(data, autoLocation, {concurrency: 1});
}
