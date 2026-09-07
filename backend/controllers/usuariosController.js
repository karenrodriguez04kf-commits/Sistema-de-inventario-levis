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
    const { nombre, email, password, rol, telefono, direccion } = req.body;
    
    try {
        // Verificamos si se envió una contraseña nueva y no está vacía
        if (password && password.trim() !== '') {
            const hash = await bcrypt.hash(password, 10);
            await db.promise().query(
                'UPDATE usuarios SET nombre=?, email=?, password=?, rol=?, telefono=?, direccion=? WHERE id_usuario=?',
                [nombre, email, hash, rol, telefono || null, direccion || null, id]
            );
        } else {
            // Si no se envió contraseña, actualizamos todo MENOS el password
            await db.promise().query(
                'UPDATE usuarios SET nombre=?, email=?, rol=?, telefono=?, direccion=? WHERE id_usuario=?',
                [nombre, email, rol, telefono || null, direccion || null, id]
            );
        }
        
        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
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

const recuperar = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.promise().query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.json({ success: true, message: 'Si el correo está registrado, recibirás las instrucciones.' });
        }

        const usuarioId = users[0].id_usuario;
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const mensaje = `Tu código de recuperación es: ${token}`;

        await db.promise().query(
            'INSERT INTO notificaciones (usuario_id, mensaje, token) VALUES (?, ?, ?)',
            [usuarioId, mensaje, token]
        );

        res.json({ success: true, message: 'Código de verificación generado en tu bandeja interna.' });
    } catch (error) {
        console.error("Error al recuperar contraseña:", error);
        res.status(500).json({ mensaje: 'Error al procesar la recuperación' });
    }
};
const cambiarContrasena = async (req, res) => {
    const { email, token, nuevaPassword } = req.body;
    try {
        // 1. Buscar al usuario por correo
        const [users] = await db.promise().query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        const usuarioId = users[0].id_usuario;

        // 2. Verificar si el token existe y es válido para este usuario
        const [notif] = await db.promise().query(
            'SELECT * FROM notificaciones WHERE usuario_id = ? AND token = ? AND leido = 0 ORDER BY id DESC LIMIT 1',
            [usuarioId, token]
        );

        if (notif.length === 0) {
            return res.status(400).json({ mensaje: 'Código de verificación inválido o ya expiró' });
        }

        // 3. Hashear la nueva contraseña
        const hash = await bcrypt.hash(nuevaPassword, 10);

        // 4. Actualizar la contraseña en la tabla usuarios
        await db.promise().query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hash, usuarioId]);

        // 5. Marcar el token como usado (leido = 1) para que no se pueda reutilizar
        await db.promise().query('UPDATE notificaciones SET leido = 1 WHERE id = ?', [notif[0].id]);

        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ mensaje: 'Error al actualizar la contraseña' });
    }
};
const verBandejaInterna = async (req, res) => {
    const { email } = req.params;
    try {
        const [users] = await db.promise().query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        const usuarioId = users[0].id_usuario;

        const [mensajes] = await db.promise().query(
            'SELECT * FROM notificaciones WHERE usuario_id = ? AND leido = 0 ORDER BY id DESC',
            [usuarioId]
        );
        res.json(mensajes);
    } catch (error) {
        console.error("Error al consultar bandeja:", error);
        res.status(500).json({ mensaje: 'Error al consultar la bandeja interna' });
    }
};
module.exports = { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, recuperar, cambiarContrasena, verBandejaInterna };