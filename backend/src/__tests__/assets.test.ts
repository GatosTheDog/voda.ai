import request from 'supertest';
import app from '../index';

describe('GET /api/assets', () => {
  it('returns all assets with pagination metadata', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(50);
  });

  it('filters by type', async () => {
    const res = await request(app).get('/api/assets?type=pipe');
    expect(res.status).toBe(200);
    expect(res.body.data.every((a: { type: string }) => a.type === 'pipe')).toBe(true);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/assets?status=critical');
    expect(res.status).toBe(200);
    expect(res.body.data.every((a: { status: string }) => a.status === 'critical')).toBe(true);
  });

  it('filters by bounding box', async () => {
    // Manhattan roughly: -74.02,40.70,-73.93,40.82
    const res = await request(app).get('/api/assets?bbox=-74.02,40.70,-73.93,40.82');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const a of res.body.data) {
      expect(a.lat).toBeGreaterThanOrEqual(40.70);
      expect(a.lat).toBeLessThanOrEqual(40.82);
      expect(a.lng).toBeGreaterThanOrEqual(-74.02);
      expect(a.lng).toBeLessThanOrEqual(-73.93);
    }
  });

  it('returns 400 for malformed bbox', async () => {
    const res = await request(app).get('/api/assets?bbox=bad');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/assets/:id', () => {
  it('returns a single asset', async () => {
    const listRes = await request(app).get('/api/assets');
    const id = listRes.body.data[0].id;
    const res = await request(app).get(`/api/assets/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/assets/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/assets', () => {
  it('creates a new asset', async () => {
    const res = await request(app).post('/api/assets').send({
      name: 'Test Sensor',
      type: 'sensor',
      status: 'ok',
      lat: 40.75,
      lng: -73.98,
      installed_at: '2024-01-01',
      last_inspected_at: null,
      notes: '',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('Test Sensor');
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app).post('/api/assets').send({ name: 'No type or status' });
    expect(res.status).toBe(422);
    expect(res.body.fields).toBeDefined();
  });

  it('returns 422 for invalid type enum', async () => {
    const res = await request(app).post('/api/assets').send({
      name: 'Bad',
      type: 'tank',
      status: 'ok',
      lat: 40.75,
      lng: -73.98,
      installed_at: '2024-01-01',
    });
    expect(res.status).toBe(422);
    expect(res.body.fields.type).toBeDefined();
  });
});

describe('PUT /api/assets/:id', () => {
  it('updates an asset', async () => {
    const listRes = await request(app).get('/api/assets');
    const id = listRes.body.data[0].id;
    const res = await request(app).put(`/api/assets/${id}`).send({ status: 'warning' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('warning');
  });
});

describe('DELETE /api/assets/:id', () => {
  it('deletes an asset', async () => {
    const created = await request(app).post('/api/assets').send({
      name: 'To Delete',
      type: 'valve',
      status: 'ok',
      lat: 41.0,
      lng: -74.0,
      installed_at: '2023-06-01',
      last_inspected_at: null,
      notes: '',
    });
    const id = created.body.data.id;
    const del = await request(app).delete(`/api/assets/${id}`);
    expect(del.status).toBe(204);
    const get = await request(app).get(`/api/assets/${id}`);
    expect(get.status).toBe(404);
  });
});
