import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { ATM } from './model';

export default async function ocbc(browser: Browser): Promise<ATM[]> {
  const atms = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.ocbc.com/personal-banking/locate-us.html',
    },
    {
      type: 'elementWait',
      selector: '#locator-atms',
    },
    {
      type: 'elementScrollIntoView',
      selector: '#locator-atms',
    },
    {
      type: 'elementClick',
      selector: '#locator-atms',
    },
    {
      type: 'elementsQuery',
      selector: '.com__ll-set',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: 'strong',
            address: 'h6',
          },
        },
      ],
    },
  ]);

  const data = atms.map((atm) =>
    Object.assign(atm, {
      opening_hours: '24/7',
      bank: 'OCBC',
    })
  );
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
