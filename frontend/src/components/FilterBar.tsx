import { AssetFilters, AssetStatus, AssetType } from '../types';
import styles from '../styles/FilterBar.module.css';

interface Props {
  filters: AssetFilters;
  onChange: (next: AssetFilters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className={styles.bar}>
      <label className={styles.field}>
        <span>Type</span>
        <select
          value={filters.type ?? ''}
          onChange={(e) => onChange({ type: (e.target.value as AssetType) || undefined })}
        >
          <option value="">All types</option>
          <option value="pipe">Pipe</option>
          <option value="hydrant">Hydrant</option>
          <option value="sensor">Sensor</option>
          <option value="valve">Valve</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>Status</span>
        <select
          value={filters.status ?? ''}
          onChange={(e) => onChange({ status: (e.target.value as AssetStatus) || undefined })}
        >
          <option value="">All statuses</option>
          <option value="ok">OK</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </label>

      {(filters.type || filters.status) && (
        <button
          className={styles.clearBtn}
          onClick={() => onChange({ type: undefined, status: undefined })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
