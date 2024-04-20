import axios from 'axios';
import querystring from 'querystring';

const BASE_URL = 'https://www.onemap.gov.sg';

export interface Response {
  found: number;
  totalNumPages: number;
  pageNum: number;
  results: Result[];
}

export interface Result {
  SEARCHVAL: string;
  X: string;
  Y: string;
  LATITUDE: string;
  LONGITUDE: string;
}

/**
 * Search using Onemap.sg
 */
export default async function search(term: string): Promise<Response> {
  const query = {
    searchVal: term,
    returnGeom: 'Y',
    getAddrDetails: 'N',
    pageNum: '1',
  };
  const response = await axios.get(
    `${BASE_URL}/api/common/elastic/search?${querystring.stringify(query)}`,
    {
      responseType: 'json',
    }
  );
  return response.data;
}
