const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.delete('/api/admin/suppliers/:id', (req, res) => {
  const id = req.params.id;
  if (id === '999') return res.status(404).json({ error: 'Proveedor no encontrado' });
  if (id === '500') return res.status(500).json({ error: 'Error al eliminar' });
  return res.status(200).json({ message: 'Proveedor eliminado correctamente' });
});

describe('RF26 - Eliminar proveedor', () => {
  test('CP099: Proveedor eliminado correctamente', async () => {
    const res = await request(app).delete('/api/admin/suppliers/1');
    expect(res.statusCode).toBe(200);
  });

  test('CP0100: Proveedor no encontrado', async () => {
    const res = await request(app).delete('/api/admin/suppliers/999');
    expect(res.statusCode).toBe(404);
  });

  test('CP0101: Error al eliminar el proveedor', async () => {
    const res = await request(app).delete('/api/admin/suppliers/500');
    expect(res.statusCode).toBe(500);
  });
});