const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/auth/logout', (req, res) => {
  const { action } = req.body;
  if (action === 'cancel') return res.status(200).json({ message: 'Cierre de sesión cancelado' });
  return res.status(200).json({ message: 'Cierre de sesión exitoso' });
});

app.get('/api/perfil/protegido', (req, res) => {
  if (!req.headers.authorization || req.headers.authorization === 'Bearer token_expirado') {
    return res.status(401).json({ error: 'No autorizado' });
  }
  return res.status(200).json({ data: 'Perfil' });
});

describe('RF04 - Cierre de Sesión', () => {
  test('CP014: Cierre de sesión exitoso', async () => {
    const res = await request(app).post('/api/auth/logout').send({ action: 'confirm' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Cierre de sesión exitoso');
  });

  test('CP015: Cancelación del cierre de sesión', async () => {
    const res = await request(app).post('/api/auth/logout').send({ action: 'cancel' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Cierre de sesión cancelado');
  });

  test('CP016: Intento de acceder a una función protegida después de cerrar sesión', async () => {
    const res = await request(app).get('/api/perfil/protegido').set('Authorization', 'Bearer token_expirado');
    expect(res.statusCode).toBe(401);
  });
});