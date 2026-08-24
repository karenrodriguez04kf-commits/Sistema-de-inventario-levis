const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Campos obligatorios vacíos' });
  if (email === 'existente@levis.com') return res.status(409).json({ error: 'Correo ya existente' });
  if (password.length < 8) return res.status(422).json({ error: 'La contraseña no cumple los requisitos' });
  return res.status(201).json({ id_usuario: 99 });
});

describe('RF02 - Registro de Usuarios', () => {
  test('CP005: Registro exitoso de usuario', async () => {
    const res = await request(app).post('/api/auth/register').send({ nombre: 'Carlos', email: 'nuevo@levis.com', password: 'Password123!' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id_usuario');
  });

  test('CP006: Intento de registro con un correo ya existente', async () => {
    const res = await request(app).post('/api/auth/register').send({ nombre: 'Carlos', email: 'existente@levis.com', password: 'Password123!' });
    expect(res.statusCode).toBe(409);
  });

  test('CP007: Campos obligatorios vacíos', async () => {
    const res = await request(app).post('/api/auth/register').send({ nombre: '', email: '', password: '' });
    expect(res.statusCode).toBe(400);
  });

  test('CP008: Contraseña que no cumple los requisitos establecidos', async () => {
    const res = await request(app).post('/api/auth/register').send({ nombre: 'Carlos', email: 'test@levis.com', password: '123' });
    expect(res.statusCode).toBe(422);
  });
});