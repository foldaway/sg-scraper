import redis from 'redis';
import { promisify } from 'util';
import search from '../onemap/onemap.js';

/**
 * Lookup a location (with Redis caching)
 * @param {string} rawText
 */
export default async function lookupLocation(rawText) {
  const client = redis.createClient(process.env.REDIS_URL);

  // Promisify
  const existsA = promisify(client.exists).bind(client);
  const getA = promisify(client.get).bind(client);
  const setA = promisify(client.set).bind(client);
  const quitA = promisify(client.quit).bind(client);

  const results = await existsA(rawText)
    ? JSON.parse(await getA(rawText))
    : await search(rawText);
  await setA(rawText, JSON.stringify(results));
  await quitA();
  return results;
}
