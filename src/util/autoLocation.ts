import lookupLocation from '../location/lookup';
import postalCode from './postalCode';

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
    location:
      addressLookup?.results?.length !== 0
        ? {
            type: 'Point',
            coordinates: [
              addressLookup.results[0].LONGTITUDE,
              addressLookup.results[0].LATITUDE,
            ],
          }
        : null,
  });
}
