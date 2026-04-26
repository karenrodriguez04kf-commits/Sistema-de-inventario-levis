const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "mi_clave_secreta_super_segura";
const saltRounds = 10;

// 1. REGISTRO
exports.register = (req, res) => {
  const { nombre, email, password, telefono, direccion } = req.body;
  const rol = req.body.rol || 'cliente';

  if (!nombre || !email || !password) {
    return res.status(400).json({ Message: "Faltan campos obligatorios" });
  }

  bcrypt.hash(password.toString(), saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ Message: "Error al procesar contraseña" });

    const sql = "INSERT INTO usuarios (nombre, email, password, rol, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nombre, email, hash, rol, telefono, direccion], (err, result) => {
      if (err) return res.status(500).json({ Message: "Error en la base de datos", Detail: err.sqlMessage });
      return res.status(200).json({ Status: "Exito" });
    });
  });
};

// 2. LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM usuarios WHERE email = ?";
  
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ Message: "Error en el servidor" });
    
    if (result.length > 0) {
      const user = result[0]; 
      bcrypt.compare(password.toString(), user.password, (err, coinciden) => {
        if (coinciden) {
          const token = jwt.sign({ 
            id: user.id_usuario,
            email: user.email, 
            rol: user.rol, 
            nombre: user.nombre 
          }, SECRET_KEY, { expiresIn: '1h' });

          return res.status(200).json({ 
            Status: "Exito", 
            Token: token, 
            Rol: user.rol, 
            id_usuario: user.id_usuario 
          });
        } else {
          return res.status(401).json({ Message: "Contraseña incorrecta" });
        }
      });
    } else {
      return res.status(401).json({ Message: "Usuario no encontrado" });
    }
  });
};

// 3. OBTENER PERFIL (getPerfil)
exports.getPerfil = (req, res) => {
  const sql = "SELECT nombre, email, rol, telefono, direccion FROM usuarios WHERE email = ?";
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ Message: "No existe" });
    return res.status(200).json(result[0]);
  });
};

// 4. RECUPERAR CONTRASEÑA 
exports.recuperar = (req, res) => {
  const { nombre, email, newPassword } = req.body;
  
  bcrypt.hash(newPassword.toString(), saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ Message: "Error al procesar clave" });
    
    const sql = "UPDATE usuarios SET password = ? WHERE email = ? AND nombre = ?";
    db.query(sql, [hash, email, nombre], (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ Message: "Datos no coinciden" });
      return res.status(200).json({ Status: "Exito" });
    });
  });
};