const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.put('/api/usuarios/perfil', (req, res) => {
  const { nombre, correo, telefono, password, action } = req.body;

  if (action === 'cancel') return res.status(200).json({ message: 'Actualización cancelada' });
  if (!nombre || !correo) return res.status(400).json({ error: 'Campos obligatorios vacíos' });
  if (correo === 'registrado@levis.com') return res.status(409).json({ error: 'Correo ya registrado' });
  if (telefono && isNaN(telefono)) return res.status(422).json({ error: 'Teléfono debe ser numérico' });

  return res.status(200).json({ message: 'Datos actualizados', passwordConservada: password === '' });
});

describe('RF05 - Actualización de Datos Personales', () => {
  test('CP017: Actualización exitosa de los datos personales', async () => {
    const res = await request(app).put('/api/usuarios/perfil').send({ nombre: 'Santiago', correo: 'santiago@levis.com', telefono: '3001234567' });
    expect(res.statusCode).toBe(200);
  });

  test('CP018: Intento de guardar datos con campos obligatorios vacíos', async () => {
    const res = await request(app).put('/api/usuarios/perfil').send({ nombre: '', correo: '' });
    expect(res.statusCode).toBe(400);
  });

  test('CP019: Intento de actualizar el correo con uno ya registrado', async () => {
    const res = await request(app).put('/api/usuarios/perfil').send({ nombre: 'Santiago', correo: 'registrado@levis.com' });
    expect(res.statusCode).toBe(409);
  });

  test('CP020: Cancelación de la actualización de datos', async () => {
    const res = await request(app).put('/api/usuarios/perfil').send({ action: 'cancel' });
    expect(res.statusCode).toBe(200);
  });

  test('CP021: Validación de campos de formato especial (caracteres no numéricos en teléfono)', async () => {
    const res = await request(app).put('/api/usuarios/perfil').send({ nombre: 'Santiago', correo: 'santiago@levis.com', telefono: 'ABC12345' });
    expect(res.statusCode).toBe(422);
  });

  test('CP022: Comprobación del comportamiento del campo de contraseña al dejarlo en blanco', async () => {
    const res = await request(app).put('/api/usuarios/perfil').send({ nombre: 'Santiago', correo: 'santiago@levis.com', password: '' });
    expect(res.statusCode).toBe(200);
    expect(res.body.passwordConservada).toBe(true);
  });
});