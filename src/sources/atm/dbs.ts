import Bluebird from 'bluebird';
import autoLocation from '../../util/autoLocation';
import autoParse from '../../util/auto-parse';
import { Browser } from 'puppeteer';
import { ATM } from './model';

export default async function dbs(browser: Browser): Promise<ATM[]> {
  const atms = await autoParse(browser, [
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
      selector: 'div.list-item[name="POSB"] .service-name',
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
      type: 'elementsQuery',
      selector: '.navnum',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementClick',
        },
        {
          type: 'elementWait',
          selector: 'div.store',
        },
        {
          type: 'elementsQuery',
          selector: 'div.store',
          querySource: 'document',
        },
        {
          type: 'iterator',
          childSteps: [
            {
              type: 'elementScrollIntoView',
            },
            {
              type: 'elementQueryShape',
              queryShape: {
                title: '.title',
                address: '.address',
                postalCode: '.postal_code',
              },
            },
          ],
        },
      ],
    },
  ]);

  const data = atms
    .flat()
    .map((atm) =>
      Object.assign(atm, {
        address: `${atm.address}\n${atm.postalCode || ''}`,
        opening_hours: '24/7',
        bank: 'DBS',
      })
    )
    .map(({ postalCode, ...fields }) => ({ ...fields }));
  return Bluebird.map(data, autoLocation, { concurrency: 1 });
}
