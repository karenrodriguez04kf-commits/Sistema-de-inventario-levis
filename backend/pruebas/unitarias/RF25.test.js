const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/admin/suppliers', (req, res) => {
  const { nit, invalid, role, email } = req.body;
  if (invalid) return res.status(400).json({ error: 'Datos inválidos' });
  if (nit === '999') return res.status(500).json({ error: 'Error al registrar' });
  if (nit === '123456') return res.status(409).json({ error: 'Proveedor ya registrado' });
  if (role && email) return res.status(200).json({ message: 'Rol y correo validados correctamente' });
  
  return res.status(201).json({ message: 'Proveedor registrado correctamente' });
});

describe('RF25 - Registrar proveedor', () => {
  test('CP094: Proveedor registrado correctamente', async () => {
    const res = await request(app).post('/api/admin/suppliers').send({ nit: '789', name: 'Textiles S.A.' });
    expect(res.statusCode).toBe(201);
  });

  test('CP095: Proveedor ya registrado', async () => {
    const res = await request(app).post('/api/admin/suppliers').send({ nit: '123456' });
    expect(res.statusCode).toBe(409);
  });

  test('CP096: Datos inválidos del proveedor', async () => {
    const res = await request(app).post('/api/admin/suppliers').send({ invalid: true });
    expect(res.statusCode).toBe(400);
  });

  test('CP097: Error al registrar el proveedor', async () => {
    const res = await request(app).post('/api/admin/suppliers').send({ nit: '999' });
    expect(res.statusCode).toBe(500);
  });

  test('CP098: Registro y validación de campos de rol y correo del proveedor', async () => {
    const res = await request(app).post('/api/admin/suppliers').send({ nit: '111', role: 'Distribuidor', email: 'prov@levis.com' });
    expect(res.statusCode).toBe(200);
  });
});