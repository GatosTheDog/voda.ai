import { Asset } from '../types';

// The only keys ever persisted. Anything else in a request body is dropped.
export const ASSET_FIELDS: (keyof Omit<Asset, 'id'>)[] = [
  'name', 'type', 'status', 'lat', 'lng', 'installed_at', 'last_inspected_at', 'notes',
];

// Returns a copy of `input` containing only known asset fields that are defined.
export function pickAssetFields<T extends Partial<Omit<Asset, 'id'>>>(
  input: T,
): Partial<Omit<Asset, 'id'>> {
  const out: Partial<Omit<Asset, 'id'>> = {};
  for (const key of ASSET_FIELDS) {
    if (input[key] !== undefined) (out as Record<string, unknown>)[key] = input[key];
  }
  return out;
}
