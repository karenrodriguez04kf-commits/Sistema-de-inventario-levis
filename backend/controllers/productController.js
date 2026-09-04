const db = require('../config/db');

// 0. OBTENER REPORTE DE VENTAS
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

// 1. OBTENER CATÁLOGO
exports.getCatalogo = (req, res) => {
    const sql = `
        SELECT p.*, c.nombre AS categoria,
               pt.talla, pt.stock, pt.id_talla
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN producto_tallas pt ON p.id_producto = pt.id_producto
        WHERE pt.stock > 0 AND (p.activo = 1 OR p.activo IS NULL)
        ORDER BY p.id_producto`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const agrupados = {};
        results.forEach(row => {
            if (!agrupados[row.id_producto]) {
                agrupados[row.id_producto] = { ...row, tallas: [] };
                delete agrupados[row.id_producto].talla;
                delete agrupados[row.id_producto].stock;
                delete agrupados[row.id_producto].id_talla;
            }
            if (row.talla) {
                agrupados[row.id_producto].tallas.push({
                    id_talla: row.id_talla,
                    talla: row.talla,
                    stock: row.stock
                });
            }
        });

        res.json(Object.values(agrupados));
    });
};

// 2. OBTENER TODOS LOS PRODUCTOS (ADMIN)
exports.getAllProducts = (req, res) => {
    const sql = `
        SELECT p.*, c.nombre AS categoria, pr.nombre AS nombreProveedor,
               pt.talla, pt.stock, pt.id_talla
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
        LEFT JOIN producto_tallas pt ON p.id_producto = pt.id_producto
        ORDER BY p.id_producto`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const agrupados = {};
        results.forEach(row => {
            if (!agrupados[row.id_producto]) {
                agrupados[row.id_producto] = { ...row, tallas: [] };
                delete agrupados[row.id_producto].talla;
                delete agrupados[row.id_producto].stock;
                delete agrupados[row.id_producto].id_talla;
            }
            if (row.talla) {
                agrupados[row.id_producto].tallas.push({
                    id_talla: row.id_talla,
                    talla: row.talla,
                    stock: row.stock
                });
            }
        });

        res.json(Object.values(agrupados));
    });
};

// 3. CREAR PRODUCTO
exports.createProduct = (req, res) => {
    const { nombreProducto, descripcionProducto, precioProducto, genero, color, id_categoria, id_proveedor, tallas } = req.body;
    const imagen = req.file ? `/images/${req.file.filename}` : req.body.imagen;

    db.query("SELECT id_producto FROM productos WHERE nombreProducto = ?", [nombreProducto], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) return res.status(400).json({ error: "Ya existe un producto con ese nombre" });

        const sql = `INSERT INTO productos 
            (nombreProducto, descripcionProducto, precioProducto, genero, color, imagen, id_categoria, id_proveedor, activo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`;

        db.query(sql, [nombreProducto, descripcionProducto, precioProducto, genero, color || null, imagen, id_categoria || null, id_proveedor || null], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const id_producto = result.insertId;
            const tallasArray = tallas ? (typeof tallas === 'string' ? JSON.parse(tallas) : tallas) : [];

            if (tallasArray.length > 0) {
                const valoresTallas = tallasArray.map(t => [id_producto, t.talla, t.stock || 0]);
                db.query('INSERT INTO producto_tallas (id_producto, talla, stock) VALUES ?', [valoresTallas], (errTalla) => {
                    if (errTalla) return res.status(500).json({ error: errTalla.message });
                    res.json({ Status: "Exito", Message: "Producto guardado con éxito", id_producto });
                });
            } else {
                const tallasDefault = ['S', 'M', 'L', 'XL', 'XXL'].map(t => [id_producto, t, 0]);
                db.query('INSERT INTO producto_tallas (id_producto, talla, stock) VALUES ?', [tallasDefault], (errTalla) => {
                    if (errTalla) return res.status(500).json({ error: errTalla.message });
                    res.json({ Status: "Exito", Message: "Producto guardado con éxito", id_producto });
                });
            }
        });
    });
};

