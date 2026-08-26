const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.delete('/api/admin/users/:id', (req, res) => {
  const id = req.params.id;
  if (id === '999') return res.status(404).json({ error: 'Usuario inexistente' });
  if (id === '500') return res.status(500).json({ error: 'Error al eliminar' });
  return res.status(200).json({ message: 'Usuario eliminado correctamente' });
});

describe('RF21 - Eliminar usuario interno', () => {
  test('CP079: Usuario eliminado correctamente', async () => {
    const res = await request(app).delete('/api/admin/users/1');
    expect(res.statusCode).toBe(200);
  });

  test('CP080: Usuario inexistente', async () => {
    const res = await request(app).delete('/api/admin/users/999');
    expect(res.statusCode).toBe(404);
  });

  test('CP081: Error al eliminar el usuario', async () => {
    const res = await request(app).delete('/api/admin/users/500');
    expect(res.statusCode).toBe(500);
  });
});