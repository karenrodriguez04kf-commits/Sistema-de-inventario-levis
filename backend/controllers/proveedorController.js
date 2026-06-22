const db = require('../config/db');

exports.getProveedores = (req, res) => {
    db.query('SELECT * FROM proveedores', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createProveedor = (req, res) => {
    console.log("Body recibido:", req.body);
    const { nombre, rol_proveedor, correo } = req.body;
    const sql = 'INSERT INTO proveedores (nombre, rol_proveedor, correo) VALUES (?, ?, ?)';
    db.query(sql, [nombre, rol_proveedor, correo], (err) => {
        if (err) {
            console.log("Error SQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ Status: "Exito", Message: "Proveedor creado con éxito" });
    });
};

exports.updateProveedor = (req, res) => {
    const { id } = req.params;
    const { nombre, rol_proveedor, correo } = req.body; // ✅ correo en minúscula
    const sql = 'UPDATE proveedores SET nombre=?, rol_proveedor=?, correo=? WHERE id_proveedor=?';
    db.query(sql, [nombre, rol_proveedor, correo, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ Status: "Exito", Message: "Proveedor actualizado correctamente" });
    });
};

exports.deleteProveedor = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM proveedores WHERE id_proveedor = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ Status: "Exito", Message: "Proveedor eliminado correctamente" });
    });
};