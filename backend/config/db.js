const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false // Vital para conectar de Render a Aiven sin errores de certificado
    }
});

// Verificación simple para confirmar que el pool se creó correctamente
console.log('Pool de conexión a MySQL configurado exitosamente para Aiven... 🚀');

module.exports = db;