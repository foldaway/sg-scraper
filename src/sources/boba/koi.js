import './model.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function koi(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.koithe.com/en/global/koi-singapore');
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('.global-wrap .item')];

    return items.map((item) => ({
      title: item.querySelector('.titlebox').textContent.trim(),
      address: item.querySelector('.txt a').textContent.trim(),
      phone: item.querySelector('.titlebox').textContent.trim(),
      openingHours: item.querySelector('.txt').textContent.trim(),
      chain: 'Koi',
    }));
  });
}
