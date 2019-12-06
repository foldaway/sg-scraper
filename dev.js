/* eslint-disable no-restricted-syntax */
import puppeteer from 'puppeteer';
import repl from 'repl';
import MODULES from './modules.js';

const isProduction = process.env.NODE_ENV === 'production';

const MODULES_DATA_SOURCES = MODULES.map(module =>
  Object.keys(module)
    .filter(dataSource => dataSource !== 'toString')
    .map(dataSource => `${module}.${dataSource}`)
    .join(',')
);

console.log(`
sg-scraper dev mode
===================

Each module is an Object with data sources as their keys. For example,
the module 'boba' can have 'koi' as a key, and its value is an async function
that opens Chromium and scrapes data for return.

Available modules: ${MODULES.join(',')} (Object {})
Available data sources: ${MODULES_DATA_SOURCES} (async () => Promise<Any>)

Global browser object refers to the Puppeteer browser.

Example usage: await boba.gongCha(browser)
`);

const dev = async () => {
  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
  });

  const interpreter = repl.start();
  interpreter.setupHistory('.dev_repl_history', err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  interpreter.context.browser = browser;

  for (const module of MODULES) {
    interpreter.context[module] = module;
  }

  interpreter.on('exit', () => browser.close());
};

dev();
