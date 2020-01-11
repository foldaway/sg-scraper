import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function liho(browser) {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://www.streetdirectory.com/businessfinder/company_branch/163304/5890/',
    },
    {
      type: 'elementWait',
      selector: '#company_branch_container tr[id]',
    },
    {
      type: 'elementsQuery',
      selector: '#company_branch_container tr[id]',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: '.company_branch_name',
            address: '.company_branch_address',
            phone: [
              '.company_branch_phone',
              result => (result ? result.replace(/^-\s?/, '') : null),
            ],
          },
        },
      ],
    },
  ]);

  const data = outlets.map(outlet => Object.assign(outlet, {chain: 'LiHO'}));
  return Promise.map(data, autoLocation, {
    concurrency: 1,
  });
}
