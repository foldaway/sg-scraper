/**
 * @typedef {Object<string, object>} State
 * Object that contains state for the entire steps run
 */

/**
 * @callback QueryShapeProcessFunction
 * @param {string}
 */

/**
 * @callback EvaluateFunction
 * @param {State} state the current state of the object to be returned. contains state from previous steps.
 * @param {object} [evaluateArg] optional argument. within an iterable this is the collection item
 * @returns {string}
 */

/**
 * @typedef Step
 * @property {('navigate'|'elementClick'|'elementWait'|'elementsQuery'|'elementQueryShape'|'elementScrollIntoView'|'iterator'|'evaluatePage'|'mutateResult')} type
 * @property {string|IteratorTargetFunction} selector DOM selector
 * @property {boolean} isXPathSelector whether the selector is an XPath expression
 *
 * elementWait
 * @property {number} [timeout] timeout for wait
 *
 * navigate
 * @property {string|EvaluateFunction} [url]
 *
 * evaluate
 * @property {EvaluateFunction} [evaluateFunc]
 *
 * mutateResult
 * @property {EvaluateFunction} [mutateFunc]
 *
 * iterator
 * @property {Step[]} [childSteps]
 * @property {Step} [parent] parent step
 *
 * elementsQuery
 * @property {boolean} [ignoreIteratee] whether to ignore the iteratee to query
 *
 * elementQueryShape
 * @property {Object.<string, string>|[Object.<string, string>, QueryShapeProcessFunction]} [queryShape]
 */

const isString = obj => typeof obj === 'string';
const isFunction = obj => obj instanceof Function;
const isAsyncFunction = obj => obj[Symbol.toStringTag] === 'AsyncFunction';
const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);

/**
 * @async
 * @param {import('puppeteer').Browser} browser
 * @param {(Step)[]} steps
 * @returns {object[]}
 */
export default async function autoParse(browser, steps) {
  const page = await browser.newPage();

  /**
   * Process a single step
   * @param {Step} step
   * @param {?object} prevResult result of the previous step
   * @param {object} iteratee (if this step is running as part of a parent iterator step)
   * @returns {?object} result
   */
  async function handleStep(step, prevResult, iteratee = null) {
    console.log('Step', JSON.stringify(step));
    const {
      type,
      selector,
      isXPathSelector = false,
      timeout = 5000,
      childSteps,
      evaluateFunc,
      mutateFunc,
      url,
      queryShape,
      ignoreIteratee,
    } = step;

    const iteratorResults = [];
    const elementQueryShapeResult = {};

    switch (type) {
      case 'navigate':
        switch (true) {
          case isString(url):
            await page.goto(url);
            break;
          case isFunction(url):
            await page.goto(url(prevResult, iteratee));
            break;
          default:
            console.error('Unexpected url key value:', url);
            break;
        }
        break;
      case 'elementClick':
        if (selector) {
          await page.click(selector);
        } else {
          await iteratee.click();
        }
        break;
      case 'elementWait':
        await page.waitForSelector(selector, {visible: true, timeout});
        break;
      case 'elementScrollIntoView':
        await page.evaluate(arg => {
          if (arg instanceof HTMLElement) {
            arg.scrollIntoView();
          } else {
            document.querySelector(arg).scrollIntoView();
          }
        }, selector || iteratee);
        break;
      case 'elementsQuery':
        if (isXPathSelector) {
          return ((!ignoreIteratee && iteratee) || page).$x(selector);
        }
        return ((!ignoreIteratee && iteratee) || page).$$(selector);
      case 'elementQueryShape':
        for (const key of Object.keys(queryShape)) {
          const value = queryShape[key];
          switch (true) {
            case isString(value):
              elementQueryShapeResult[key] = await page.evaluate(
                (elem, sel) =>
                  elem.querySelector(sel) ? elem.querySelector(sel).textContent.trim() : null,
                iteratee || page,
                value
              );
              break;
            case Array.isArray(value):
              elementQueryShapeResult[key] = await page.evaluate(
                (elem, sel) =>
                  elem.querySelector(sel) ? elem.querySelector(sel).textContent.trim() : null,
                iteratee || page,
                value[0]
              );
              elementQueryShapeResult[key] = value[1](elementQueryShapeResult[key]);
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
          throw new Error('prevResult is not a collection that is iterable:', prevResult);
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

  let result = null;

  for (const step of steps) {
    result = await handleStep(step, result);
  }
  await page.close();

  return result;
}
