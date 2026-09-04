const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const ventaRoutes = require('./routes/ventaRoutes');

const validarToken = require('./middlewares/authMiddleware');
const authAdmin = require('./middlewares/authAdmin');

const app = express();

app.disable('x-powered-by');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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

global.db = db;

app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.get('/proveedores', (req, res) => {
  const sql = 'SELECT * FROM proveedores';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

// ==========================================
// RUTA DIRECTA DE REPORTE DE VENTAS BLINDADA
// ==========================================
app.get('/api/ReporteVentas', validarToken, authAdmin, (req, res) => {
    console.log("¡Petición recibida en /api/ReporteVentas!");
    
    const sql = `
        SELECT 
            v.id_venta,
            v.total AS total_venta,
            v.fecha,
            u.nombre AS nombre_usuario,
            u.email AS email_usuario,
            dv.cantidad,
            dv.precioUnitario,
            COALESCE(dv.talla, 'N/A') AS talla,
            pr.nombreProducto,
            pr.imagen
        FROM venta v
        JOIN detalleventa dv ON v.id_venta = dv.id_venta
        JOIN productos pr ON dv.id_producto = pr.id_producto
        JOIN usuarios u ON v.id_usuario = u.id_usuario
        ORDER BY v.fecha DESC`;

    global.db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error en SQL de Reporte de Ventas:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.use('/api', ventaRoutes);

app.listen(3002, () => {
  console.log("Servidor de Inventario Levis corriendo en el puerto 3002");
});