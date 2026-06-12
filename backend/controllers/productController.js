const db = require('../config/db');

// 1. OBTENER CATÁLOGO (STOCK > 0)
exports.getCatalogo = (req, res) => {
  const sql = 'SELECT * FROM productos WHERE stockProducto > 0';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 2. OBTENER TODOS LOS PRODUCTOS (ADMIN)
exports.getAllProducts = (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 3. CREAR PRODUCTO
exports.createProduct = (req, res) => {
  const { nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero } = req.body;
  const imagen = req.file ? `/images/${req.file.filename}` : req.body.imagen;

  const sql = 'INSERT INTO productos (nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero, imagen], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ Status: "Exito", Message: "Producto guardado con éxito" });
  });
};

// 4. ACTUALIZAR PRODUCTO
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero } = req.body;
  
  let sql = 'UPDATE productos SET nombreProducto=?, descripcionProducto=?, precioProducto=?, stockProducto=?, categoria=?, talla=?, genero=?';
  let params = [nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero];

  if (req.file) {
    sql += ', imagen=?';
    params.push(`/images/${req.file.filename}`);
  }

  sql += ' WHERE id_producto=?';
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ Status: "Exito", Message: "Producto actualizado correctamente" });
  });
};

// 5. ELIMINAR PRODUCTO
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id_producto = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ Status: "Exito", Message: "Producto eliminado correctamente" });
  });
};

// 6. FINALIZAR COMPRA (CON ACTUALIZACIÓN DE STOCK)
exports.finalizarCompra = (req, res) => {
    const { id_usuario, total, productos } = req.body;

    if (!productos || productos.length === 0) {
        return res.status(400).json({ Message: "El carrito está vacío" });
    }

    // PASO 1: Crear el registro de Venta
    const sqlVenta = "INSERT INTO venta (id_usuario, total) VALUES (?, ?)";
    
    db.query(sqlVenta, [id_usuario, total], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al crear venta", details: err.message });

        const id_venta = result.insertId;

        // PASO 2: Insertar detalles de venta
        const valoresDetalles = productos.map(p => [
            id_venta, 
            p.id_producto, 
            p.cantidad, 
            p.precioProducto
        ]);

        const sqlDetalle = "INSERT INTO detalleventa (id_venta, id_producto, cantidad, precioUnitario) VALUES ?";
        
        db.query(sqlDetalle, [valoresDetalles], (err) => {
            if (err) return res.status(500).json({ error: "Error al guardar detalles", details: err.message });

            // PASO 3: Restar stock
            const sqlUpdateStock = "UPDATE productos SET stockProducto = stockProducto - ? WHERE id_producto = ?";
            
            productos.forEach(p => {
                db.query(sqlUpdateStock, [p.cantidad, p.id_producto], (errStock) => {
                    if (errStock) console.error("Error actualizando stock para producto " + p.id_producto, errStock);
                });
            });

            res.json({ Status: "Exito", Message: "Compra realizada correctamente", id_venta });
        });
    });
    };

// 7. OBTENER PEDIDOS POR USUARIO
exports.getPedidosUsuario = (req, res) => {
    const { id_usuario } = req.params;
    
    const sql = `
        SELECT v.id_venta, v.total, v.fecha, dv.cantidad, dv.precioUnitario, pr.nombreProducto, pr.imagen 
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