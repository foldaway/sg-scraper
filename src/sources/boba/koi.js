import puppeteer from 'puppeteer';
import './model.js';

/**
 * @returns {Promise<Boba>}
 */
export default async function koi() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.koithe.com/en/global/koi-singapore');
  const outlets = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.global-wrap .item')];

    return items.map((item) => ({
      title: item.querySelector('.titlebox').textContent.trim(),
      address: item.querySelector('.txt a').textContent.trim(),
      phone: item.querySelector('.titlebox').textContent.trim(),
      openingHours: item.querySelector('.txt').textContent.trim(),
      chain: 'Koi',
    }));
  });
  await browser.close();
  return outlets;
}
