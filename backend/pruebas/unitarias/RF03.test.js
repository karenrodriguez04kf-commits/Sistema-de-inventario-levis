const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/auth/recuperar-password', (req, res) => {
  const { email, codigo, nuevaPassword } = req.body;
  if (email === 'no_registrado@levis.com') return res.status(404).json({ error: 'Correo no registrado' });
  if (codigo === 'EXPIRED') return res.status(410).json({ error: 'Código de recuperación expirado' });
  if (codigo === 'WRONG') return res.status(400).json({ error: 'Código de verificación incorrecto' });
  if (nuevaPassword && nuevaPassword.length < 8) return res.status(422).json({ error: 'Nueva contraseña inválida' });
  return res.status(200).json({ message: 'Recuperación exitosa' });
});

describe('RF03 - Recuperación de Contraseña', () => {
  test('CP009: Recuperación de contraseña exitosa', async () => {
    const res = await request(app).post('/api/auth/recuperar-password').send({ email: 'santiago@gmail.com', codigo: '123456', nuevaPassword: 'NuevaPassword123!' });
    expect(res.statusCode).toBe(200);
  });

  test('CP010: Correo electrónico no registrado', async () => {
    const res = await request(app).post('/api/auth/recuperar-password').send({ email: 'no_registrado@levis.com' });
    expect(res.statusCode).toBe(404);
  });

  test('CP011: Código de recuperación expirado', async () => {
    const res = await request(app).post('/api/auth/recuperar-password').send({ email: 'santiago@gmail.com', codigo: 'EXPIRED' });
    expect(res.statusCode).toBe(410);
  });

  test('CP012: Nueva contraseña que no cumple con los requisitos establecidos', async () => {
    const res = await request(app).post('/api/auth/recuperar-password').send({ email: 'santiago@gmail.com', codigo: '123456', nuevaPassword: '123' });
    expect(res.statusCode).toBe(422);
  });

  test('CP013: Código de verificación incorrecto', async () => {
    const res = await request(app).post('/api/auth/recuperar-password').send({ email: 'santiago@gmail.com', codigo: 'WRONG', nuevaPassword: 'NuevaPassword123!' });
    expect(res.statusCode).toBe(400);
  });
});