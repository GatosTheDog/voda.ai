# Asset Tracker

A full-stack web app for tracking physical infrastructure assets (pipes, hydrants, sensors, valves) on a map. List view with filtering and pagination, an interactive map with status-colored markers, and full create/edit/delete with a map-based location picker.

## Stack

| Layer | Choice |
|---|---|
| Backend | Node.js · Express · TypeScript |
| Frontend | React · TypeScript · Vite |
| Server state | TanStack Query (React Query v5) |
| Map | react-leaflet · Leaflet · OpenStreetMap tiles |
| Styling | CSS Modules |
| Storage | In-memory `Map`, seeded from `seed.json` |
| Tests | Jest + Supertest (backend) · Jest + React Testing Library (frontend) |

## Project layout

```
.
├── seed.json              # 150 seed assets, loaded into memory on startup
├── backend/
│   └── src/
│       ├── index.ts       # Express bootstrap, mounts /api/assets
│       ├── types.ts       # Asset, filter, and result types (source of truth)
│       ├── store.ts       # In-memory Map: list/find/create/update/remove
│       ├── validate.ts    # Pure validation helper + ValidationError
│       ├── sanitize.ts    # Whitelists known asset fields (drops unknown keys)
│       └── routes/
│           └── assets.ts  # REST routes + validation middleware
└── frontend/
    └── src/
        ├── App.tsx        # Owns shared state (tab, filters, selection)
        ├── api.ts         # Typed fetch helpers
        ├── types.ts       # Shared client types
        └── components/    # FilterBar, AssetList, AssetMap, AssetDetail, AssetForm
```

## Running locally

Two packages, two terminals.

**Backend** (port 3002):
```bash
cd backend
npm install
npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the backend on 3002, so no CORS or base-URL config is needed in development.

## Tests

```bash
cd backend && npm test     # 27 tests: routes + validation
cd frontend && npm test    # 5 tests: AssetList rendering, selection, loading/error
```

## API

Base URL: `http://localhost:3002/api`

### `GET /assets`
List assets with optional filters. Returns a paginated envelope.

| Query param | Type | Notes |
|---|---|---|
| `type` | `pipe \| hydrant \| sensor \| valve` | exact match |
| `status` | `ok \| warning \| critical` | exact match |
| `bbox` | `minLng,minLat,maxLng,maxLat` | bounding-box geospatial filter |
| `page` | number | default `1` |
| `limit` | number | default `50`, capped at `200` |

```json
{ "data": [ /* Asset[] */ ], "total": 142, "page": 1, "limit": 50 }
```

`total` reflects the filtered count (before pagination), so the client can render "page X of Y".

### `GET /assets/:id`
`200 { "data": Asset }` · `404 { "error": "Not found" }`

### `POST /assets`
Creates an asset (server generates the `id`). All fields except `last_inspected_at` and `notes` are required.
`201 { "data": Asset }` · `422 { "error": "Validation failed", "fields": { ... } }`

### `PUT /assets/:id`
Partial update. Only the fields present in the body are validated and applied.
`200 { "data": Asset }` · `404` · `422`

### `DELETE /assets/:id`
`204 No Content` · `404`

### Asset shape
```ts
{
  id: string;
  name: string;
  type: 'pipe' | 'hydrant' | 'sensor' | 'valve';
  status: 'ok' | 'warning' | 'critical';
  lat: number;            // -90..90
  lng: number;            // -180..180
  installed_at: string;   // YYYY-MM-DD
  last_inspected_at: string | null;
  notes: string;
}
```
