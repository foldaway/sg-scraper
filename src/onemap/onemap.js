import axios from 'axios';
import querystring from 'querystring';

const BASE_URL = 'https://developers.onemap.sg';

/**
 * Search using Onemap.sg
 * @param {string} term
 */
export default async function search(term) {
  const query = {
    searchVal: term,
    returnGeom: 'Y',
    getAddrDetails: 'N',
    pageNum: '1',
  };
  const response = await axios.get(`${BASE_URL}/commonapi/search?${querystring.stringify(query)}`, {
    responseType: 'json',
  });
  return response.data;
}
