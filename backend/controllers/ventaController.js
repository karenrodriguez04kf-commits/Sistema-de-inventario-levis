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
exports.finalizarCompra = (req, res) => {
    const { id_usuario, total, productos } = req.body;

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío" });
    }

    // 1. Insertar la venta principal
    const sqlVenta = "INSERT INTO venta (id_usuario, total, fecha) VALUES (?, ?, NOW())";
    db.query(sqlVenta, [id_usuario, total], (err, resultVenta) => {
        if (err) {
            console.error("❌ Error al registrar la venta:", err);
            return res.status(500).json({ error: "Error al registrar la venta" });
        }

        const id_venta = resultVenta.insertId;

        // 2. Insertar los detalles de la venta y descontar stock por cada producto/talla
        let detallesQuery = "INSERT INTO detalleventa (id_venta, id_producto, cantidad, precioUnitario, talla) VALUES ?";
        let valoresDetalles = productos.map(item => [
            id_venta,
            item.id_producto,
            item.cantidad,
            item.precioProducto || item.precio,
            item.talla
        ]);

        db.query(detallesQuery, [valoresDetalles], (errDetalle) => {
            if (errDetalle) {
                console.error("❌ Error al registrar detalle de venta:", errDetalle);
                return res.status(500).json({ error: "Error al registrar detalles de la compra" });
            }

            // 3. Descontar el stock de la tabla producto_tallas por cada ítem comprado
            let actualizacionesPendientes = productos.length;
            let huboErrorStock = false;

            productos.forEach(item => {
                const sqlStock = "UPDATE producto_tallas SET stock = stock - ? WHERE id_producto = ? AND talla = ?";
                db.query(sqlStock, [item.cantidad, item.id_producto, item.talla], (errStock) => {
                    if (errStock) {
                        console.error("❌ Error al descontar stock:", errStock);
                        huboErrorStock = true;
                    }

                    actualizacionesPendientes--;
                    
                    // Cuando terminen todas las actualizaciones de stock, respondemos con éxito
                    if (actualizacionesPendientes === 0) {
                        if (huboErrorStock) {
                            return res.status(500).json({ error: "La compra se registró pero hubo un error actualizando algunos stocks" });
                        }
                        return res.status(201).json({ message: "¡Compra finalizada y stock actualizado con éxito!", id_venta });
                    }
                });
            });
        });
    });
};