const request = require('supertest');
const express = require('express');

const app = express();

app.get('/api/busqueda', (req, res) => {
  const { q } = req.query;
  if (q === 'error') return res.status(500).json({ error: 'Error durante la búsqueda' });
  if (q === 'sin_resultados') return res.status(200).json([]);
  return res.status(200).json([{ id: 1, prenda: 'Jeans 501 Original' }]);
});

describe('RF08 - Búsqueda de Prendas', () => {
  test('CP029: Búsqueda exitosa de una prenda', async () => {
    const res = await request(app).get('/api/busqueda?q=501');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('CP030: Búsqueda sin resultados', async () => {
    const res = await request(app).get('/api/busqueda?q=sin_resultados');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('CP031: Error durante la búsqueda', async () => {
    const res = await request(app).get('/api/busqueda?q=error');
    expect(res.statusCode).toBe(500);
  });
});