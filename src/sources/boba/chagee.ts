import assert from 'node:assert';
import type { Browser } from '@cloudflare/puppeteer';
import autoLocation from '../../util/autoLocation';
import { ChainNames } from './constants';
import type { Boba } from './model';

export default async function chagee(browser: Browser): Promise<Boba[]> {
  const page = await browser.newPage();

  await page.goto('https://www.chagee.com.sg/en/stores');
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('h4')).some((heading) =>
      heading.textContent?.trim().startsWith('CHAGEE'),
    ),
  );

  const chain = ChainNames.chagee;
  const outlets: Omit<Boba, 'location'>[] = await page.evaluate((chain) => {
    const outlets: Omit<Boba, 'location'>[] = [];
    const headings = document.querySelectorAll('h4');

    for (const heading of headings) {
      const title = heading.textContent?.trim() ?? '';
      const address =
        heading.parentElement?.querySelector('p')?.textContent?.trim() ?? '';

      if (!title.startsWith('CHAGEE') || address.length === 0) {
        continue;
      }

      outlets.push({
        title,
        address,
        openingHours: '',
        phone: '',
        chain,
      });
    }

    return outlets;
  }, chain);

  assert(outlets.length > 0, 'Expected at least one scraped outlet');
  await page.close();

  return Promise.all(outlets.map(autoLocation));
}
