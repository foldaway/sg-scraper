/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function liho(browser) {
  const page = await browser.newPage();
  await page.goto('http://www.streetdirectory.com/businessfinder/company_branch/163304/5890/');
  await page.waitForSelector('#company_branch_container tr[id]', {timeout: 5000});
  const outlets = await page.evaluate(() => {
    const items = [...document.querySelectorAll('#company_branch_container tr[id]')];

    return items.map(item => ({
      title: item.querySelector('.company_branch_name').textContent.trim(),
      address: item.querySelector('.company_branch_address').innerText.trim(),
      phone: item.querySelector('.company_branch_phone')
        ? item
            .querySelector('.company_branch_phone')
            .textContent.trim()
            .replace(/^-\s?/, '')
        : null,
      chain: 'LiHO',
    }));
  });

  await page.close();
  return Promise.map(outlets, autoLocation, {
    concurrency: 1,
  });
}
