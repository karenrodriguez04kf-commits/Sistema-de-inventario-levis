const jwt = require('jsonwebtoken');
const SECRET_KEY = "mi_clave_secreta_super_segura";

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ mensaje: "Acceso denegado. No hay token." });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ mensaje: "Token expirado o inválido" });
    req.user = user;
    next();
  });
};