const mysql = require('mysql2');
require('dotenv').config(); // Asegura que lea el archivo .env

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10
});

console.log('Conectado exitosamente a la base de datos de Railway... 🚀');

module.exports = db;