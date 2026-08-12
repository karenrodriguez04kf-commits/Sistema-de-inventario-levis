const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const validarToken = require('../middlewares/authMiddleware');
const authAdmin = require('../middlewares/authAdmin'); // <--- 1. Importamos el filtro de admin

// Todas las operaciones de usuarios exigen ser administrador:
router.get('/', validarToken, authAdmin, usuariosController.getUsuarios);
router.post('/', validarToken, authAdmin, usuariosController.crearUsuario);
router.put('/:id', validarToken, authAdmin, usuariosController.actualizarUsuario);
router.delete('/:id', validarToken, authAdmin, usuariosController.eliminarUsuario);

module.exports = router;