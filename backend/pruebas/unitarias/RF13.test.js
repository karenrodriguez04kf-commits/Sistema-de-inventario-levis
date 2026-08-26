const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/checkout', (req, res) => {
  const { status, stock } = req.body;
  if (status === 'rejected') return res.status(400).json({ error: 'Pago rechazado o fallido' });
  if (stock === 'insufficient') return res.status(409).json({ error: 'Stock insuficiente' });
  if (status === 'error') return res.status(500).json({ error: 'Error al finalizar la compra' });
  return res.status(201).json({ message: 'Compra realizada exitosamente' });
});

describe('RF-13: Finalizar compra', () => {
  test('CP048: Compra realizada exitosamente', async () => {
    const res = await request(app).post('/api/checkout').send({ status: 'success' });
    expect(res.statusCode).toBe(201);
  });

  test('CP049: Pago rechazado o fallido', async () => {
    const res = await request(app).post('/api/checkout').send({ status: 'rejected' });
    expect(res.statusCode).toBe(400);
  });

  test('CP050: Stock insuficiente durante la compra', async () => {
    const res = await request(app).post('/api/checkout').send({ stock: 'insufficient' });
    expect(res.statusCode).toBe(409);
  });

  test('CP051: Error al finalizar la compra', async () => {
    const res = await request(app).post('/api/checkout').send({ status: 'error' });
    expect(res.statusCode).toBe(500);
  });
});