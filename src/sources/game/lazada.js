import Promise from 'bluebird';
import './model.js';
import autoLocation from '../../util/auto-location.js';
import autoParse from '../../util/auto-parse.js';

/**
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<Boba[]>}
 */
export default async function lazada(browser) {
  const product = await autoParse(browser, [
    {
      type: 'navigate',
      url: 'https://www.lazada.sg/products/switch-the-legend-of-zelda-breath-of-the-wild-standard-edition-i230274733-s352894076.html?spm=a2o42.searchlist.list.4.34d36a5bXB0fNH&search=1',
    },
    {
      type: 'elementWait',
      selector: '.pdp-block',
      timeout: 15000,
    },
    {
      type: 'elementsQuery',
      selector: '#container',
    },
    {
      type: 'iterator',
      childSteps: [
        {
          type: 'elementQueryShape',
          queryShape: {
            title: '.pdp-product-title',
            price: '.pdp-price_type_normal',
            seller: '.seller-name__detail'
          },
        },
      ],
    },
  ]);

  const data = product.map(outlet =>
    Object.assign(outlet, {
      datetime:  new Date().toLocaleString(),
    })
  );
  console.log(data);
  return data
  //return Promise.map(data, autoLocation, {concurrency: 1});

}
