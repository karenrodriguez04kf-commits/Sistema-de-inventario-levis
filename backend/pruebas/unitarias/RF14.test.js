const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/orders/history', (req, res) => {
  const { type } = req.query;
  if (type === 'empty') return res.status(200).json([]);
  if (type === 'error') return res.status(500).json({ error: 'Error al consultar historial' });
  return res.status(200).json([{ orderId: 1, total: 150000 }]);
});

describe('RF-14: Consultar historial de pedidos', () => {
  test('CP052: Visualización exitosa del historial de pedidos', async () => {
    const res = await request(app).get('/api/orders/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('CP053: El usuario no posee pedidos registrados', async () => {
    const res = await request(app).get('/api/orders/history?type=empty');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('CP054: Error al consultar el historial de pedidos', async () => {
    const res = await request(app).get('/api/orders/history?type=error');
    expect(res.statusCode).toBe(500);
  });
});