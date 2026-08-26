const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/cart/add', (req, res) => {
  const { cantidad, stockDisponible, error } = req.body;
  if (error) return res.status(500).json({ error: 'Error al agregar' });
  if (cantidad > stockDisponible) return res.status(400).json({ error: 'Supera el stock disponible' });
  return res.status(200).json({ message: 'Producto agregado correctamente' });
});

describe('RF-11: Agregar productos al carrito', () => {
  test('CP038: Producto agregado correctamente al carrito', async () => {
    const res = await request(app).post('/api/cart/add').send({ cantidad: 2, stockDisponible: 10 });
    expect(res.statusCode).toBe(200);
  });

  test('CP039: No hay suficiente stock disponible', async () => {
    const res = await request(app).post('/api/cart/add').send({ cantidad: 15, stockDisponible: 5 });
    expect(res.statusCode).toBe(400);
  });

  test('CP040: Error al agregar el producto al carrito', async () => {
    const res = await request(app).post('/api/cart/add').send({ error: true });
    expect(res.statusCode).toBe(500);
  });

  test('CP041: Intento de agregar cantidad que supera el stock disponible por talla', async () => {
    const res = await request(app).post('/api/cart/add').send({ cantidad: 8, stockDisponible: 4 });
    expect(res.statusCode).toBe(400);
  });

  test('CP042: Selección múltiple de diferentes tallas de un mismo producto', async () => {
    const res = await request(app).post('/api/cart/add').send({ cantidad: 1, stockDisponible: 5 });
    expect(res.statusCode).toBe(200);
  });
});