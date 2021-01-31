import search, { Response } from '../onemap/onemap';

const CACHE: Record<string, Response> = {};

/**
 * Lookup a location (with ephemeral in-memory caching)
 * @param {string} rawText
 */
export default async function lookupLocation(
  rawText: string
): Promise<Response> {
  const isCachedResultAvailable = rawText in CACHE;

  if (isCachedResultAvailable) {
    return CACHE[rawText];
  }

  const results = await search(rawText);

  CACHE[rawText] = results;
  return results;
}
