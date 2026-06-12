import { useQuery } from '@tanstack/react-query';
import { listAssets } from '../api';
import { Asset, AssetFilters } from '../types';
import styles from '../styles/AssetList.module.css';

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  warning: 'Warning',
  critical: 'Critical',
};

interface Props {
  filters: AssetFilters;
  onFiltersChange: (f: AssetFilters) => void;
  onSelect: (asset: Asset) => void;
  selectedId?: string;
}

export default function AssetList({ filters, onFiltersChange, onSelect, selectedId }: Props) {
  const page = filters.page ?? 1;
  const limit = 50;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => listAssets({ ...filters, page, limit }),
  });

  if (isLoading) return <div className={styles.state}>Loading…</div>;
  if (isError) return <div className={styles.stateError}>Failed to load assets.</div>;

  const { data: assets, total } = data!;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className={styles.container}>
      <div className={styles.meta}>
        {total} asset{total !== 1 ? 's' : ''}
        {totalPages > 1 && ` · page ${page} of ${totalPages}`}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Installed</th>
            <th>Last inspected</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className={`${styles.row} ${asset.id === selectedId ? styles.rowSelected : ''}`}
              onClick={() => onSelect(asset)}
            >
              <td>{asset.name}</td>
              <td className={styles.capitalize}>{asset.type}</td>
              <td>
                <span className={`${styles.badge} ${styles[`badge_${asset.status}`]}`}>
                  {STATUS_LABEL[asset.status]}
                </span>
              </td>
              <td>{asset.installed_at}</td>
              <td>{asset.last_inspected_at ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => onFiltersChange({ page: page - 1 })}
          >
            ← Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => onFiltersChange({ page: page + 1 })}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
