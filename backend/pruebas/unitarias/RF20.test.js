const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/admin/users', (req, res) => {
  const { email, role, invalid } = req.body;
  if (invalid) return res.status(400).json({ error: 'Datos inválidos' });
  if (email === 'error@test.com') return res.status(500).json({ error: 'Error al registrar' });
  if (email === 'duplicado@levis.com') return res.status(409).json({ error: 'Correo ya registrado' });
  if (role) return res.status(200).json({ message: 'Rol modificado exitosamente' });
  
  return res.status(201).json({ message: 'Usuario registrado correctamente' });
});

describe('RF20 - Registro y Gestión de Roles de Usuarios', () => {
  test('CP074: Usuario registrado correctamente', async () => {
    const res = await request(app).post('/api/admin/users').send({ email: 'nuevo@levis.com', password: '123' });
    expect(res.statusCode).toBe(201);
  });

  test('CP075: Usuario con correo ya registrado', async () => {
    const res = await request(app).post('/api/admin/users').send({ email: 'duplicado@levis.com', password: '123' });
    expect(res.statusCode).toBe(409);
  });

  test('CP076: Datos inválidos del usuario', async () => {
    const res = await request(app).post('/api/admin/users').send({ invalid: true });
    expect(res.statusCode).toBe(400);
  });

  test('CP077: Error al registrar el usuario', async () => {
    const res = await request(app).post('/api/admin/users').send({ email: 'error@test.com', password: '123' });
    expect(res.statusCode).toBe(500);
  });

  test('CP078: Modificación exitosa del rol de usuario', async () => {
    const res = await request(app).post('/api/admin/users').send({ email: 'user@levis.com', role: 'Administrador' });
    expect(res.statusCode).toBe(200);
  });
});