import search, { Response } from '../onemap/onemap';
import redisClient from '../redisClient';

let isConnected = true;

redisClient.on('error', () => {
  isConnected = false;
  console.warn('[DEV] Error connecting to Redis, proceeding without it');
});

redisClient.on('end', () => {
  isConnected = false;
  console.warn('Disconnected from Redis, proceeding without it');
});

redisClient.on('connect', () => {
  isConnected = true;
});

/**
 * Lookup a location (with Redis caching)
 * @param {string} rawText
 */
export default async function lookupLocation(
  rawText: string
): Promise<Response> {
  if (isConnected) {
    const isCachedResultAvailable = await redisClient.exists(rawText);

    if (isCachedResultAvailable) {
      return JSON.parse(await redisClient.get(rawText));
    }
  }

  const results = await search(rawText);

  if (isConnected) {
    await redisClient.set(rawText, JSON.stringify(results));
    await redisClient.quit();
  }
  return results;
}
