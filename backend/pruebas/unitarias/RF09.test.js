const request = require('supertest');
const express = require('express');

const app = express();

app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  if (id === '1') return res.status(200).json({ id: 1, nombre: 'Jeans 501', disponible: true });
  if (id === '2') return res.status(404).json({ error: 'Producto no disponible' });
  if (id === 'error') return res.status(500).json({ error: 'Error al consultar el producto' });
  return res.status(400).json({ error: 'Petición inválida' });
});

describe('RF09 - Detalle del Producto', () => {
  test('CP032: Visualización exitosa del detalle del producto', async () => {
    const res = await request(app).get('/api/productos/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nombre', 'Jeans 501');
  });

  test('CP033: Producto no disponible', async () => {
    const res = await request(app).get('/api/productos/2');
    expect(res.statusCode).toBe(404);
  });

  test('CP034: Error al consultar el producto', async () => {
    const res = await request(app).get('/api/productos/error');
    expect(res.statusCode).toBe(500);
  });
});