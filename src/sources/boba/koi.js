import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function koi(browser) {
  const {outlets} = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.koithe.com/en/global/koi-singapore',
    },
    {
      id: 'items',
      type: 'elementsQuery',
      selector: '.global-wrap .item',
    },
    {
      id: 'outlets',
      type: 'iterator',
      collectionId: 'items',
      childSteps: [
        {
          id: 'outlet',
          type: 'elementQueryShape',
          queryShape: {
            title: '.titlebox',
            address: '.txt a',
            phone: '.titlebox',
            openingHours: '.txt',
          },
        },
        {
          type: 'mutateState',
          mutateFunc: state =>
            Object.assign(state, {
              outlet: Object.assign(state.outlet, {
                chain: 'KOI',
              }),
            }),
        },
      ],
    },
  ]);

  return Promise.map(outlets, ({outlet}) => autoLocation(outlet), {concurrency: 1});
}
