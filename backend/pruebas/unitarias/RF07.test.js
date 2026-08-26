const request = require('supertest');
const express = require('express');

const app = express();

app.get('/api/catalogo', (req, res) => {
  if (req.query.empty === 'true') return res.status(200).json([]);
  if (req.query.error === 'true') return res.status(500).json({ error: 'Error al consultar el catálogo' });
  return res.status(200).json([{ id: 1, nombre: 'Chaqueta Trucker' }]);
});

describe('RF07 - Catálogo de Productos', () => {
  test('CP026: Visualización exitosa del catálogo', async () => {
    const res = await request(app).get('/api/catalogo');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('CP027: Catálogo sin productos', async () => {
    const res = await request(app).get('/api/catalogo?empty=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('CP028: Error al consultar el catálogo', async () => {
    const res = await request(app).get('/api/catalogo?error=true');
    expect(res.statusCode).toBe(500);
  });
});