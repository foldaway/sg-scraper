import Redis from 'ioredis';
import search, { Response } from '../onemap/onemap';

/**
 * Lookup a location (with Redis caching)
 * @param {string} rawText
 */
export default async function lookupLocation(
  rawText: string
): Promise<Response> {
  const client = new Redis(process.env.REDIS_URL);

  const results = (await client.exists(rawText))
    ? JSON.parse(await client.get(rawText))
    : await search(rawText);
  await client.set(rawText, JSON.stringify(results));
  await client.quit();
  return results;
}
