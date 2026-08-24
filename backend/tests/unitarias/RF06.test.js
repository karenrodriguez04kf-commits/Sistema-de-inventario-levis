const request = require('supertest');
const express = require('express');

const app = express();

app.get('/api/carrito', (req, res) => {
  if (req.query.empty === 'true') return res.status(200).json({ items: [], total: 0 });
  if (req.query.error === 'true') return res.status(500).json({ error: 'Error al cargar el carrito' });
  return res.status(200).json({ items: [{ id: 1, producto: 'Jeans 501', cantidad: 1 }], total: 250000 });
});

describe('RF06 - Carrito de Compras', () => {
  test('CP023: Visualización exitosa del carrito', async () => {
    const res = await request(app).get('/api/carrito');
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  test('CP024: Carrito vacío', async () => {
    const res = await request(app).get('/api/carrito?empty=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(0);
  });

  test('CP025: Error al cargar el carrito', async () => {
    const res = await request(app).get('/api/carrito?error=true');
    expect(res.statusCode).toBe(500);
  });
});