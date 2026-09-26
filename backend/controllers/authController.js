const db = require('../config/db'); // Importa el pool de MySQL (backend/config/db.js)
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// ==========================================
// 1. INICIO DE SESIÓN (LOGIN)
// ==========================================
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: 'Por favor, ingresa el correo electrónico y la contraseña.'
            });
        }

        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                error: true,
                message: 'Credenciales inválidas: el usuario no existe.'
            });
        }

        const usuario = rows[0];

        let isPasswordValid = false;
        if (usuario.password && usuario.password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, usuario.password);
        } else {
            isPasswordValid = (usuario.password === password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                error: true,
                message: 'Credenciales inválidas: la contraseña es incorrecta.'
            });
        }

        const secretKey = process.env.JWT_SECRET || 'secreto_adso_sistema_inventario';
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                rol: usuario.rol || 'usuario' 
            },
            secretKey,
            { expiresIn: '8h' }
        );

        delete usuario.password;

        return res.status(200).json({
            ok: true,
            message: 'Inicio de sesión exitoso',
            token: token,
            usuario: usuario
        });

    } catch (error) {
        console.error('🔥 Error durante el proceso de login:', error);
        next(error);
    }
};

// ==========================================
// 2. REGISTRO DE USUARIO
// ==========================================
const register = async (req, res, next) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                error: true,
                message: 'Todos los campos obligatorios deben ser completados.'
            });
        }

        const [existingUser] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(409).json({
                error: true,
                message: 'El correo electrónico ya se encuentra registrado.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, rol || 'usuario']
        );

        return res.status(201).json({
            ok: true,
            message: 'Usuario registrado con éxito',
            userId: result.insertId
        });

    } catch (error) {
        console.error('🔥 Error durante el registro de usuario:', error);
        next(error);
    }
};

// ==========================================
// 3. OBTENER PERFIL DE USUARIO
// ==========================================
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : req.params.id;

        const [rows] = await db.execute(
            'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = ?', 
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Usuario no encontrado.'
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: rows[0]
        });

    } catch (error) {
        console.error('🔥 Error al obtener perfil del usuario:', error);
        next(error);
    }
};

// ==========================================
// 4. CAMBIAR CONTRASEÑA
// ==========================================
const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: true,
                message: 'Debes proporcionar la contraseña actual y la nueva contraseña.'
            });
        }

        const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: true, message: 'Usuario no encontrado.' });
        }

        const usuario = rows[0];
        let isValid = false;

        if (usuario.password && usuario.password.startsWith('$2')) {
            isValid = await bcrypt.compare(currentPassword, usuario.password);
        } else {
            isValid = (usuario.password === currentPassword);
        }

        if (!isValid) {
            return res.status(401).json({ error: true, message: 'La contraseña actual es incorrecta.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await db.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedNewPassword, id]);

        return res.status(200).json({
            ok: true,
            message: 'Contraseña actualizada con éxito.'
        });

    } catch (error) {
        console.error('🔥 Error al cambiar la contraseña:', error);
        next(error);
    }
};

// ==========================================
// 5. VERIFICAR TOKEN DE AUTENTICACIÓN
// ==========================================
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: true, message: 'No se proporcionó token.' });
        }

        const secretKey = process.env.JWT_SECRET || 'secreto_adso_sistema_inventario';
        const decoded = jwt.verify(token, secretKey);

        return res.status(200).json({
            ok: true,
            message: 'Token válido',
            usuario: decoded
        });

    } catch (error) {
        return res.status(401).json({
            error: true,
            message: 'Token inválido o expirado.'
        });
    }
};

module.exports = {
    login,
    register,
    getProfile,
    changePassword,
    verifyToken
};