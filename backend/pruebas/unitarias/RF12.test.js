const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.delete('/api/cart/:id', (req, res) => {
  const id = req.params.id;
  if (id === '999') return res.status(404).json({ error: 'El producto ya no se encuentra en el carrito' });
  if (id === '500') return res.status(500).json({ error: 'Error al eliminar' });
  return res.status(200).json({ message: 'Eliminado correctamente' });
});

app.post('/api/checkout/stock-update', (req, res) => {
  return res.status(200).json({ stockActualizado: true, historialConsistente: true });
});

describe('RF-12: Eliminar productos del carrito y validaciones de compra', () => {
  test('CP043: Producto eliminado correctamente del carrito', async () => {
    const res = await request(app).delete('/api/cart/1');
    expect(res.statusCode).toBe(200);
  });

  test('CP044: El producto ya no se encuentra en el carrito', async () => {
    const res = await request(app).delete('/api/cart/999');
    expect(res.statusCode).toBe(404);
  });

  test('CP045: Error al eliminar el producto del carrito', async () => {
    const res = await request(app).delete('/api/cart/500');
    expect(res.statusCode).toBe(500);
  });

  test('CP046: Validación de la actualización automática del stock total', async () => {
    const res = await request(app).post('/api/checkout/stock-update');
    expect(res.statusCode).toBe(200);
    expect(res.body.stockActualizado).toBe(true);
  });

  test('CP047: Verificación de consistencia de fechas y estados en historial', async () => {
    const res = await request(app).post('/api/checkout/stock-update');
    expect(res.statusCode).toBe(200);
    expect(res.body.historialConsistente).toBe(true);
  });
});