/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function sharetea(browser) {
  const page = await browser.newPage();
  await page.goto('http://www.1992sharetea.com/locations');
  await page.waitForSelector('.fr-box', {timeout: 5000});

  const urls = await page.evaluate(() => {
    const items = [];
    const xPathResult = document.evaluate(
      "//*[contains(text(), 'Singapore')]/../../p/a",
      document,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    let node = xPathResult.iterateNext();
    while (node) {
      items.push(node);
      node = xPathResult.iterateNext();
    }

    return items
      .filter(item => item.offsetHeight !== 0) // Filter out weird hidden outlet
      .map(item => item.getAttribute('href'));
  });

  const items = [];

  for (const url of urls) {
    await page.goto(url);
    const outlet = await page.evaluate(() => ({
      title: document
        .querySelector('.wpsl-locations-details > span:first-child')
        .textContent.trim(),
      address: document.querySelector('.wpsl-location-address').textContent.trim(),
      openingHours: document.querySelector('.wpsl-opening-hours').textContent.trim(),
      chain: 'ShareTea',
    }));
    items.push(outlet);
  }

  await page.close();
  return Promise.map(items, autoLocation, {concurrency: 1});
}