// 4. ACTUALIZAR PRODUCTO
exports.updateProduct = (req, res) => {
    const { id } = req.params;
    let { nombreProducto, descripcionProducto, precioProducto, genero, color, categoria, id_categoria, id_proveedor, tallas } = req.body;
    const imagen = req.file ? `/images/${req.file.filename}` : req.body.imagen;

    const ejecutarUpdate = (finalIdCategoria) => {
        const sql = `UPDATE productos SET 
            nombreProducto = ?, 
            descripcionProducto = ?, 
            precioProducto = ?, 
            genero = ?, 
            color = ?, 
            imagen = COALESCE(?, imagen), 
            id_categoria = ?, 
            id_proveedor = ? 
            WHERE id_producto = ?`;

        const values = [
            nombreProducto, 
            descripcionProducto || null, 
            precioProducto, 
            genero, 
            color || null, 
            imagen || null, 
            finalIdCategoria || null, 
            id_proveedor || null, 
            id
        ];

        db.query(sql, values, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (tallas !== undefined) {
                let tallasArray = [];
                try {
                    tallasArray = typeof tallas === 'string' ? JSON.parse(tallas) : tallas;
                } catch (e) {
                    tallasArray = [];
                }

                db.query('DELETE FROM producto_tallas WHERE id_producto = ?', [id], (errDel) => {
                    if (errDel) return res.status(500).json({ error: errDel.message });

                    if (Array.isArray(tallasArray) && tallasArray.length > 0) {
                        const valoresTallas = tallasArray.map(t => [id, t.talla, t.stock || 0]);
                        db.query('INSERT INTO producto_tallas (id_producto, talla, stock) VALUES ?', [valoresTallas], (errTalla) => {
                            if (errTalla) return res.status(500).json({ error: errTalla.message });
                            return res.json({ Status: "Exito", Message: "Producto y stock actualizados correctamente" });
                        });
                    } else {
                        return res.json({ Status: "Exito", Message: "Producto actualizado correctamente (sin tallas)" });
                    }
                });
            } else {
                res.json({ Status: "Exito", Message: "Producto actualizado correctamente" });
            }
        });
    };

    if (id_categoria) {
        ejecutarUpdate(id_categoria);
    } else if (categoria && isNaN(categoria)) {
        db.query("SELECT id_categoria FROM categorias WHERE nombre = ?", [categoria], (errCat, catResult) => {
            if (errCat) return res.status(500).json({ error: errCat.message });
            const resolvedId = catResult.length > 0 ? catResult[0].id_categoria : null;
            ejecutarUpdate(resolvedId);
        });
    } else {
        ejecutarUpdate(categoria || null);
    }
};

// 5. CAMBIAR ESTADO DE PRODUCTO (Alternar Activo / Inactivo con IF)
exports.toggleProductStatus = (req, res) => {
    const { id } = req.params;

    // Soportamos tanto si mandan { activo: 0/1 } como si solo hacen la petición para invertir el valor actual
    const sql = req.body.activo !== undefined 
        ? "UPDATE productos SET activo = ? WHERE id_producto = ?"
        : "UPDATE productos SET activo = IF(activo = 1, 0, 1) WHERE id_producto = ?";

    const params = req.body.activo !== undefined ? [req.body.activo ? 1 : 0, id] : [id];

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado" });

        res.json({ Status: "Exito", Message: "Estado del producto actualizado correctamente" });
    });
};

// 6. OBTENER CATEGORÍAS
exports.getCategorias = (req, res) => {
    const sql = "SELECT * FROM categorias";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 7. FINALIZAR COMPRA
exports.finalizarCompra = (req, res) => {
    res.json({ Status: "Exito", Message: "Compra finalizada correctamente" });
};

// 8. OBTENER PEDIDOS DE USUARIO (Básico)
exports.getPedidosUsuario = (req, res) => {
    const { id_usuario } = req.params;
    const sql = "SELECT * FROM ventas WHERE id_usuario = ?";
    db.query(sql, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 9. OBTENER MIS PEDIDOS DETALLADOS
exports.getMisPedidos = (req, res) => {
    const { id_usuario } = req.params;
    const query = `
        SELECT v.id_venta, v.fecha, v.total, 
               dv.cantidad, dv.precioUnitario, dv.talla, 
               p.nombreProducto, p.imagen
        FROM venta v
        JOIN detalleventa dv ON v.id_venta = dv.id_venta
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE v.id_usuario = ?
        ORDER BY v.id_venta DESC
    `;
    db.query(query, [id_usuario], (err, rows) => {
        if (err) {
            console.error("Error al obtener mis pedidos:", err);
            return res.status(500).json({ error: "Error al obtener los pedidos del usuario" });
        }
        res.json(rows);
    });
};