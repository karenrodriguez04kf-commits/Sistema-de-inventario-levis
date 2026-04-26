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

// 3. CREAR PRODUCTO (MODIFICADO PARA IMÁGENES)
exports.createProduct = (req, res) => {
  const { nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero } = req.body;
  
  // Si Multer procesó una imagen, el nombre del archivo está en req.file
  const imagen = req.file ? `/images/${req.file.filename}` : req.body.imagen;

  const sql = 'INSERT INTO productos (nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero, imagen], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ Status: "Exito", Message: "Producto guardado con éxito" });
  });
};

// 4. ACTUALIZAR PRODUCTO (ESTO ES LO QUE TE FALTABA PARA EVITAR EL 404)
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { nombreProducto, descripcionProducto, precioProducto, stockProducto, categoria, talla, genero } = req.body;
  
  // Lógica para la imagen: si hay una nueva foto, se actualiza; si no, se mantiene la anterior
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

exports.deleteProduct = (req, res) => {
  const { id } = req.params; // Este 'id' viene de la URL /api/productos/1
  
  const sql = 'DELETE FROM productos WHERE id_producto = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ Status: "Exito", Message: "Producto eliminado correctamente" });
  });
};