import './model.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function blackball(browser) {
  const page = await browser.newPage();
  await page.goto('http://blackball.com.sg/index.php/outlet-location/');
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('.location')];

    return items.map((item) => ({
      title: item.querySelector('.location-title-pro').textContent.trim(),
      address: item.querySelector('.location-address-pro').textContent.trim(),
      openingHours: item.querySelector('.location-time-pro').textContent.trim(),
      chain: 'BlackBall',
    }));
  });
}
