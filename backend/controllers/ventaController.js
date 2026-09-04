const db = require('../config/db');

exports.getReporteVentas = (req, res) => {
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

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error en la consulta de Reporte de Ventas:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

exports.getCategorias = (req, res) => {
    db.query('SELECT * FROM categorias', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};