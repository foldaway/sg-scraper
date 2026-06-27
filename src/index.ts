import { env } from 'cloudflare:workers';
import os from 'node:os';
import puppeteer, { type Browser } from '@cloudflare/puppeteer';
import { DateTime } from 'luxon';
import mustache from 'mustache';
import pLimit from 'p-limit';
import chicha from './sources/boba/chicha';
import { type ChainName, ChainNames } from './sources/boba/constants';
import eachACup from './sources/boba/each-a-cup';
import gongCha from './sources/boba/gong-cha';
import koi from './sources/boba/koi';
import kopifellas from './sources/boba/kopifellas';
import localCoffeePeople from './sources/boba/local-coffee-people';
import type { Boba } from './sources/boba/model';
import mrCoconut from './sources/boba/mr-coconut';
import playmade from './sources/boba/playmade';
import yakun from './sources/boba/yakun';
import hawkers from './sources/hawker';
import templateStr from './templates/index.mustache?raw';

const FileNames = {
  boba: 'boba.json' as const,
  hawker: 'hawker.json' as const,
};

const scraperLimit = pLimit(env.TIER === 'production' ? 10 : 1);

interface BobaScrapeResult {
  chainName: ChainName;
  data: Boba[];
}

interface BobaScrapeFailure {
  chainName: ChainName | 'Unknown';
  reason: unknown;
}

interface BobaScraper {
  chainName: ChainName;
  workFunc: (browser: Browser) => Promise<Boba[]>;
}

interface WorkSectionOptions {
  keepBrowserOpenInDevelopment?: boolean;
}

class WorkSectionError extends Error {
  readonly sectionName: string;
  readonly reason: unknown;
  readonly keepBrowserOpenInDevelopment: boolean;

  constructor(
    sectionName: string,
    reason: unknown,
    options: WorkSectionOptions = {},
  ) {
    super(`Failed to run ${sectionName} work section`);
    this.name = 'WorkSectionError';
    this.sectionName = sectionName;
    this.reason = reason;
    this.keepBrowserOpenInDevelopment =
      options.keepBrowserOpenInDevelopment ?? false;
  }
}

class BobaChainScrapeError extends Error {
  readonly chainName: ChainName;
  readonly reason: unknown;

  constructor(chainName: ChainName, reason: unknown) {
    super(`Failed to scrape ${chainName}`);
    this.name = 'BobaChainScrapeError';
    this.chainName = chainName;
    this.reason = reason;
  }
}

function shouldKeepBrowserOpen(error: unknown): boolean {
  return (
    env.TIER === 'development' &&
    error instanceof WorkSectionError &&
    error.keepBrowserOpenInDevelopment
  );
}

function logBrowserKeptOpen(error: unknown) {
  const sectionName =
    error instanceof WorkSectionError ? error.sectionName : 'work section';

  console.log(
    `Keeping browser open after ${sectionName} failure for debugging.`,
  );
}

async function runWorkSection<T>(
  sectionName: string,
  workFunc: () => Promise<T>,
  options?: WorkSectionOptions,
): Promise<T> {
  try {
    return await workFunc();
  } catch (e) {
    console.error(`Failed to run ${sectionName} work section`, e);
    throw new WorkSectionError(sectionName, e, options);
  }
}

