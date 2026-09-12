export interface EpornerThumb {
  size: string;
  width: number;
  height: number;
  src: string;
}

export interface EpornerVideo {
  id: string;
  title: string;
  keywords: string;
  views: number;
  rate: string;
  url: string;
  added: string;
  length_sec: number;
  length_min: string;
  embed: string;
  default_thumb: EpornerThumb;
  thumbs: EpornerThumb[];
}

export interface EpornerSearchResponse {
  count: number;
  start: number;
  per_page: number;
  page: number;
  time_ms: number;
  total_count: number;
  total_pages: number;
  videos: EpornerVideo[];
}

export async function searchEporner(params: {
  query?: string;
  page?: number;
  perPage?: number;
  order?: string;
  thumbsize?: string;
}): Promise<EpornerSearchResponse> {
  const query = (params.query || 'indonesia').trim();
  const page = params.page || 1;
  const perPage = params.perPage || 24;
  const order = params.order || 'most-popular';
  const thumbsize = params.thumbsize || 'big';

  const url = new URL('https://www.eporner.com/api/v2/video/search/');
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('order', order);
  url.searchParams.set('thumbsize', thumbsize);
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Eporner API error: ${res.status}`);
  }

  return (await res.json()) as EpornerSearchResponse;
}

export async function getEpornerVideoById(id: string): Promise<EpornerVideo | null> {
  const url = new URL('https://www.eporner.com/api/v2/video/id/');
  url.searchParams.set('id', id);
  url.searchParams.set('thumbsize', 'big');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) return null;
  return (await res.json()) as EpornerVideo;
}
