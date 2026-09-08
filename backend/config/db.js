const mysql = require('mysql2');

require('dotenv').config({ path: __dirname + '/../.env' });

console.log('--- DEBUG COMPLETO ---');

console.log('HOST:', JSON.stringify(process.env.DB_HOST));
console.log('USER:', JSON.stringify(process.env.DB_USER));
console.log('DATABASE:', JSON.stringify(process.env.DB_NAME));
console.log('PORT:', JSON.stringify(process.env.DB_PORT));

console.log('-----------------------');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a Railway:', err.message);
    return;
  }

  console.log('✅ ¡Conectado exitosamente a la base de datos de Railway! 🚀');
});

module.exports = db;