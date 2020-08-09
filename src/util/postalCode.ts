/**
 * Extract postal code from a raw address string.
 * Returns null if none found
 */
export default function postalCode(rawAddress: string): string | null {
  const matches = rawAddress.match(/(\d{6})/);
  return matches ? matches[0] : null;
}
