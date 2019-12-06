import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function dbs(browser) {
  const {atms} = await autoParse(browser, [
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
      id: 'pageNumbers',
      type: 'elementsQuery',
      selector: '.navnum',
    },
    {
      id: 'atms',
      type: 'iterator',
      collectionId: 'pageNumbers',
      childSteps: [
        {
          type: 'elementClick',
        },
        {
          type: 'elementWait',
          selector: 'div.store',
        },
        {
          id: 'stores',
          type: 'elementsQuery',
          selector: 'div.store',
        },
        {
          id: 'atmsChunk',
          type: 'iterator',
          collectionId: 'stores',
          childSteps: [
            {
              id: 'atm',
              type: 'evaluatePage',
              func: iteratee => {
                iteratee.scrollIntoView();

                const address = iteratee.querySelector('.address');
                const postalCode = iteratee.querySelector('.postal_code');

                return {
                  title: iteratee.querySelector('.title').textContent.trim(),
                  address: `${address ? address.textContent.trim() : ''}\n${
                    postalCode ? iteratee.querySelector('.postal_code').textContent.trim() : ''
                  }`,
                  openingHours: '24/7',
                  bank: 'DBS',
                };
              },
            },
          ],
        }
      ],
    },
    {
      type: 'mutateState',
      func: state =>
        Object.assign(state, {
          atms: state.atms.map(atm => atm.atmsChunk).reduce((a, b) => a.concat(b)),
        }),
    },
  ]);

  return Promise.map(atms, ({atm}) => autoLocation(atm), {concurrency: 1});
}
