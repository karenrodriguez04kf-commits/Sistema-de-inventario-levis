const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

// Ocultar la versión de Express por seguridad (recomendación SonarQube)
app.disable('x-powered-by');

// Configuración de middlewares
// Configuración segura de CORS
app.use(cors({
  origin: 'http://localhost:5173', // O la URL exacta donde corre tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexión a tu base de datos real en phpMyAdmin
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'levis_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos levis_db exitosamente.');
});

// Ruta de ejemplo para consultar los productos de tu base de datos
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

// Ruta de ejemplo para consultar los proveedores
app.get('/proveedores', (req, res) => {
  const sql = 'SELECT * FROM proveedores';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

// Puerto del servidor
app.listen(3001, () => {
  console.log("Servidor de Inventario Levis corriendo en el puerto 3001");
});