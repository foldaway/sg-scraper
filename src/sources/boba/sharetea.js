import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function sharetea(browser) {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://www.1992sharetea.com/locations',
    },
    {
      type: 'elementWait',
      selector: '.fr-box',
    },
    {
      type: 'elementsQuery',
      selector: `//*[contains(text(), 'Singapore')]/../../p/a`,
      isXPathSelector: true,
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'evaluatePage',
          evaluateFunc: (_, elem) => elem.getAttribute('href'),
        },
      ],
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'navigate',
          url: (_, href) => href,
        },
        {
          type: 'elementQueryShape',
          ignoreIteratee: true,
          queryShape: {
            title: '.wpsl-locations-details > span:first-child',
            address: '.wpsl-location-address',
            openingHours: '.wpsl-opening-hours',
          },
        },
      ],
    },
  ]);

  const data = outlets.map(outlet => Object.assign(outlet, {chain: 'ShareTea'}));
  return Promise.map(data, autoLocation, {concurrency: 1});
}
