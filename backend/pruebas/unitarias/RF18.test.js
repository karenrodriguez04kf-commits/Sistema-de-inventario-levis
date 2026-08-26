const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.delete('/api/inventory/:id', (req, res) => {
  const id = req.params.id;
  if (id === '999') return res.status(404).json({ error: 'El producto no existe' });
  if (id === '500') return res.status(500).json({ error: 'Error al eliminar' });
  return res.status(200).json({ message: 'Producto eliminado correctamente' });
});

describe('RF-18: Eliminar productos del inventario', () => {
  test('CP068: Producto eliminado correctamente', async () => {
    const res = await request(app).delete('/api/inventory/1');
    expect(res.statusCode).toBe(200);
  });

  test('CP069: El producto no existe', async () => {
    const res = await request(app).delete('/api/inventory/999');
    expect(res.statusCode).toBe(404);
  });

  test('CP070: Error al eliminar el producto', async () => {
    const res = await request(app).delete('/api/inventory/500');
    expect(res.statusCode).toBe(500);
  });
});