async function boba(browser: Browser) {
  async function scrapeChain(
    chainName: ChainName,
    workFunc: (browser: Browser) => Promise<Boba[]>,
  ): Promise<BobaScrapeResult> {
    try {
      console.log('Scraping: ', chainName);
      const data = await workFunc(browser);

      console.log('Completed: ', chainName, 'with', data.length, 'outlets');
      return { chainName, data };
    } catch (e) {
      console.error(`Failed to scrape ${chainName}`, e);
      throw new BobaChainScrapeError(chainName, e);
    }
  }

  const scrapers: BobaScraper[] = [
    { chainName: ChainNames.chicha, workFunc: chicha },
    { chainName: ChainNames.eachACup, workFunc: eachACup },
    { chainName: ChainNames.gongCha, workFunc: gongCha },
    { chainName: ChainNames.koi, workFunc: koi },
    { chainName: ChainNames.mrCoconut, workFunc: mrCoconut },
    { chainName: ChainNames.playmade, workFunc: playmade },
    { chainName: ChainNames.kopifellas, workFunc: kopifellas },
    { chainName: ChainNames.yakun, workFunc: yakun },
    {
      chainName: ChainNames.localCoffeePeople,
      workFunc: localCoffeePeople,
    },
  ];

  const data: Record<ChainName, Boba[]> = {
    [ChainNames.blackball]: [],
    [ChainNames.kopifellas]: [],
    [ChainNames.localCoffeePeople]: [],
    [ChainNames.mrCoconut]: [],
    [ChainNames.playmade]: [],
    [ChainNames.koi]: [],
    [ChainNames.eachACup]: [],
    [ChainNames.gongCha]: [],
    [ChainNames.chicha]: [],
    [ChainNames.yakun]: [],
  };

  if (env.TIER === 'development') {
    for (const { chainName, workFunc } of scrapers) {
      const result = await scraperLimit(() => scrapeChain(chainName, workFunc));
      data[chainName] = result.data;
    }
  } else {
    const results = await Promise.all(
      scrapers.map(({ chainName, workFunc }) =>
        scraperLimit(() => scrapeChain(chainName, workFunc)).then(
          (value) => ({ status: 'fulfilled' as const, value }),
          (reason) => ({ status: 'rejected' as const, reason }),
        ),
      ),
    );

    const failures: BobaScrapeFailure[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        data[result.value.chainName] = result.value.data;
        continue;
      }

      if (result.reason instanceof BobaChainScrapeError) {
        failures.push({
          chainName: result.reason.chainName,
          reason: result.reason.reason,
        });
      } else {
        failures.push({
          chainName: 'Unknown',
          reason: result.reason,
        });
      }
    }

    if (failures.length > 0) {
      console.error(
        `Failed to scrape ${failures.length} boba chain${
          failures.length === 1 ? '' : 's'
        }; publishing successful results`,
        failures,
      );
    }
  }

  await env.OUTPUT_BUCKET.put(FileNames.boba, JSON.stringify(data), {
    httpMetadata: { contentType: 'application/json' },
  });
}

async function hawker() {
  const data = await hawkers();

  await env.OUTPUT_BUCKET.put(
    FileNames.hawker,
    JSON.stringify({ hawker: data }),
    {
      httpMetadata: { contentType: 'application/json' },
    },
  );
}

export default {
  async scheduled() {
    const browser = await puppeteer.launch(env.BROWSER);
    let closeBrowser = true;

    try {
      await runWorkSection('boba', () => boba(browser), {
        keepBrowserOpenInDevelopment: true,
      });
      await runWorkSection('hawker', hawker);

      // Generate index.html

      const now = DateTime.now();

      const generatedTime = {
        isoString: now.toISO(),
        displayText: now.toFormat('LLL d, yyyy, HH:mm ZZ'),
      };

      const osInfo = {
        platform: os.platform(),
        arch: os.arch(),
      };

      console.log({ generatedTime, osInfo });

      const files = Object.values(FileNames);

      const indexPage = mustache.render(templateStr, {
        files,
        osInfo,
        generatedTime,
      });

      await env.OUTPUT_BUCKET.put('index.html', indexPage, {
        httpMetadata: { contentType: 'text/html' },
      });
    } catch (e) {
      if (shouldKeepBrowserOpen(e)) {
        logBrowserKeptOpen(e);
        closeBrowser = false;
      }
      throw e;
    } finally {
      if (closeBrowser) {
        await browser.close();
      }
    }
  },
} satisfies ExportedHandler<Env>;
