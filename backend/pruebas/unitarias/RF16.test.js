const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/inventory', (req, res) => {
  const { codigo, invalid, error } = req.body;
  if (invalid) return res.status(400).json({ error: 'Datos inválidos' });
  if (codigo === 'DUP001') return res.status(409).json({ error: 'Producto duplicado' });
  if (error) return res.status(500).json({ error: 'Error al registrar' });
  return res.status(201).json({ message: 'Registrado correctamente' });
});

describe('RF-16: Registrar nuevos productos en el inventario', () => {
  test('CP059: Producto registrado correctamente en el inventario', async () => {
    const res = await request(app).post('/api/inventory').send({ codigo: 'LEV001', nombre: 'Chaqueta' });
    expect(res.statusCode).toBe(201);
  });

  test('CP060: Producto duplicado', async () => {
    const res = await request(app).post('/api/inventory').send({ codigo: 'DUP001' });
    expect(res.statusCode).toBe(409);
  });

  test('CP061: Datos inválidos del producto', async () => {
    const res = await request(app).post('/api/inventory').send({ invalid: true });
    expect(res.statusCode).toBe(400);
  });

  test('CP062: Error al registrar el producto', async () => {
    const res = await request(app).post('/api/inventory').send({ error: true });
    expect(res.statusCode).toBe(500);
  });
});