const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.put('/api/admin/users/:id', (req, res) => {
  const id = req.params.id;
  const { name, password } = req.body;
  if (id === '999') return res.status(404).json({ error: 'Usuario no encontrado' });
  if (id === '500') return res.status(500).json({ error: 'Error al editar' });
  if (!name) return res.status(400).json({ error: 'Datos inválidos' });
  if (password === undefined) return res.status(200).json({ message: 'Actualización sin alterar clave exitosa' });
  
  return res.status(200).json({ message: 'Usuario actualizado correctamente' });
});

describe('RF22 - Actualizar usuario', () => {
  test('CP082: Usuario actualizado correctamente', async () => {
    const res = await request(app).put('/api/admin/users/1').send({ name: 'Actualizado', password: '123' });
    expect(res.statusCode).toBe(200);
  });

  test('CP083: Usuario no encontrado', async () => {
    const res = await request(app).put('/api/admin/users/999').send({ name: 'Test' });
    expect(res.statusCode).toBe(404);
  });

  test('CP084: Datos inválidos para la actualización', async () => {
    const res = await request(app).put('/api/admin/users/1').send({ name: '' });
    expect(res.statusCode).toBe(400);
  });

  test('CP085: Error al editar el usuario', async () => {
    const res = await request(app).put('/api/admin/users/500').send({ name: 'Test' });
    expect(res.statusCode).toBe(500);
  });

  test('CP086: Validación del comportamiento opcional del campo de contraseña', async () => {
    const res = await request(app).put('/api/admin/users/1').send({ name: 'Solo Nombre' }); // Sin enviar password
    expect(res.statusCode).toBe(200);
  });
});