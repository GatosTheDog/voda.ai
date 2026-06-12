import { useState } from 'react';
import { Asset, AssetFilters } from './types';
import FilterBar from './components/FilterBar';
import AssetList from './components/AssetList';
import AssetMap from './components/AssetMap';
import AssetDetail from './components/AssetDetail';
import AssetForm from './components/AssetForm';
import styles from './styles/App.module.css';

type Tab = 'list' | 'map';

export default function App() {
  const [tab, setTab] = useState<Tab>('list');
  const [filters, setFilters] = useState<AssetFilters>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shouldRenderAside, setShouldRenderAside] = useState(false);

  function handleFilterChange(next: AssetFilters) {
    const resetPage = next.page === undefined;
    setFilters((prev) => ({ ...prev, ...next, ...(resetPage ? { page: 1 } : {}) }));
  }

  function handleSelectAsset(asset: Asset | null) {
    setSelectedAsset(asset);
    setEditingAsset(null);
    setShowCreateForm(false);
    setShouldRenderAside(true);
  }

  function handleEdit(asset: Asset) {
    setEditingAsset(asset);
    setShowCreateForm(false);
    setShouldRenderAside(true);
  }

  function handleCreate() {
    setShowCreateForm(true);
    setEditingAsset(null);
    setSelectedAsset(null);
    setShouldRenderAside(true);
  }

  function handleFormClose() {
    setShowCreateForm(false);
    setEditingAsset(null);
    setShouldRenderAside(false);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Asset Tracker</h1>
        <nav className={styles.tabs}>
          <button
            className={tab === 'list' ? styles.tabActive : styles.tab}
            onClick={() => setTab('list')}
          >
            List
          </button>
          <button
            className={tab === 'map' ? styles.tabActive : styles.tab}
            onClick={() => setTab('map')}
          >
            Map
          </button>
        </nav>
        <button className={styles.createBtn} onClick={handleCreate}>
          + New Asset
        </button>
      </header>

      <div className={styles.toolbar}>
        <FilterBar filters={filters} onChange={handleFilterChange} />
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          {tab === 'list' ? (
            <AssetList
              filters={filters}
              onFiltersChange={handleFilterChange}
              onSelect={handleSelectAsset}
              selectedId={selectedAsset?.id}
            />
          ) : (
            <AssetMap
              filters={filters}
              onSelect={handleSelectAsset}
              selectedId={selectedAsset?.id}
            />
          )}
        </div>

        {shouldRenderAside && <aside className={styles.aside}>
          {showCreateForm && (
            <AssetForm onClose={handleFormClose} />
          )}
          {editingAsset && (
            <AssetForm asset={editingAsset} onClose={handleFormClose} />
          )}
          {!showCreateForm && !editingAsset && selectedAsset && (
            <AssetDetail
              asset={selectedAsset}
              onEdit={handleEdit}
              onClose={() => setShouldRenderAside(false)}
              onDelete={() => handleSelectAsset(null)}
            />
          )}
        </aside>}
      </div>
    </div>
  );
}
