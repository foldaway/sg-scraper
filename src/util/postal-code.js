/**
 * Extract postal code from a raw address string.
 * Returns null if none found
 * @param {string} rawAddress
 */
export default function postalCode(rawAddress) {
  const matches = rawAddress.match(/(\d{6})/);
  return matches ? matches[0] : null;
}
