import { env } from 'cloudflare:workers';

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
  const requestUrl = new URL(
    '/api/common/elastic/search',
    env.ONEMAP_PROXY_URL,
  );
  requestUrl.searchParams.set('searchVal', term);
  requestUrl.searchParams.set('returnGeom', 'Y');
  requestUrl.searchParams.set('getAddrDetails', 'N');
  requestUrl.searchParams.set('pageNum', '1');
  const response = await fetch(requestUrl, {
    headers: {
      Authorization: `Bearer ${env.ONEMAP_PROXY_API_KEY}`,
    },
  });
  if (!response.ok) {
    console.log(response, await response.text());
  }
  return response.json();
}
