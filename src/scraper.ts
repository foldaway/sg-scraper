import 'ts-polyfill/lib/es2019-array';
import {
  ACCollectibleType,
  ACCollectible,
  Bank,
  BankATM,
  BobaChain,
  BobaOutlet,
} from './models';
import puppeteer, { Browser } from 'puppeteer';
import dbs from './sources/atm/dbs';
import ocbc from './sources/atm/ocbc';
import blackball from './sources/boba/blackball';
import eachACup from './sources/boba/each-a-cup';
import koi from './sources/boba/koi';
import liho from './sources/boba/liho';
import sharetea from './sources/boba/sharetea';
import bug from './sources/acnh/bug';
import fish from './sources/acnh/fish';
import gongCha from './sources/boba/gong-cha';

import { Boba } from './sources/boba/model';
import { ATM } from './sources/atm/model';
import { Item } from './sources/acnh/model';

import * as Sentry from '@sentry/node';

const { NODE_ENV, SENTRY_DSN } = process.env;

const isProduction = NODE_ENV === 'production';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

async function atm(browser: Browser) {
  const tempFunc = async (
    bankName: string,
    workFunc: (browser: Browser) => Promise<ATM[]>
  ) => {
    const [bank] = await Bank.findOrCreate({
      where: {
        name: bankName,
      },
    });

    const atms = await workFunc(browser);

    for (const atm of atms) {
      await BankATM.upsert({
        ...atm,
        bank_id: bank.id,
      });
    }
  };

  await Promise.all([tempFunc('DBS', dbs), tempFunc('OCBC', ocbc)]);
}

async function boba(browser: Browser) {
  const tempFunc = async (
    chainName: string,
    workFunc: (browser: Browser) => Promise<Boba[]>
  ) => {
    const [chain] = await BobaChain.findOrCreate({
      where: {
        name: chainName,
      },
    });

    const outlets = await workFunc(browser);
    for (const outlet of outlets) {
      await BobaOutlet.upsert({
        ...outlet,
        boba_chain_id: chain.id,
      });
    }
  };

  await Promise.all([
    tempFunc('BlackBall', blackball),
    tempFunc('Each-A-Cup', eachACup),
    tempFunc('Gong Cha', gongCha),
    tempFunc('Koi', koi),
    tempFunc('LiHO', liho),
    tempFunc('ShareTea', sharetea),
  ]);
}

async function acnh(browser: Browser) {
  const tempFunc = async (
    typeName: string,
    workFunc: (browser: Browser) => Promise<Item[]>
  ) => {
    const [collectibleType] = await ACCollectibleType.findOrCreate({
      where: {
        name: typeName,
      },
    });

    const collectibles = await workFunc(browser);
    for (const collectible of collectibles) {
      await ACCollectible.upsert({
        ...collectible,
        type_id: collectibleType.id,
      });
    }
  };

  await Promise.all([tempFunc('Bug', bug), tempFunc('Fish', fish)]);
}

async function scraper() {
  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
  });

  await atm(browser);
  await boba(browser);
  await acnh(browser);

  await browser.close();
}

scraper()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    Sentry?.captureException(e);
    process.exit(1);
  });
