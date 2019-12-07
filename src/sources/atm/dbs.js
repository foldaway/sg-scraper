import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function dbs(browser) {
  const atms = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.dbs.com.sg/index/locator.page',
    },
    {
      type: 'elementWait',
      selector: '.jspContainer',
    },
    {
      type: 'elementWait',
      selector: '#selectBranch',
    },
    {
      type: 'elementClick',
      selector: '#selectBranch',
    },
    {
      type: 'elementWait',
      selector: 'div.list-item[name="DBS"] .service-name',
    },
    {
      type: 'elementClick',
      selector: 'div.list-item[name="DBS"] .service-name',
    },
    {
      type: 'elementClick',
      selector: 'div.list-item[name="DL"] .service-name',
    },
    {
      type: 'elementClick',
      selector: 'div.list-item[name="ATM"] .service-name',
    },
    {
      type: 'elementClick',
      selector: '#listClose',
    },
    {
      type: 'elementWait',
      selector: '.address',
    },
    {
      type: 'elementsQuery',
      selector: '.navnum',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementClick',
        },
        {
          type: 'elementWait',
          selector: 'div.store',
        },
        {
          type: 'elementsQuery',
          selector: 'div.store',
          ignoreIteratee: true,
        },
        {
          type: 'iterator',
          childSteps: [
            {
              type: 'elementScrollIntoView',
            },
            {
              type: 'elementQueryShape',
              queryShape: {
                title: '.title',
                address: '.address',
                postalCode: '.postal_code',
              },
            },
          ],
        },
      ],
    },
  ]);

  const data = atms
    .flat()
    .map(atm =>
      Object.assign(atm, {
        address: `${atm.address}\n${atm.postalCode || ''}`,
        openingHours: '24/7',
        bank: 'DBS',
      })
    )
    .map(({postalCode, ...fields}) => ({...fields}));
  return Promise.map(data, autoLocation, {concurrency: 1});
}
