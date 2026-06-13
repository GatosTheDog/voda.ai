import { pickAssetFields, ASSET_FIELDS } from '../sanitize';

describe('pickAssetFields', () => {
  it('keeps all known asset fields', () => {
    const input = {
      name: 'S-1',
      type: 'sensor',
      status: 'ok',
      lat: 40.75,
      lng: -73.98,
      installed_at: '2024-01-01',
      last_inspected_at: null,
      notes: 'hi',
    } as const;
    expect(pickAssetFields(input)).toEqual(input);
  });

  it('drops unknown fields', () => {
    const out = pickAssetFields({ name: 'S-1', hacker: true, __proto__: {} } as never);
    expect(out).toEqual({ name: 'S-1' });
    expect('hacker' in out).toBe(false);
  });

  it('drops a forged id', () => {
    const out = pickAssetFields({ id: 'forged', name: 'S-1' } as never);
    expect('id' in out).toBe(false);
    expect(out).toEqual({ name: 'S-1' });
  });

  it('omits keys that are undefined (partial patch)', () => {
    const out = pickAssetFields({ status: 'warning' });
    expect(out).toEqual({ status: 'warning' });
    expect('name' in out).toBe(false);
    expect('lat' in out).toBe(false);
  });

  it('keeps an explicit null for last_inspected_at', () => {
    const out = pickAssetFields({ last_inspected_at: null });
    expect(out).toEqual({ last_inspected_at: null });
  });

  it('returns an empty object for empty input', () => {
    expect(pickAssetFields({})).toEqual({});
  });

  it('exposes the whitelist for reference', () => {
    expect(ASSET_FIELDS).toContain('name');
    expect(ASSET_FIELDS).not.toContain('id');
  });
});
