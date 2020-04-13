/* eslint-disable no-shadow */
import './model.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {<any[]>}
 */
export default async function bug(browser) {
  const bugs = await autoParse(browser, [
    {
      type: 'navigate',
      url:
        'https://www.polygon.com/animal-crossing-new-horizons-switch-acnh-guide/2020/3/24/21191276/insect-bug-locations-times-month-day-list-critterpedia',
    },
    {
      type: 'elementsQuery',
      selector: 'tr',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            name: 'td:nth-child(2)',
            location: 'td:nth-child(3)',
            sellPrice: 'td:nth-child(4)',
            season: 'td:nth-child(6)',
            time: 'td:nth-child(5)',
          },
        },
      ],
    },
  ]);

  const data = bugs.filter(bug => bug.name !== null).map(bug => Object.assign(bug, {type: 'Bug'}));
  return data;
}
