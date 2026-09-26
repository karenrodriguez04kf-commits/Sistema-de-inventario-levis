const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inicio de Sesión (Login)
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                Status: "Error",
                Message: "Por favor, ingresa correo y contraseña."
            });
        }

        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                Status: "Error",
                Message: "Usuario no encontrado."
            });
        }

        const usuario = rows[0];

        // Verificación de contraseña
        let isPasswordValid = false;
        if (usuario.password && usuario.password.startsWith('$2')) {
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

        const secretKey = process.env.JWT_SECRET || 'secreto_adso_sistema_inventario';
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol || 'usuario' },
            secretKey,
            { expiresIn: '8h' }
        );

        delete usuario.password;

        return res.status(200).json({
            Status: "Success",
            Message: "Inicio de sesión exitoso",
            Token: token,
            Usuario: usuario
        });

    } catch (error) {
        console.error("❌ Error en login:", error);
        next(error);
    }
};

module.exports = {
    login
};