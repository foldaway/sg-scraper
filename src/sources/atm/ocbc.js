import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function ocbc(browser) {
  const atms = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.ocbc.com/personal-banking/locate-us.html',
    },
    {
      type: 'elementWait',
      selector: '#locator-atms',
    },
    {
      type: 'elementScrollIntoView',
      selector: '#locator-atms',
    },
    {
      type: 'elementClick',
      selector: '#locator-atms',
    },
    {
      type: 'elementsQuery',
      selector: '.com__ll-set',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: 'strong',
            address: 'h6',
          },
        },
      ],
    },
  ]);

  const data = atms.map(atm =>
    Object.assign(atm, {
      openingHours: '24/7',
      bank: 'OCBC',
    })
  );
  return Promise.map(data, autoLocation, {concurrency: 1});
}
