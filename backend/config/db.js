// backend/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 segundos máximo para conectar
});

// Prueba de conexión inicial al arrancar el servidor
pool.getConnection()
    .then((conn) => {
        console.log('✅ Conexión a MySQL exitosa en Railway');
        conn.release();
    })
    .catch((err) => {
        console.error('❌ Error crítico al conectar con MySQL:', err.message);
    });

module.exports = pool;