const db = require('../config/db');
const bcrypt = require('bcrypt');

const getUsuarios = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT id_usuario, nombre, email, rol, telefono, direccion FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

const crearUsuario = async (req, res) => {
    const { nombre, email, password, rol, telefono, direccion } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await db.promise().query(
            'INSERT INTO usuarios (nombre, email, password, rol, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, hash, rol, telefono || null, direccion || null]
        );
        res.json({ mensaje: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
};

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, telefono, direccion } = req.body;
    try {
        await db.promise().query(
            'UPDATE usuarios SET nombre=?, email=?, rol=?, telefono=?, direccion=? WHERE id_usuario=?',
            [nombre, email, rol, telefono || null, direccion || null, id]
        );
        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query('DELETE FROM usuarios WHERE id_usuario=?', [id]);
        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};

module.exports = { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };