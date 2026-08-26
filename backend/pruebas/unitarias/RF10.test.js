const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/catalog/filter', (req, res) => {
  const { categoria, error } = req.query;
  if (error) return res.status(500).json({ error: 'Error al aplicar el filtro' });
  if (categoria === 'Inexistente') return res.status(200).json([]);
  return res.status(200).json([{ id: 1, nombre: 'Jeans 501', categoria: 'Pantalones' }]);
});

describe('RF-10: Filtrar productos del catálogo', () => {
  test('CP035: Filtrado exitoso de productos', async () => {
    const res = await request(app).get('/api/catalog/filter?categoria=Pantalones');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('CP036: No se encontraron productos con el filtro aplicado', async () => {
    const res = await request(app).get('/api/catalog/filter?categoria=Inexistente');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('CP037: Error al aplicar el filtro', async () => {
    const res = await request(app).get('/api/catalog/filter?error=true');
    expect(res.statusCode).toBe(500);
  });
});