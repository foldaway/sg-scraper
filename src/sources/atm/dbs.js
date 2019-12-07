import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function dbs(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.dbs.com.sg/index/locator.page');
  await page.waitForSelector('.jspContainer', {timeout: 5000});
  await page.waitForSelector('#selectBranch', {timeout: 5000});

  // Filter to ATM
  await page.evaluate(() => {
    document.querySelector('#selectBranch').click();

    document.querySelector('div[name="DBS"] .service-name').click();
    document.querySelector('div[name="DL"] .service-name').click();
    document.querySelector('div[name="ATM"] .service-name').click();
    document.querySelector('#listClose').click();
  });

  await page.waitForSelector('.address', {timeout: 5000});

  const atms = await page.evaluate(async () => {
    const pageNumbers = [...document.querySelectorAll('.navnum')];
    return pageNumbers
      .map(pageNumElement => {
        pageNumElement.click();
        return [...document.querySelectorAll('div.store')].map(item => {
          item.scrollIntoView();

          const address = item.querySelector('.address');
          const postalCode = item.querySelector('.postal_code');

          return {
            title: item.querySelector('.title').textContent.trim(),
            address: `${address ? address.textContent.trim() : ''}\n${
              postalCode ? item.querySelector('.postal_code').textContent.trim() : ''
            }`,
            openingHours: '24/7',
            bank: 'DBS',
          };
        });
      })
      .reduce((a, b) => a.concat(b)); // flatten 2D array
  });

  await page.close();
  return Promise.map(atms, autoLocation, {concurrency: 1});
}
