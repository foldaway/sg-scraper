/* eslint-disable no-shadow */
import './model.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {<any[]>}
 */
export default async function fish(browser) {
  const fishes = await autoParse(browser, [
    {
      type: 'navigate',
      url:
        'https://www.polygon.com/animal-crossing-new-horizons-switch-acnh-guide/2020/3/23/21190775/fish-locations-times-month-day-list-critterpedia',
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
            sellPrice: 'td:nth-child(5)',
            season: 'td:nth-child(7)',
            time: 'td:nth-child(6)',
          },
        },
      ],
    },
  ]);

  const data = fishes
    .filter(fish => fish.name !== null)
    .map(fish => Object.assign(fish, {type: 'Fish'}));
  return data;
}
