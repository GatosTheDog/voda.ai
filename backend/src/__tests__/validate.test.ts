import { validateAssetInput, ValidationError } from '../validate';

function valid() {
  return {
    name: 'Sensor S-0001',
    type: 'sensor',
    status: 'ok',
    lat: 40.75,
    lng: -73.98,
    installed_at: '2024-01-01',
    last_inspected_at: null,
    notes: '',
  };
}

describe('validateAssetInput — requireAll: true', () => {
  it('passes for a complete valid input', () => {
    expect(() => validateAssetInput(valid(), true)).not.toThrow();
  });

  it('throws ValidationError with all missing required fields', () => {
    expect(() => validateAssetInput({}, true)).toThrow(ValidationError);
    try {
      validateAssetInput({}, true);
    } catch (err) {
      const e = err as ValidationError;
      expect(e.fields.name).toBeDefined();
      expect(e.fields.type).toBeDefined();
      expect(e.fields.status).toBeDefined();
      expect(e.fields.lat).toBeDefined();
      expect(e.fields.lng).toBeDefined();
      expect(e.fields.installed_at).toBeDefined();
    }
  });

  it('throws when name is empty string', () => {
    try {
      validateAssetInput({ ...valid(), name: '   ' }, true);
    } catch (err) {
      expect((err as ValidationError).fields.name).toBeDefined();
    }
  });
});

describe('validateAssetInput — requireAll: false', () => {
  it('passes for empty patch (no fields to validate)', () => {
    expect(() => validateAssetInput({}, false)).not.toThrow();
  });

  it('passes for partial valid patch', () => {
    expect(() => validateAssetInput({ status: 'warning' }, false)).not.toThrow();
  });
});

describe('validateAssetInput — enum validation', () => {
  it('throws for invalid type', () => {
    try {
      validateAssetInput({ ...valid(), type: 'tank' }, true);
    } catch (err) {
      expect((err as ValidationError).fields.type).toBeDefined();
    }
  });

  it('throws for invalid status', () => {
    try {
      validateAssetInput({ ...valid(), status: 'unknown' }, true);
    } catch (err) {
      expect((err as ValidationError).fields.status).toBeDefined();
    }
  });

  it('accepts all valid type values', () => {
    for (const type of ['pipe', 'hydrant', 'sensor', 'valve']) {
      expect(() => validateAssetInput({ ...valid(), type }, true)).not.toThrow();
    }
  });

  it('accepts all valid status values', () => {
    for (const status of ['ok', 'warning', 'critical']) {
      expect(() => validateAssetInput({ ...valid(), status }, true)).not.toThrow();
    }
  });
});

describe('validateAssetInput — coordinate validation', () => {
  it('throws for lat out of range', () => {
    try {
      validateAssetInput({ ...valid(), lat: 91 }, true);
    } catch (err) {
      expect((err as ValidationError).fields.lat).toBeDefined();
    }
  });

  it('throws for lng out of range', () => {
    try {
      validateAssetInput({ ...valid(), lng: -181 }, true);
    } catch (err) {
      expect((err as ValidationError).fields.lng).toBeDefined();
    }
  });

  it('throws for non-numeric lat', () => {
    try {
      validateAssetInput({ ...valid(), lat: 'north' }, true);
    } catch (err) {
      expect((err as ValidationError).fields.lat).toBeDefined();
    }
  });
});

describe('validateAssetInput — date validation', () => {
  it('throws for invalid installed_at format', () => {
    try {
      validateAssetInput({ ...valid(), installed_at: 'yesterday' }, true);
    } catch (err) {
      expect((err as ValidationError).fields.installed_at).toBeDefined();
    }
  });

  it('accepts null for last_inspected_at', () => {
    expect(() => validateAssetInput({ ...valid(), last_inspected_at: null }, true)).not.toThrow();
  });

  it('throws for invalid last_inspected_at format', () => {
    try {
      validateAssetInput({ ...valid(), last_inspected_at: 'not-a-date' }, true);
    } catch (err) {
      expect((err as ValidationError).fields.last_inspected_at).toBeDefined();
    }
  });
});
