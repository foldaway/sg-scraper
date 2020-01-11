import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function blackball(browser) {
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
            openingHours: '.location-time-pro',
          },
        },
      ],
    },
  ]);

  const data = outlets.map(outlet => Object.assign(outlet, {chain: 'Blackball'}));
  return Promise.map(data, autoLocation, {concurrency: 1});
}
