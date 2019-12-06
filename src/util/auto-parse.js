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
 * @property {('navigate'|'elementClick'|'elementWait'|'elementsQuery'|'elementQueryShape'|'elementScrollIntoView'|'iterator'|'evaluatePage'|'mutateState')} type
 * @property {string|IteratorTargetFunction} selector DOM selector
 *
 * (optional id)
 * @property {string} [id] id string used to store data in the returned object
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
 * mutateState
 * @property {EvaluateFunction} [mutateFunc]
 *
 * iterator
 * @property {Step[]} [childSteps]
 * @property {Step} [parent] parent step
 * @property {string} collectionId key to an collection in the state object
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

  let index = 0;

  /**
   * Process a single step
   * @param {Step} step
   * @param {object} state state object
   * @param {object} iteratee argument to pass to the function
   * @returns {State} mutated state
   */
  async function handleStep(step, state, iteratee = null) {
    console.log('Step', JSON.stringify(step));
    const {
      id = index.toString(),
      type,
      selector,
      timeout = 5000,
      childSteps,
      collectionId,
      evaluateFunc,
      mutateFunc,
      url,
      queryShape,
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
            await page.goto(url(state, iteratee));
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
        return Object.assign(state, {
          [id]: await (iteratee || page).$$(selector),
        });
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
        return Object.assign(state, {
          [id]: elementQueryShapeResult,
        });
      case 'evaluatePage':
        return Object.assign(state, {
          [id]: await page.evaluate(evaluateFunc, iteratee),
        });
      case 'iterator':
        if (!(collectionId in state)) {
          throw new Error(
            `The collectionId you specified does not exist in the state: '${collectionId}'`
          );
        }
        for (const item of state[collectionId]) {
          let tempState = {};
          for (const childStep of childSteps) {
            tempState = await handleStep(childStep, tempState, item);
          }
          iteratorResults.push(tempState);
        }
        return Object.assign(state, {
          [id]: iteratorResults,
        });
      case 'mutateState':
        return Object.assign(state, await mutateFunc(state));
      default:
        console.error('Unknown step type', type);
        break;
    }
    return state;
  }

  let rootState = {};

  for (const step of steps) {
    rootState = await handleStep(step, rootState);
    index += 1;
  }
  await page.close();

  return rootState;
}
