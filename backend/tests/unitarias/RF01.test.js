const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Campos obligatorios vacíos' });
  if (email === 'error@test.com') return res.status(500).json({ error: 'Error de conexión con el servidor' });
  if (password === 'wrong') return res.status(401).json({ error: 'Credenciales incorrectas' });
  return res.status(200).json({ token: 'jwt_fake_token_12345' });
});

describe('RF01 - Inicio de Sesión', () => {
  test('CP001: Inicio de sesión exitoso', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'santiago@gmail.com', password: '123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('CP002: Credenciales incorrectas', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'santiago@gmail.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  test('CP003: Campos obligatorios vacíos', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '', password: '' });
    expect(res.statusCode).toBe(400);
  });

  test('CP004: Error de conexión con el servidor', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'error@test.com', password: '123' });
    expect(res.statusCode).toBe(500);
  });
});