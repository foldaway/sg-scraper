import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function ocbc(browser) {
  const {atms} = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.ocbc.com/personal-banking/locate-us.html',
    },
    {
      type: 'elementWait',
      selector: '#tab2',
    },
    {
      type: 'elementScrollIntoView',
      selector: '#tab2',
    },
    {
      type: 'elementClick',
      selector: '#tab2',
    },
    {
      id: 'addressColumns',
      type: 'elementsQuery',
      selector: '.address-column',
    },
    {
      id: 'atms',
      type: 'iterator',
      collectionId: 'addressColumns',
      childSteps: [
        {
          id: 'atm',
          type: 'elementQueryShape',
          queryShape: {
            title: 'font',
            address: ['font', location => location.match(/(\d{6})/)[0]],
          },
        },
        {
          type: 'mutateState',
          mutateFunc: state =>
            Object.assign(state, {
              atm: Object.assign(state.atm, {
                openingHours: '24/7',
                bank: 'OCBC',
              }),
            }),
        },
      ],
    },
  ]);

  return Promise.map(atms, ({atm}) => autoLocation(atm), {concurrency: 1});
}
