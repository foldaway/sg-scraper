import puppeteer, { Browser } from 'puppeteer';
import blackball from './sources/boba/blackball';
import eachACup from './sources/boba/each-a-cup';
import koi from './sources/boba/koi';
import liho from './sources/boba/liho';
import gongCha from './sources/boba/gong-cha';

import { Boba } from './sources/boba/model';

import * as Sentry from '@sentry/node';
import { readStore, writeStore } from './output';
import chicha from './sources/boba/chicha';
import playmade from './sources/boba/playmade';

import hawkers from './sources/hawker';

import fs from 'fs';
import mrCoconut from './sources/boba/mr-coconut';
import { ChainName, ChainNames } from './sources/boba/constants';

const { NODE_ENV, SENTRY_DSN } = process.env;

const isProduction = NODE_ENV === 'production';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

try {
  fs.mkdirSync('traces');
} catch (e) {}

async function boba(browser: Browser) {
  async function tempFunc(
    chainName: ChainName,
    workFunc: (browser: Browser) => Promise<Boba[]>
  ) {
    try {
      console.log('Scraping: ', chainName);
      const data = await workFunc(browser);

      const store = readStore('boba.json');
      writeStore('boba.json', {
        ...store,
        [chainName]: data,
      });
      console.log('Completed: ', chainName);
    } catch (e) {
      console.error(e);
      Sentry?.captureException(e);
    }
  }

  await Promise.all([
    tempFunc(ChainNames.blackball, blackball),
    tempFunc(ChainNames.chicha, chicha),
    tempFunc(ChainNames.eachACup, eachACup),
    tempFunc(ChainNames.gongCha, gongCha),
    tempFunc(ChainNames.koi, koi),
    tempFunc(ChainNames.liho, liho),
    tempFunc(ChainNames.mrCoconut, mrCoconut),
    tempFunc(ChainNames.playmade, playmade),
  ]);
}

async function hawker() {
  try {
    const data = await hawkers();

    const store = readStore('hawker.json');
    writeStore('hawker.json', {
      hawker: data,
    });
  } catch (e) {
    console.log(e);
    Sentry?.captureException(e);
  }
}

async function scraper() {
  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
    args: isProduction ? ['--no-sandbox'] : [],
  });

  await boba(browser);
  await hawker();

  await browser.close();
}

scraper()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    Sentry?.captureException(e);
    process.exit(1);
  });
