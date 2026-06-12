import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { listAssets } from '../api';
import { Asset, AssetFilters } from '../types';
import styles from '../styles/AssetMap.module.css';

const STATUS_COLOR: Record<string, string> = {
  ok: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
};

function BboxTracker({ onBboxChange }: { onBboxChange: (bbox: string) => void }) {
  const map = useMapEvents({
    moveend() {
      const b = map.getBounds();
      onBboxChange(`${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`);
    },
  });

  useEffect(() => {
    const b = map.getBounds();
    onBboxChange(`${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`);
  }, []);

  return null;
}

function MapFocuser({ asset, onConsumed }: { asset: Asset | null; onConsumed: () => void }) {
  const map = useMap();

  useEffect(() => {
    if (!asset) return;
    map.flyTo([asset.lat, asset.lng], 15, { duration: 1 });
    onConsumed();
  }, [asset]);

  return null;
}

interface Props {
  filters: AssetFilters;
  onSelect: (asset: Asset) => void;
  selectedId?: string;
  focusAsset?: Asset | null;
  onFocusConsumed?: () => void;
}

export default function AssetMap({ filters, onSelect, selectedId, focusAsset, onFocusConsumed }: Props) {
  const [bbox, setBbox] = useState<string | undefined>();

  const { data } = useQuery({
    queryKey: ['assets-map', filters, bbox],
    queryFn: () => listAssets({ ...filters, bbox, page: 1, limit: 200 }),
    enabled: !!bbox,
    placeholderData: (prev) => prev,
  });

  const assets = data?.data ?? [];

  return (
    <div className={styles.container}>
      <MapContainer
        center={[40.75, -73.98]}
        zoom={12}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BboxTracker onBboxChange={setBbox} />
        <MapFocuser asset={focusAsset ?? null} onConsumed={onFocusConsumed ?? (() => {})} />
        {assets.map((asset) => (
          <CircleMarker
            key={asset.id}
            center={[asset.lat, asset.lng]}
            radius={selectedId === asset.id ? 10 : 7}
            pathOptions={{
              color: '#fff',
              weight: selectedId === asset.id ? 2 : 1,
              fillColor: STATUS_COLOR[asset.status],
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect(asset) }}
          >
            <Popup>
              <strong>{asset.name}</strong>
              <br />
              {asset.type} · {asset.status}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className={styles.legend}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <span key={status} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: color }} />
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}
