import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAsset } from '../api';
import { Asset } from '../types';
import styles from '../styles/AssetDetail.module.css';

interface Props {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: () => void;
  onClose: () => void;
  onViewOnMap: (asset: Asset) => void;
}

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  warning: 'Warning',
  critical: 'Critical',
};

export default function AssetDetail({ asset, onEdit, onDelete, onClose, onViewOnMap }: Props) {
  const queryClient = useQueryClient();

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => deleteAsset(asset.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      onDelete();
    },
  });

  function handleDelete() {
    if (window.confirm(`Delete "${asset.name}"?`)) remove();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeaderCloseBtn}><button className={styles.closeBtn} onClick={onClose}>✕</button></div>
      <div className={styles.panelHeader}>
        <h2 className={styles.name}>{asset.name}</h2>
        <span className={`${styles.badge} ${styles[`badge_${asset.status}`]}`}>
          {STATUS_LABEL[asset.status]}
        </span>
      </div>

      <dl className={styles.fields}>
        <div>
          <dt>Type</dt>
          <dd className={styles.capitalize}>{asset.type}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{STATUS_LABEL[asset.status]}</dd>
        </div>

        <div>
          <dt>Latitude</dt>
          <dd>{asset.lat}</dd>
        </div>
        <div>
          <dt>Longitude</dt>
          <dd>{asset.lng}</dd>
        </div>

        <div className={styles.fieldFull}>
          <dt>Installed</dt>
          <dd>{asset.installed_at}</dd>
        </div>

        <div className={styles.fieldFull}>
          <dt>Last inspected</dt>
          <dd>{asset.last_inspected_at ?? '—'}</dd>
        </div>

        {asset.notes && (
          <div className={styles.fieldFull}>
            <dt>Notes</dt>
            <dd>{asset.notes}</dd>
          </div>
        )}
      </dl>

      <div className={styles.actions}>
        <button className={styles.mapBtn} onClick={() => onViewOnMap(asset)}>
          View on map
        </button>
        <button className={styles.editBtn} onClick={() => onEdit(asset)}>
          Edit
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} disabled={isPending}>
          {isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
