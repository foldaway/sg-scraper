import { Browser, ElementHandle } from 'puppeteer';
import first from 'lodash/first';

type SelectorType = 'css' | 'xpath';

type Step<TContext> =
  | {
      type: 'navigate';
      url: string;
    }
  | {
      type: 'navigate';
      url: (context: TContext) => string;
    }
  | {
      type: 'elementClick' | 'elementScrollIntoView';
      selector: string;
      selectorType?: SelectorType;
    }
  | {
      type: 'elementWait';
      selector: string;
      selectorType?: SelectorType;
      timeout?: number;
    }
  | {
      type: 'elementsQuery';
      selector: string;
      selectorType?: SelectorType;
      childSteps: Step<TContext>[];
    }
  | {
      type: 'elementQueryShape';
      queryShape: Record<string, string>;
    };

export default async function autoParse<TContext>(
  browser: Browser,
  steps: Step<TContext>[],
  context?: TContext
) {
  const page = await browser.newPage();

  for (const step of steps) {
    switch (step.type) {
      case 'navigate': {
        if (typeof step.url === 'string') {
          await page.goto(step.url);
        } else {
          await page.goto(step.url(context));
        }
        break;
      }
      case 'elementWait': {
        switch (step.selectorType) {
          case 'xpath': {
            await page.waitForXPath(step.selector, {
              timeout: step.timeout ?? 5000,
            });
            break;
          }
          default: {
            await page.waitForSelector(step.selector, {
              timeout: step.timeout ?? 5000,
            });
            break;
          }
        }
      }
      case 'elementClick': {
        let element: ElementHandle<Element>;

        switch (step.selectorType) {
          case 'xpath': {
            element = first(await page.$x(step.selector));
            break;
          }
          default: {
            element = await page.$(step.selector);
            break;
          }
        }

        await element.click();
        break;
      }
      case 'elementScrollIntoView': {
        await page.evaluate(
          (selector, selectorType) => {
            let element: Node;

            switch (selectorType) {
              case 'xpath': {
                element = document.evaluate(
                  selector,
                  document,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE,
                  null
                ).singleNodeValue;

                break;
              }
              default: {
                element = document.querySelector(selector);
                break;
              }
            }

            if (element instanceof HTMLElement) {
              element.scrollIntoView();
            }
          },
          [step.selector, step.selectorType ?? 'css']
        );
        break;
      }
    }
  }
}
