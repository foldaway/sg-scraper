/**
 * @typedef {Object<string, object>} State
 * Object that contains state for the entire steps run
 */

/**
 * @callback ChildShapeKeyFunction
 * @param {HTMLElement} element
 * @returns undefined
 */

/**
 * @callback EvaluateFunction
 * @param {State} state the current state of the object to be returned. contains state from previous steps.
 * @param {object} [evaluateArg] optional argument. within an iterable this is the collection item
 * @returns {string}
 */

/**
 * @typedef Step
 * @property {('navigate'|'elementClick'|'elementWait'|'elementsQuery'|'iterator'|'evaluatePage'|'mutateState')} type
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
 * @property {EvaluateFunction} [func]
 *
 * iterator
 * @property {Step[]} [childSteps]
 * @property {Step} [parent] parent step
 * @property {string} collectionId key to an collection in the state object
 *
 * elementQuery
 * @ property {Object.<string, string|ChildShapeKeyFunction|Promise<HTMLElement>>} [childShape]
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
      func,
      url,
    } = step;

    const iteratorResults = [];

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
      case 'elementsQuery':
        return Object.assign(state, {
          [id]: await page.$$(selector),
        });
      case 'evaluatePage':
        return Object.assign(state, {
          [id]: await page.evaluate(func, iteratee),
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
        return Object.assign(state, await func(state));
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
