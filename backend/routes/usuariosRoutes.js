const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const validarToken = require('../middlewares/authMiddleware');

router.get('/', validarToken, usuariosController.getUsuarios);
router.post('/', validarToken, usuariosController.crearUsuario);
router.put('/:id', validarToken, usuariosController.actualizarUsuario);
router.delete('/:id', validarToken, usuariosController.eliminarUsuario);

module.exports = router;