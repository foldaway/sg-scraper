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
  params: Record<string, string | number> = {},
): Promise<Response<TResponse>> {
  const requestUrl = new URL(url);
  requestUrl.searchParams.set('resource_id', resource_id);
  for (const [key, value] of Object.entries(params)) {
    requestUrl.searchParams.set(key, String(value));
  }

  const response = await fetch(requestUrl);

  return response.json();
}
