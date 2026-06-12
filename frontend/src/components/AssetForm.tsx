import { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAsset, updateAsset } from '../api';
import { Asset, AssetStatus, AssetType } from '../types';
import styles from '../styles/AssetForm.module.css';

interface FormState {
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: string;
  lng: string;
  installed_at: string;
  last_inspected_at: string;
  notes: string;
}

function toFormState(asset?: Asset): FormState {
  return {
    name: asset?.name ?? '',
    type: asset?.type ?? 'pipe',
    status: asset?.status ?? 'ok',
    lat: asset ? String(asset.lat) : '',
    lng: asset ? String(asset.lng) : '',
    installed_at: asset?.installed_at ?? '',
    last_inspected_at: asset?.last_inspected_at ?? '',
    notes: asset?.notes ?? '',
  };
}

interface LocationPickerProps {
  onPick: (lat: number, lng: number) => void;
  lat: string;
  lng: string;
}

function LocationPicker({ onPick, lat, lng }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  asset?: Asset;
  onClose: () => void;
}

export default function AssetForm({ asset, onClose }: Props) {
  const [form, setForm] = useState<FormState>(toFormState(asset));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickingLocation, setPickingLocation] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        type: form.type,
        status: form.status,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        installed_at: form.installed_at,
        last_inspected_at: form.last_inspected_at || null,
        notes: form.notes,
      };
      return asset ? updateAsset(asset.id, payload) : createAsset(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setErrors({ _form: err.message });
      }
    },
  });

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.lat || isNaN(parseFloat(form.lat))) next.lat = 'Must be a number';
    if (!form.lng || isNaN(parseFloat(form.lng))) next.lng = 'Must be a number';
    if (!form.installed_at) next.installed_at = 'Required';
    if (Object.keys(next).length > 0) { setErrors(next); return; }
    mutate();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{asset ? 'Edit Asset' : 'New Asset'}</h2>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label className={styles.field}>
          <span className={styles.required}>Name</span>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.required}>Type</span>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="pipe">Pipe</option>
              <option value="hydrant">Hydrant</option>
              <option value="sensor">Sensor</option>
              <option value="valve">Valve</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.required}>Status</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="ok">OK</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.required}>Latitude</span>
            <input
              value={form.lat}
              onChange={(e) => set('lat', e.target.value)}
              placeholder="e.g. 40.75"
            />
            {errors.lat && <span className={styles.error}>{errors.lat}</span>}
          </label>
          <label className={styles.field}>
            <span className={styles.required}>Longitude</span>
            <input
              value={form.lng}
              onChange={(e) => set('lng', e.target.value)}
              placeholder="e.g. -73.98"
            />
            {errors.lng && <span className={styles.error}>{errors.lng}</span>}
          </label>
        </div>

        <button
          type="button"
          className={styles.pickBtn}
          onClick={() => setPickingLocation((p) => !p)}
        >
          {pickingLocation ? 'Close map' : 'Pick on map'}
        </button>

        {pickingLocation && (
          <div className={styles.miniMap}>
            <MapContainer
              center={
                form.lat && form.lng
                  ? [parseFloat(form.lat), parseFloat(form.lng)]
                  : [40.75, -73.98]
              }
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                lat={form.lat}
                lng={form.lng}
                onPick={(lat, lng) => {
                  set('lat', String(lat.toFixed(6)));
                  set('lng', String(lng.toFixed(6)));
                }}
              />
            </MapContainer>
            <p className={styles.mapHint}>Click on the map to set location</p>
          </div>
        )}

        <label className={styles.field}>
          <span className={styles.required}>Installed at</span>
          <input
            type="date"
            value={form.installed_at}
            onChange={(e) => set('installed_at', e.target.value)}
          />
          {errors.installed_at && <span className={styles.error}>{errors.installed_at}</span>}
        </label>

        <label className={styles.field}>
          Last inspected (optional)
          <input
            type="date"
            value={form.last_inspected_at}
            onChange={(e) => set('last_inspected_at', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
          />
        </label>

        {errors._form && <p className={styles.error}>{errors._form}</p>}

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={isPending}>
            {isPending ? 'Saving…' : asset ? 'Save changes' : 'Create asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
