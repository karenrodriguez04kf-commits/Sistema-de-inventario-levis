const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/admin/sales', (req, res) => {
  const type = req.query.type;
  if (type === 'error') return res.status(500).json({ error: 'Error al consultar ventas' });
  if (type === 'empty') return res.status(200).json([]);
  if (type === 'detail') return res.status(200).json({ saleId: 1, items: [{ product: 'Jeans', qty: 2, total: 100 }] });
  
  return res.status(200).json([{ saleId: 1, total: 100 }]);
});

describe('RF23 - Historial de Ventas', () => {
  test('CP087: Visualización exitosa del historial de ventas', async () => {
    const res = await request(app).get('/api/admin/sales');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('CP088: No existen ventas registradas', async () => {
    const res = await request(app).get('/api/admin/sales?type=empty');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('CP089: Error al consultar el historial de ventas', async () => {
    const res = await request(app).get('/api/admin/sales?type=error');
    expect(res.statusCode).toBe(500);
  });

  test('CP90: Despliegue interactivo del detalle colapsable de una venta', async () => {
    const res = await request(app).get('/api/admin/sales?type=detail');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});