import axios from 'axios';

interface Response<TResponse> {
  help: string;
  success: boolean;
  result?: {
    resource_id: string;
    fields: {
      type: string;
      id: string;
    }[];
    records: TResponse[];
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

export default async function dataGovApi<TResponse>(
  resource_id: string,
  params: Record<string, string | number> = {}
): Promise<Response<TResponse>> {
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
