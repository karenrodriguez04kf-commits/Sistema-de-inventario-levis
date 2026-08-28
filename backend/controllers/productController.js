const db = require('../config/db');

// 1. OBTENER CATÁLOGO
exports.getCatalogo = (req, res) => {
    const sql = `
        SELECT p.*, c.nombre AS categoria,
               pt.talla, pt.stock, pt.id_talla
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN producto_tallas pt ON p.id_producto = pt.id_producto
        WHERE pt.stock > 0
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
            (nombreProducto, descripcionProducto, precioProducto, genero, color, imagen, id_categoria, id_proveedor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

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
    const { nombreProducto, descripcionProducto, precioProducto, genero, color, id_categoria, id_proveedor, tallas } = req.body;

    let sql = `UPDATE productos SET 
        nombreProducto=?, descripcionProducto=?, precioProducto=?, 
        genero=?, color=?, id_categoria=?, id_proveedor=?`;
    let params = [nombreProducto, descripcionProducto, precioProducto, genero, color || null, id_categoria || null, id_proveedor || null];

    if (req.file) {
        sql += ', imagen=?';
        params.push(`/images/${req.file.filename}`);
    }

    sql += ' WHERE id_producto=?';
    params.push(id);

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const tallasArray = tallas ? (typeof tallas === 'string' ? JSON.parse(tallas) : tallas) : [];

        if (tallasArray.length > 0) {
            const updates = tallasArray.map(t => new Promise((resolve, reject) => {
                db.query(
                    'UPDATE producto_tallas SET stock=? WHERE id_producto=? AND talla=?',
                    [t.stock, id, t.talla],
                    (err) => err ? reject(err) : resolve()
                );
            }));

            Promise.all(updates)
                .then(() => res.json({ Status: "Exito", Message: "Producto actualizado correctamente" }))
                .catch(err => res.status(500).json({ error: err.message }));
        } else {
            res.json({ Status: "Exito", Message: "Producto actualizado correctamente" });
        }
    });
};

// 5. ELIMINAR PRODUCTO (CORREGIDO)
exports.deleteProduct = (req, res) => {
    const { id } = req.params;

    // Paso 1: Eliminar relaciones en la tabla producto_tallas
    db.query('DELETE FROM producto_tallas WHERE id_producto = ?', [id], (errTallas) => {
        if (errTallas) {
            return res.status(500).json({ error: errTallas.message });
        }

        // Paso 2: Eliminar el registro en productos
        db.query('DELETE FROM productos WHERE id_producto = ?', [id], (err) => {
            if (err) {
                // Si el producto ya fue vendido (registrado en detalleventa)
                if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({ 
                        error: "No se puede eliminar el producto porque tiene ventas asociadas." 
                    });
                }
                return res.status(500).json({ error: err.message });
            }

            res.json({ Status: "Exito", Message: "Producto eliminado correctamente" });
        });
    });
};

// 6. FINALIZAR COMPRA
exports.finalizarCompra = (req, res) => {
    const { id_usuario, total, productos } = req.body;

    if (!productos || productos.length === 0) {
        return res.status(400).json({ Message: "El carrito está vacío" });
    }

    const sqlVenta = "INSERT INTO venta (id_usuario, total) VALUES (?, ?)";

    db.query(sqlVenta, [id_usuario, total], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al crear venta", details: err.message });

        const id_venta = result.insertId;

        const valoresDetalles = productos.map(p => [
            id_venta,
            p.id_producto,
            p.cantidad,
            p.precioProducto || p.precioUnitario
        ]);

        db.query('INSERT INTO detalleventa (id_venta, id_producto, cantidad, precioUnitario) VALUES ?', [valoresDetalles], (err) => {
            if (err) return res.status(500).json({ error: "Error al guardar detalles", details: err.message });

            productos.forEach(p => {
                if (p.talla) {
                    db.query(
                        'UPDATE producto_tallas SET stock = stock - ? WHERE id_producto = ? AND talla = ?',
                        [p.cantidad, p.id_producto, p.talla],
                        (errStock) => {
                            if (errStock) console.error("Error actualizando stock:", errStock);
                        }
                    );
                }
            });

            res.json({ Status: "Exito", Message: "Compra realizada correctamente", id_venta });
        });
    });
};

// 7. PEDIDOS DE USUARIO
exports.getPedidosUsuario = (req, res) => {
    const { id_usuario } = req.params;

    const sql = `
        SELECT v.id_venta, v.total, v.fecha, dv.cantidad, dv.precioUnitario, 
               pr.nombreProducto, pr.imagen 
        FROM venta v
        JOIN detalleventa dv ON v.id_venta = dv.id_venta
        JOIN productos pr ON dv.id_producto = pr.id_producto
        WHERE v.id_usuario = ?
        ORDER BY v.fecha DESC`;

    db.query(sql, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 8. REPORTE DE VENTAS
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
            pr.nombreProducto,
            pr.imagen
        FROM venta v
        JOIN detalleventa dv ON v.id_venta = dv.id_venta
        JOIN productos pr ON dv.id_producto = pr.id_producto
        JOIN usuarios u ON v.id_usuario = u.id_usuario
        ORDER BY v.fecha DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 9. OBTENER CATEGORIAS
exports.getCategorias = (req, res) => {
    db.query('SELECT * FROM categorias', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};