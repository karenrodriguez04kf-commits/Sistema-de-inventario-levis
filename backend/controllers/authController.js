// ==========================================
// CARGA SEGURA DE DEPENDENCIAS EXTERNAS
// ==========================================
let bcrypt = null;
try {
    bcrypt = require('bcryptjs');
} catch (e) {
    try {
        bcrypt = require('bcrypt');
    } catch (err) {
        console.log('⚠️ Ninguna librería de bcrypt encontrada. Se usará comparación directa de texto.');
    }
}

let jwt = null;
try {
    jwt = require('jsonwebtoken');
} catch (e) {
    console.log('⚠️ jsonwebtoken no instalado. Se omitirá la firma de tokens.');
}

const db = require('../config/db');

// ==========================================
// 1. INICIO DE SESIÓN (LOGIN)
// ==========================================
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                Status: "Error",
                Message: "Por favor, ingresa el correo y la contraseña."
            });
        }

        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (!rows || rows.length === 0) {
            return res.status(401).json({
                Status: "Error",
                Message: "Usuario no encontrado."
            });
        }

        const usuario = rows[0];
        let isPasswordValid = false;

        // Comprobación segura de contraseña
        if (bcrypt && usuario.password && usuario.password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, usuario.password);
        } else {
            isPasswordValid = (usuario.password === password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                Status: "Error",
                Message: "Contraseña incorrecta."
            });
        }

        // Generación de JWT si la librería está disponible
        let token = null;
        if (jwt) {
            token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol || 'usuario' },
                process.env.JWT_SECRET || 'secreto_adso_sistema_inventario',
                { expiresIn: '8h' }
            );
        }

        delete usuario.password;

        return res.status(200).json({
            Status: "Success",
            Message: "Inicio de sesión exitoso",
            Token: token,
            Usuario: usuario
        });

    } catch (error) {
        console.error('🔥 Error en login:', error);
        next(error);
    }
};

// ==========================================
// 2. REGISTRO DE USUARIOS
// ==========================================
const register = async (req, res, next) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                Status: "Error",
                Message: "Nombre, email y contraseña son obligatorios."
            });
        }

        const [existingUser] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUser && existingUser.length > 0) {
            return res.status(409).json({
                Status: "Error",
                Message: "El correo electrónico ya está registrado."
            });
        }

        let finalPassword = password;
        if (bcrypt) {
            const salt = await bcrypt.genSalt(10);
            finalPassword = await bcrypt.hash(password, salt);
        }

        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, finalPassword, rol || 'usuario']
        );

        return res.status(201).json({
            Status: "Success",
            Message: "Usuario registrado exitosamente",
            UserId: result.insertId
        });

    } catch (error) {
        console.error('🔥 Error en registro:', error);
        next(error);
    }
};

// ==========================================
// 3. OBTENER PERFIL DE USUARIO
// ==========================================
const getProfile = async (req, res, next) => {
    try {
        const userId = req.params.id || (req.user ? req.user.id : null);

        if (!userId) {
            return res.status(400).json({
                Status: "Error",
                Message: "Se requiere el ID del usuario."
            });
        }

        const [rows] = await db.execute('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [userId]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                Status: "Error",
                Message: "Usuario no encontrado."
            });
        }

        return res.status(200).json({
            Status: "Success",
            Usuario: rows[0]
        });

    } catch (error) {
        console.error('🔥 Error en getProfile:', error);
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
                Status: "Error",
                Message: "Debes ingresar la contraseña actual y la nueva."
            });
        }

        const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                Status: "Error",
                Message: "Usuario no encontrado."
            });
        }

        const usuario = rows[0];
        let isValid = false;

        if (bcrypt && usuario.password && usuario.password.startsWith('$2')) {
            isValid = await bcrypt.compare(currentPassword, usuario.password);
        } else {
            isValid = (usuario.password === currentPassword);
        }

        if (!isValid) {
            return res.status(401).json({
                Status: "Error",
                Message: "La contraseña actual no es correcta."
            });
        }

        let updatedPassword = newPassword;
        if (bcrypt) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(newPassword, salt);
        }

        await db.execute('UPDATE usuarios SET password = ? WHERE id = ?', [updatedPassword, id]);

        return res.status(200).json({
            Status: "Success",
            Message: "Contraseña actualizada correctamente."
        });

    } catch (error) {
        console.error('🔥 Error en changePassword:', error);
        next(error);
    }
};

// ==========================================
// 5. VERIFICACIÓN DE TOKEN JWT
// ==========================================
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                Status: "Error",
                Message: "No se proporcionó token de autorización."
            });
        }

        const token = authHeader.split(' ')[1];
        if (!jwt) {
            return res.status(500).json({
                Status: "Error",
                Message: "Librería de tokens no disponible en el servidor."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_adso_sistema_inventario');

        return res.status(200).json({
            Status: "Success",
            Message: "Token válido",
            Usuario: decoded
        });

    } catch (error) {
        return res.status(401).json({
            Status: "Error",
            Message: "Token inválido o expirado."
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