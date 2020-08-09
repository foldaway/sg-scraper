import lookupLocation from '../location/lookup.js';
import postalCode from './postalCode.js';

/**
 * Helper function to automatically set a place's address
 * to its OneMap lookup address
 */
export default async function autoLocation<T>(
  obj: T & { address: string }
): Promise<T> {
  const addressLookup = await lookupLocation(
    postalCode(obj.address) || obj.address
  );
  return Object.assign(obj, {
    location: addressLookup ? addressLookup.results[0] : null,
  });
}
