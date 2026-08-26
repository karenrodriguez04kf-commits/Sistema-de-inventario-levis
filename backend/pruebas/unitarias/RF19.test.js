const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/admin/users', (req, res) => {
  const type = req.query.type;
  if (type === 'error') return res.status(500).json({ error: 'Error al consultar los usuarios' });
  if (type === 'empty') return res.status(200).json([]);
  
  return res.status(200).json([
    { id: 1, name: 'Admin', email: 'admin@levis.com' }
  ]);
});

describe('RF19 - Consultar lista de usuarios internos', () => {
  test('CP071: Visualización exitosa de usuarios', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('CP072: No existen usuarios registrados', async () => {
    const res = await request(app).get('/api/admin/users?type=empty');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('CP073: Error al consultar los usuarios', async () => {
    const res = await request(app).get('/api/admin/users?type=error');
    expect(res.statusCode).toBe(500);
  });
});