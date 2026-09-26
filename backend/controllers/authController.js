const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. INICIO DE SESIÓN (LOGIN)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Consulta de usuario en la base de datos
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas (Usuario no encontrado)' });
    }

    const usuario = rows[0];

    // Verificación de contraseña (soporta texto plano o hash con bcrypt)
    let isPasswordValid = false;
    if (usuario.password && (usuario.password.startsWith('$2b$') || usuario.password.startsWith('$2a$'))) {
      isPasswordValid = await bcrypt.compare(password, usuario.password);
    } else {
      isPasswordValid = (password === usuario.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas (Contraseña incorrecta)' });
    }

    // Generación del token JWT
    const token = jwt.sign(
      { id: usuario.id_usuario || usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id_usuario || usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('💥 ERROR EN LOGIN:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al procesar el login',
      error: error.message
    });
  }
};

// 2. REGISTRO DE USUARIOS
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Campos requeridos incompletos' });
    }

    const [existing] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRol = rol || 'cliente';

    await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, userRol]
    );

    return res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('💥 ERROR EN REGISTRO:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor al registrar usuario',
      error: error.message
    });
  }
};

// 3. OBTENER PERFIL DE USUARIO
exports.getPerfil = async (req, res) => {
  try {
    const { email } = req.params;

    const [rows] = await db.query(
      'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE email = ?',
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error('💥 ERROR EN GET PERFIL:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

// 4. ACTUALIZAR PERFIL
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE usuarios SET nombre = ?, password = ? WHERE email = ?',
        [nombre, hashedPassword, email]
      );
    } else {
      await db.query(
        'UPDATE usuarios SET nombre = ? WHERE email = ?',
        [nombre, email]
      );
    }

    return res.status(200).json({ message: 'Perfil actualizado correctamente' });

  } catch (error) {
    console.error('💥 ERROR EN ACTUALIZAR PERFIL:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el perfil',
      error: error.message
    });
  }
};

// 5. RECUPERAR CONTRASEÑA
exports.recuperarPassword = async (req, res) => {
  try {
    const { email, nuevaPassword } = req.body;

    if (!email || !nuevaPassword) {
      return res.status(400).json({ message: 'Datos incompletos para recuperar contraseña' });
    }

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    const [result] = await db.query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró un usuario con ese correo' });
    }

    return res.status(200).json({ message: 'Contraseña restablecida correctamente' });

  } catch (error) {
    console.error('💥 ERROR EN RECUPERAR PASSWORD:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al restablecer contraseña',
      error: error.message
    });
  }
};