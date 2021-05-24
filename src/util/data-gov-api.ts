import axios from 'axios';

interface Response {
  help: string;
  success: boolean;
  result?: {
    resouce_id: string;
    fields: {
      type: string;
      id: string;
    }[];
    records: Record<string, unknown>[];
    _links: {
      start: string;
      next: string;
    };
    filters?: Record<string, unknown>[];
    limit?: number;
    total: number;
  };
  error?: Record<string, unknown>;
}

const url = 'https://data.gov.sg/api/action/datastore_search';

export default async function autoParse(
  resource_id: string,
  params: Record<string, string | number> = {}
): Promise<Response> {
  const query = {
    resource_id,
    ...params,
  };
  const response = await axios.get(url, {
    responseType: 'json',
    params: query,
  });

  return response.data;
}
