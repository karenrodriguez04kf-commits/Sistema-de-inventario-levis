const db = require('../config/db'); // Importa el pool de MySQL de backend/config/db.js
const bcrypt = require('bcryptjs'); // Asegúrate de tener instalado bcryptjs si usas hash, o mantén comparación directa
const jwt = require('jsonwebtoken');

// ==========================================
// 1. CONTROLADOR DE INICIO DE SESIÓN (LOGIN)
// ==========================================
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validar que se hayan enviado las credenciales necesarias
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: 'Por favor, ingresa el correo electrónico y la contraseña.'
            });
        }

        // Consultar el usuario en la base de datos (se usa destructuring para los resultados de MySQL)
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                error: true,
                message: 'Credenciales inválidas: el usuario no existe.'
            });
        }

        const usuario = rows[0];

        // Verificación de contraseña (Soporta Hash con Bcrypt o texto plano según tu DB)
        let isPasswordValid = false;
        
        if (usuario.password && usuario.password.startsWith('$2')) {
            // Si la contraseña almacenada está encriptada con Bcrypt
            isPasswordValid = await bcrypt.compare(password, usuario.password);
        } else {
            // Comparación directa en texto plano (en caso de pruebas locales o registros antiguos)
            isPasswordValid = (usuario.password === password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                error: true,
                message: 'Credenciales inválidas: la contraseña es incorrecta.'
            });
        }

        // Generar Token JWT (Si tu backend utiliza JWT para autenticar sesiones)
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

        // Omitir devolver la contraseña en la respuesta JSON por seguridad
        delete usuario.password;

        return res.status(200).json({
            ok: true,
            message: 'Inicio de sesión exitoso',
            token: token,
            usuario: usuario
        });

    } catch (error) {
        console.error('🔥 Error durante el proceso de login:', error);
        // Pasa el error al middleware global de server.js para evitar la caída del proceso (502)
        next(error);
    }
};

// ==========================================
// 2. CONTROLADOR DE REGISTRO DE USUARIOS
// ==========================================
const register = async (req, res, next) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                error: true,
                message: 'Todos los campos obligatorios (nombre, email, password) deben ser completados.'
            });
        }

        // Verificar si el usuario ya se encuentra registrado
        const [existingUser] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(409).json({
                error: true,
                message: 'El correo electrónico ya se encuentra registrado.'
            });
        }

        // Encriptar contraseña antes de guardar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario en MySQL
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
// 3. OBTENER INFORMACIÓN DEL PERFIL
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

module.exports = {
    login,
    register,
    getProfile
};