import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Asset, ListFilters, ListResult } from '../types';
import { pickAssetFields } from '../utils/sanitize';

const db = new Map<string, Asset>();

function loadSeed() {
  const seedPath = path.resolve(__dirname, '../../../seed.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const assets: Asset[] = JSON.parse(raw);
  for (const asset of assets) {
    db.set(asset.id, asset);
  }
}

loadSeed();

export function list(filters: ListFilters): ListResult {
  let assets = Array.from(db.values());

  if (filters.type) assets = assets.filter((a) => a.type === filters.type);
  if (filters.status) assets = assets.filter((a) => a.status === filters.status);
  if (filters.bbox) {
    const { minLng, minLat, maxLng, maxLat } = filters.bbox;
    assets = assets.filter(
      (a) => a.lat >= minLat && a.lat <= maxLat && a.lng >= minLng && a.lng <= maxLng,
    );
  }

  const total = assets.length;
  const start = (filters.page - 1) * filters.limit;
  return { data: assets.slice(start, start + filters.limit), total, page: filters.page, limit: filters.limit };
}

export function findById(id: string): Asset | undefined {
  return db.get(id);
}

export function create(input: Omit<Asset, 'id'>): Asset {
  const asset: Asset = { id: randomUUID(), ...(pickAssetFields(input) as Omit<Asset, 'id'>) };
  db.set(asset.id, asset);
  return asset;
}

export function update(id: string, patch: Partial<Omit<Asset, 'id'>>): Asset | undefined {
  const existing = db.get(id);
  if (!existing) return undefined;
  const updated: Asset = { ...existing, ...pickAssetFields(patch) };
  db.set(id, updated);
  return updated;
}

export function remove(id: string): boolean {
  return db.delete(id);
}
