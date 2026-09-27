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
    console.log("📦 Datos recibidos en el backend:", req.body);

    const { id_usuario, total, productos } = req.body;

    if (!id_usuario || !productos || productos.length === 0) {
        console.log("❌ Faltan datos: id_usuario o productos");
        return res.status(400).json({ error: "Datos de compra incompletos" });
    }

    const sqlVenta = "INSERT INTO venta (id_usuario, total, fecha) VALUES (?, ?, NOW())";
    
    db.query(sqlVenta, [id_usuario, total], (err, resultadoVenta) => {
        if (err) {
            console.error("❌ Error al registrar la venta en SQL:", err);
            return res.status(500).json({ error: "Error al registrar la venta" });
        }

        const id_venta = resultadoVenta.insertId;

        const sqlDetalle = "INSERT INTO detalleventa (id_venta, id_producto, cantidad, precioUnitario, talla) VALUES ?";
        const valoresDetalle = productos.map(p => [
            id_venta, 
            p.id_producto, 
            p.cantidad, 
            p.precioProducto, 
            p.talla || 'N/A'
        ]);

        db.query(sqlDetalle, [valoresDetalle], (errDetalle) => {
            if (errDetalle) {
                console.error("❌ Error al registrar el detalle de venta en SQL:", errDetalle);
                return res.status(500).json({ error: "Error al guardar el detalle de la compra" });
            }

            let actualizacionCompletada = 0;

            productos.forEach(item => {
                // 🛠️ CORREGIDO: Se usa 'producto_tallas' tal cual aparece en tu base de datos
                const sqlStock = "UPDATE producto_tallas SET stock = stock - ? WHERE id_producto = ? AND UPPER(talla) = UPPER(?)";
                
                db.query(sqlStock, [item.cantidad, item.id_producto, item.talla], (errStock, resultadoStock) => {
                    if (errStock) {
                        console.error(`❌ Error al actualizar stock:`, errStock);
                    } else {
                        console.log(`✅ Stock actualizado para producto ID ${item.id_producto}, Talla ${item.talla}. Filas afectadas:`, resultadoStock.affectedRows);
                    }
                    
                    actualizacionCompletada++;
                    if (actualizacionCompletada === productos.length) {
                        return res.status(201).json({ mensaje: "¡Compra finalizada con éxito!" });
                    }
                });
            });
        });
    });
};