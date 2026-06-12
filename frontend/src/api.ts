import { Asset, AssetFilters, AssetListResponse } from './types';

const BASE = '/api/assets';

function buildQuery(filters: AssetFilters): string {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.status) params.set('status', filters.status);
  if (filters.bbox) params.set('bbox', filters.bbox);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

export async function listAssets(filters: AssetFilters = {}): Promise<AssetListResponse> {
  const res = await fetch(`${BASE}${buildQuery(filters)}`);
  return parseResponse<AssetListResponse>(res);
}

export async function getAsset(id: string): Promise<Asset> {
  const res = await fetch(`${BASE}/${id}`);
  const body = await parseResponse<{ data: Asset }>(res);
  return body.data;
}

export async function createAsset(input: Omit<Asset, 'id'>): Promise<Asset> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await parseResponse<{ data: Asset }>(res);
  return body.data;
}

export async function updateAsset(id: string, input: Partial<Omit<Asset, 'id'>>): Promise<Asset> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await parseResponse<{ data: Asset }>(res);
  return body.data;
}

export async function deleteAsset(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}
