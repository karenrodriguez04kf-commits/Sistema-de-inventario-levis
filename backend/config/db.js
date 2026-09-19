const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// Verificación simple para confirmar que el pool se creó correctamente
console.log('Pool de conexión a MySQL configurado exitosamente... 🚀');

module.exports = db;