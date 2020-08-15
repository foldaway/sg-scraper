import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { Boba } from './model';

export default async function sharetea(browser: Browser): Promise<Boba[]> {
  const outlets = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'http://www.1992sharetea.com/locations',
    },
    {
      type: 'elementWait',
      selector: '.fr-box',
    },
    {
      type: 'elementsQuery',
      selector: `//*[contains(text(), 'Singapore')]/../../p/a`,
      selectorType: 'xpath',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'evaluatePage',
          evaluateFunc: (_, elem) => elem.getAttribute('href'),
        },
      ],
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'navigate',
          url: (_, href) => href,
        },
        {
          type: 'elementQueryShape',
          querySource: 'document',
          queryShape: {
            title: '.elementor-heading-title',
            address: '.wpsl-location-address',
            opening_hours: '.wpsl-opening-hours',
          },
        },
      ],
    },
  ]);

  const data = outlets.map((outlet) =>
    Object.assign(outlet, { chain: 'ShareTea' })
  );
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
