import './model.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function gongCha(browser) {
  const page = await browser.newPage();
  await page.goto('http://www.gong-cha-sg.com/stores/');
  await page.waitForSelector('.item', { timeout: 5000 });
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('.item')];

    return items.map((item) => ({
      title: item.querySelector('.p-title').textContent,
      address: item.querySelector('.p-area').textContent,
      openingHours: item.querySelector('.p-time').textContent,
      chain: 'Gong Cha',
    }));
  });
}
