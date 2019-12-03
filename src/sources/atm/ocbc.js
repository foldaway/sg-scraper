import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function ocbc(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.ocbc.com/personal-banking/locate-us.html');
  await page.waitForSelector('#tab2', { timeout: 5000 });
  const atms = await page.evaluate(() => {
    const listViewButton = document.querySelector('#tab2');
    listViewButton.scrollIntoView();
    listViewButton.click();
    const items = [...document.querySelectorAll('.address-column')];

    return items.map((item) => {
      const location = item.querySelector('font').textContent.trim();
      return {
        location,
        address: location.match(/(\d{6})/)[0],
        openingHours: '24/7',
        bank: 'OCBC',
      };
    });
  });

  return Promise.map(atms, autoLocation, { concurrency: 1 });
}
