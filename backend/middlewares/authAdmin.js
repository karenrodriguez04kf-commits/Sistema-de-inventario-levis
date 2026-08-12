const verificarAdmin = (req, res, next) => {
    // Verificamos si existe el usuario en la petición (que debió pasar primero por el authMiddleware)
    const usuario = req.usuario || req.user;

    if (!usuario) {
        return res.status(401).json({ mensaje: "No autorizado. Token requerido." });
    }

    // Comparamos si el rol en la base de datos es 'admin'
    if (usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: "Acceso denegado. Se requiere rol de administrador." });
    }

    next(); // Si es admin, lo dejamos pasar
};

module.exports = verificarAdmin;