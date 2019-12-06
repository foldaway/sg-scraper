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
  return Promise.map(outlets, ({outlet}) => autoLocation(outlet), {concurrency: 1});
}
