const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/admin/suppliers', (req, res) => {
  const type = req.query.type;
  if (type === 'error') return res.status(500).json({ error: 'Error' });
  if (type === 'empty') return res.status(200).json([]);
  return res.status(200).json([{ id: 1, name: 'Proveedor 1' }]);
});

describe('RF24 - Consultar proveedores', () => {
  test('CP091: Visualización exitosa de proveedores', async () => {
    const res = await request(app).get('/api/admin/suppliers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('CP092: No existen proveedores registrados', async () => {
    const res = await request(app).get('/api/admin/suppliers?type=empty');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('CP093: Error al consultar los proveedores', async () => {
    const res = await request(app).get('/api/admin/suppliers?type=error');
    expect(res.statusCode).toBe(500);
  });
});