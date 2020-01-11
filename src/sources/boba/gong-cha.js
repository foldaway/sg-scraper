import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function gongCha(browser) {
  const outlets = await autoParse(browser, [
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
      type: 'elementsQuery',
      selector: '.item',
    },
    {
      type: 'iterator',
      childSteps: [
        {
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

  const data = outlets.map(outlet =>
    Object.assign(outlet, {
      chain: 'Gong Cha',
    })
  );
  return Promise.map(data, autoLocation, {concurrency: 1});
}
