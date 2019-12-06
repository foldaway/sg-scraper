import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function blackball(browser) {
  const {outlets} = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://blackball.com.sg/index.php/outlet-location/',
    },
    {
      id: 'locations',
      type: 'elementsQuery',
      selector: '.location',
    },
    {
      id: 'outlets',
      type: 'iterator',
      collectionId: 'locations',
      childSteps: [
        {
          id: 'outlet',
          type: 'evaluatePage',
          evaluateFunc: location => ({
            title: location.querySelector('.location-title-pro').textContent.trim(),
            address: location.querySelector('.location-address-pro').textContent.trim(),
            openingHours: location.querySelector('.location-time-pro').textContent.trim(),
          }),
        },
      ],
    },
  ]);
  return Promise.map(outlets, ({outlet}) => autoLocation(outlet), {concurrency: 1});
}
