import Redis from 'ioredis';
import search, { Response } from '../onemap/onemap';

let client = new Redis(process.env.REDIS_URL);

client.on('error', () => {
  client = null;
  console.warn('[DEV] Error connecting to Redis, proceeding without it');
});

/**
 * Lookup a location (with Redis caching)
 * @param {string} rawText
 */
export default async function lookupLocation(
  rawText: string
): Promise<Response> {
  if (client != null) {
    const isCachedResultAvailable = await client.exists(rawText);

    if (isCachedResultAvailable) {
      return JSON.parse(await client.get(rawText));
    }
  }

  const results = await search(rawText);

  if (client != null) {
    await client.set(rawText, JSON.stringify(results));
    await client.quit();
  }
  return results;
}
