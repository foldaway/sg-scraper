import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function gongCha(browser) {
  const {outlets} = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://www.gong-cha-sg.com/stores/',
    },
    {
      type: 'elementWait',
      selector: '.item',
      timeout: 15000,
    },
    {
      id: 'items',
      type: 'elementsQuery',
      selector: '.item',
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
            title: '.p-title',
            address: '.p-area',
            openingHours: '.p-time',
          },
        },
      ],
    },
  ]);

  const data = outlets.map(({outlet}) =>
    Object.assign(outlet, {
      chain: 'Gong Cha',
    })
  );
  return Promise.map(data, autoLocation, {concurrency: 1});
}
