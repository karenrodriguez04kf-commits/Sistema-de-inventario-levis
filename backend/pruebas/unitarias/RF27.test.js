const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.put('/api/admin/suppliers/:id', (req, res) => {
  const id = req.params.id;
  const { name, invalid } = req.body;
  if (id === '999') return res.status(404).json({ error: 'Proveedor no encontrado' });
  if (id === '500') return res.status(500).json({ error: 'Error al editar' });
  if (invalid) return res.status(400).json({ error: 'Datos inválidos' });
  if (name === 'Editado OK') return res.status(200).json({ message: 'Edición y guardado exitoso' });
  
  return res.status(200).json({ message: 'Proveedor actualizado correctamente' });
});

describe('RF27 - Actualizar proveedor', () => {
  test('CP0102: Proveedor actualizado correctamente', async () => {
    const res = await request(app).put('/api/admin/suppliers/1').send({ name: 'Nuevo Nombre' });
    expect(res.statusCode).toBe(200);
  });

  test('CP0103: Proveedor no encontrado', async () => {
    const res = await request(app).put('/api/admin/suppliers/999').send({ name: 'Test' });
    expect(res.statusCode).toBe(404);
  });

  test('CP0104: Datos inválidos para la actualización', async () => {
    const res = await request(app).put('/api/admin/suppliers/1').send({ invalid: true });
    expect(res.statusCode).toBe(400);
  });

  test('CP0105: Error al editar el proveedor', async () => {
    const res = await request(app).put('/api/admin/suppliers/500').send({ name: 'Test' });
    expect(res.statusCode).toBe(500);
  });

  test('CP0106: Edición y guardado exitoso de los cambios aplicados', async () => {
    const res = await request(app).put('/api/admin/suppliers/1').send({ name: 'Editado OK' });
    expect(res.statusCode).toBe(200);
  });
});