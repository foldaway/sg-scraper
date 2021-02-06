/**
 * @callback QueryShapeProcessFunction
 * @param {string} queriedResult
 * @returns {string}
 */

import { first } from 'lodash';

/**
 * @callback EvaluateFunction
 * @param {object} prevResult result of the previous step
 * @param {object} [iteratee] iteratee (if running within a parent step)
 */

/**
 * @callback URLEvaluateFunction
 * @param {object} prevResult result of the previous step
 * @param {object} [iteratee] iteratee (if running within a parent step)
 * @returns {string}
 */

/**
 * @typedef Step
 * @property {('navigate'|'elementClick'|'elementWait'|'elementsQuery'|'elementQueryShape'|'elementScrollIntoView'|'iterator'|'evaluatePage'|'mutateResult')} type
 *
 * elementClick, elementWait, elementsQuery, elementScrollIntoView
 * @property {string} [selector] DOM selector
 * @property {('css'|'xpath')} [selectorType] type of the selector
 *
 * elementWait
 * @property {number} [timeout=5000] timeout for elementWait
 *
 * navigate
 * @property {string|URLEvaluateFunction} [url] url to navigate to
 *
 * evaluate
 * @property {EvaluateFunction} [evaluateFunc] function to be evaluated
 *
 * mutateResult
 * @property {EvaluateFunction} [mutateFunc] function to be evaluated. this function is expected to mutate the result from the last step
 *
 * iterator
 * @property {Step[]} [childSteps] steps to run for each iteratee
 *
 * elementsQuery
 * @property {('iteratee'|'document')} [querySource] whether to ignore the iteratee to query
 *
 * elementQueryShape
 * @property {Object.<string, string|[string, QueryShapeProcessFunction]>} [queryShape] element shape to return
 */

//@ts-check

/**
 * @param {any} obj
 * @returns {obj is String}
 */
const isString = (obj) => typeof obj === 'string';

/**
 * @param {any} obj
 * @returns {obj is Function}
 */
const isFunction = (obj) => obj instanceof Function;

/**
 * @param {any} obj
 * @returns {obj is Promise}
 */
const isAsyncFunction = (obj) => obj[Symbol.toStringTag] === 'AsyncFunction';
const generateRandomString = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * @async
 * @param {import('puppeteer').Browser} browser
 * @param {(Step)[]} steps
 * @param {object} initialResult an initial result to pass to the first step
 * @returns {Promise<object[]>}
 */
export default async function autoParse(browser, steps, initialResult = null) {
  const page = await browser.newPage();

  /**
   * Process a single step
   * @param {Step} step
   * @param {?object} prevResult result of the previous step
   * @param {object} iteratee (if this step is running as part of a parent iterator step)
   * @returns {Promise<?object>} result
   */
  async function handleStep(step, prevResult, iteratee = null) {
    console.log('Step', JSON.stringify(step));
    const {
      type,
      selector,
      selectorType = 'css',
      timeout = 5000,
      childSteps,
      evaluateFunc,
      mutateFunc,
      url,
      queryShape,
      querySource = 'iteratee', // will default to document if no iteratee
    } = step;

    const iteratorResults = [];
    const elementQueryShapeResult = {};

    switch (type) {
      case 'navigate':
        if (isString(url)) {
          await page.goto(url);
          break;
        } else if (isFunction(url)) {
          await page.goto(url(prevResult, iteratee));
          break;
        } else {
          console.error('Unexpected url key value:', url);
          break;
        }
        break;
      case 'elementClick':
        if (selector) {
          let element;
          if (selectorType === 'css') {
            element = await page.$(selector);
          } else {
            element = first(await page.$x(selector));
          }
          await element?.click();
        } else {
          await iteratee.click();
        }
        break;
      case 'elementWait':
        await page.waitForSelector(selector, { visible: true, timeout });
        break;
      case 'elementScrollIntoView':
        await page.evaluate((arg) => {
          if (arg instanceof HTMLElement) {
            arg.scrollIntoView();
          } else {
            document.querySelector(arg).scrollIntoView();
          }
        }, selector || iteratee);
        break;
      case 'elementsQuery':
        if (selectorType === 'xpath') {
          return ((querySource === 'iteratee' && iteratee) || page).$x(
            selector
          );
        }
        return ((querySource === 'iteratee' && iteratee) || page).$$(selector);
      case 'elementQueryShape':
        for (const key of Object.keys(queryShape)) {
          const value = queryShape[key];
          switch (true) {
            case isString(value):
              elementQueryShapeResult[key] = await page.evaluate(
                (elem, sel) =>
                  (elem || document).querySelector(sel)
                    ? (elem || document).querySelector(sel).textContent.trim()
                    : null,
                querySource === 'iteratee' && iteratee,
                //@ts-ignore
                value
              );
              break;
            case Array.isArray(value):
              elementQueryShapeResult[key] = await page.evaluate(
                (elem, sel) =>
                  (elem || document).querySelector(sel)
                    ? (elem || document).querySelector(sel).textContent.trim()
                    : null,
                querySource === 'iteratee' && iteratee,
                value[0]
              );
              //@ts-ignore
              elementQueryShapeResult[key] = value[1](
                elementQueryShapeResult[key]
              );
              break;
            default:
              console.error('Unexpected queryShape value type at key:', key);
              break;
          }
        }
        return elementQueryShapeResult;
      case 'evaluatePage':
        return page.evaluate(evaluateFunc, prevResult, iteratee);
      case 'iterator':
        if (!prevResult) {
          throw new Error(
            `prevResult is not a collection that is iterable: ${prevResult}`
          );
        }
        for (const item of prevResult) {
          let tempResult = null;
          for (const childStep of childSteps) {
            tempResult = await handleStep(childStep, tempResult, item);
          }
          iteratorResults.push(tempResult);
        }
        return iteratorResults;
      case 'mutateResult':
        return mutateFunc(prevResult);
      default:
        console.error('Unknown step type', type);
        break;
    }
    return null;
  }

  let result = initialResult;

  for (const step of steps) {
    try {
      result = await handleStep(step, result);
    } catch (e) {
      console.error('Last result before exception:', result);
      throw e;
    }
  }
  await page.close();

  return result;
}
