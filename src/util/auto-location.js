import lookupLocation from '../location/lookup.js';
import postalCode from './postal-code.js';

/**
 * Helper function to automatically set a place's address
 * to its OneMap lookup address
 * @param {object} obj
 */
export default async function autoLocation(obj) {
  const addressLookup = await lookupLocation(postalCode(obj.address) || obj.address);
  return Object.assign(obj, {
    address: addressLookup ? addressLookup.results[0] : null,
  });
}
