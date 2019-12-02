/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import './model.js';

const REGIONS = [
  'Central',
  'North',
  'West',
  'East',
];

const TITLE_REGEX = new RegExp(/\(([\w\s]*)\)/);

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function eachACup(browser) {
  const page = await browser.newPage();
  const data = [];
  for (const region of REGIONS) {
    await page.goto(`http://www.each-a-cup.com/home/outlets/${region}`);
    await page.waitForSelector('.service-item', { timeout: 5000 });

    const results = await page.evaluate(() => {
      const items = [...document.querySelectorAll('.service-item')];

      return items.map((item) => ({
        title: item.querySelector('h3').textContent.trim(),
        address: item.querySelector('p:nth-child(2)').textContent.trim(),
        phone: item.querySelector('p:nth-child(3)').textContent.trim(),
        chain: 'Each-A-Cup',
      }));
    });
    data.push(...results);
  }

  return data;
}
