const db = require('../config/db');

// 1. Obtener SOLO los que son clientes
exports.getAllClients = (req, res) => {
  // Filtramos por rol para que no aparezcan admins en la lista de gestión de clientes
  db.query("SELECT id_usuario, nombre, email, rol, telefono, direccion FROM usuarios WHERE rol = 'cliente'", (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};

// 2. Crear usuario (Forzando rol cliente si no viene uno)
exports.createClient = (req, res) => {
  const { nombre, email, telefono, direccion, rol, password } = req.body;
  // Nota: Deberías encriptar la password aquí si los creas manualmente
  const sql = 'INSERT INTO usuarios (nombre, email, telefono, direccion, rol, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombre, email, telefono || 'N/A', direccion || 'N/A', rol || 'cliente', password || '123456'], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ Status: "Exito", id: result.insertId });
  });
};

// 3. Eliminar (Igual, pero enviando Status: "Exito" para que tu front lo entienda)
exports.deleteClient = (req, res) => {
  db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ Status: "Exito", Message: "Eliminado" });
  });
};

// 4. Actualizar 
exports.updateClient = (req, res) => {
  const { nombre, email, telefono, direccion, rol } = req.body;
  const sql = 'UPDATE usuarios SET nombre=?, email=?, telefono=?, direccion=?, rol=? WHERE id_usuario=?';
  db.query(sql, [nombre, email, telefono, direccion, rol, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ Status: "Exito" });
  });
};