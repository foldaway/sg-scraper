import type { Point } from 'geojson';
import pLimit from 'p-limit';
import lookupLocation from '../location/lookup';
import postalCode from './postalCode';

const limit = pLimit(2);

interface AddressLike {
  address: string;
}

/**
 * Helper function to automatically set a place's address
 * to its OneMap lookup address
 */
export default async function autoLocation<T extends AddressLike>(
  obj: T,
): Promise<T & { location: Point | null }> {
  return limit(async () => {
    const addressLookup = await lookupLocation(
      postalCode(obj.address) || obj.address,
    );
    return {
      ...obj,
      location:
        addressLookup?.results?.length !== 0
          ? {
              type: 'Point',
              coordinates: [
                parseFloat(addressLookup.results[0].LONGITUDE),
                parseFloat(addressLookup.results[0].LATITUDE),
              ],
            }
          : null,
    };
  });
}
