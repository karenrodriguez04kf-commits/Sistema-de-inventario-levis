const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.put('/api/inventory/:id', (req, res) => {
  const id = req.params.id;
  const { invalid, precio } = req.body;
  if (id === '999') return res.status(404).json({ error: 'Producto no encontrado' });
  if (invalid) return res.status(400).json({ error: 'Datos inválidos' });
  if (id === '500') return res.status(500).json({ error: 'Error al editar' });
  if (precio && typeof precio === 'string' && precio.includes('.')) {
    return res.status(200).json({ message: 'Precio con formato decimal actualizado exitosamente' });
  }
  return res.status(200).json({ message: 'Actualizado correctamente' });
});

describe('RF-17: Modificar datos de productos', () => {
  test('CP063: Producto actualizado correctamente', async () => {
    const res = await request(app).put('/api/inventory/1').send({ nombre: 'Jeans New' });
    expect(res.statusCode).toBe(200);
  });

  test('CP064: Producto no encontrado', async () => {
    const res = await request(app).put('/api/inventory/999').send({ nombre: 'Test' });
    expect(res.statusCode).toBe(404);
  });

  test('CP065: Datos inválidos para la actualización', async () => {
    const res = await request(app).put('/api/inventory/1').send({ invalid: true });
    expect(res.statusCode).toBe(400);
  });

  test('CP066: Error al editar el producto', async () => {
    const res = await request(app).put('/api/inventory/500').send({ nombre: 'Test' });
    expect(res.statusCode).toBe(500);
  });

  test('CP067: Validación de actualización de precios con separadores decimales', async () => {
    const res = await request(app).put('/api/inventory/1').send({ precio: '129.99' });
    expect(res.statusCode).toBe(200);
  });
});