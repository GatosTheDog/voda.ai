export type AssetType = 'pipe' | 'hydrant' | 'sensor' | 'valve';
export type AssetStatus = 'ok' | 'warning' | 'critical';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installed_at: string;
  last_inspected_at: string | null;
  notes: string;
}

export interface AssetListResponse {
  data: Asset[];
  total: number;
  page: number;
  limit: number;
}

export interface AssetFilters {
  type?: AssetType | '';
  status?: AssetStatus | '';
  bbox?: string;
  page?: number;
  limit?: number;
}
