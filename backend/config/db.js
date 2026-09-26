const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({ // Usamos Pool para mejor manejo de múltiples conexiones
  
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'levis_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

console.log('Conectado exitosamente a levis_db... 🚀');

module.exports = db;