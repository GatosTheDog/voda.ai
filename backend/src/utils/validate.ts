import { AssetStatus, AssetType } from '../types';

export class ValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

const VALID_TYPES: AssetType[] = ['pipe', 'hydrant', 'sensor', 'valve'];
const VALID_STATUSES: AssetStatus[] = ['ok', 'warning', 'critical'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;

export function validateAssetInput(
  input: Record<string, unknown>,
  requireAll: boolean,
): void {
  const errors: Record<string, string> = {};

  if (requireAll) {
    if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
      errors.name = 'Required string';
    }
    if (input.type === undefined) errors.type = 'Required';
    if (input.status === undefined) errors.status = 'Required';
    if (input.lat === undefined) errors.lat = 'Required';
    if (input.lng === undefined) errors.lng = 'Required';
    if (input.installed_at === undefined) errors.installed_at = 'Required';
  }

  if (input.type !== undefined && !VALID_TYPES.includes(input.type as AssetType)) {
    errors.type = `Must be one of: ${VALID_TYPES.join(', ')}`;
  }
  if (input.status !== undefined && !VALID_STATUSES.includes(input.status as AssetStatus)) {
    errors.status = `Must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  if (
    input.lat !== undefined &&
    (typeof input.lat !== 'number' || input.lat < -90 || input.lat > 90)
  ) {
    errors.lat = 'Must be a number between -90 and 90';
  }
  if (
    input.lng !== undefined &&
    (typeof input.lng !== 'number' || input.lng < -180 || input.lng > 180)
  ) {
    errors.lng = 'Must be a number between -180 and 180';
  }
  if (input.installed_at !== undefined && !ISO_DATE_RE.test(String(input.installed_at))) {
    errors.installed_at = 'Must be an ISO date string (YYYY-MM-DD)';
  }
  if (
    input.last_inspected_at !== undefined &&
    input.last_inspected_at !== null &&
    !ISO_DATE_RE.test(String(input.last_inspected_at))
  ) {
    errors.last_inspected_at = 'Must be an ISO date string or null';
  }

  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}
