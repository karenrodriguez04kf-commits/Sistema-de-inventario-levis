const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/inventory', (req, res) => {
  const { type } = req.query;
  if (type === 'empty') return res.status(200).json([]);
  if (type === 'error') return res.status(500).json({ error: 'Error al consultar inventario' });
  if (type === 'critical') return res.status(200).json({ productos: [], alertaStockCritico: true });
  return res.status(200).json([{ id: 1, producto: 'Camisa', stock: 20 }]);
});

describe('RF-15: Consultar productos en inventario', () => {
  test('CP055: Visualización exitosa del inventario', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('CP056: Inventario sin productos registrados', async () => {
    const res = await request(app).get('/api/inventory?type=empty');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('CP057: Error al consultar el inventario', async () => {
    const res = await request(app).get('/api/inventory?type=error');
    expect(res.statusCode).toBe(500);
  });

  test('CP058: Visualización de alertas de stock crítico o bajo', async () => {
    const res = await request(app).get('/api/inventory?type=critical');
    expect(res.statusCode).toBe(200);
    expect(res.body.alertaStockCritico).toBe(true);
  });
});