const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const usuariosController = require('../controllers/usuariosController');
const validarToken = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/recuperar', usuariosController.recuperar);
router.post('/cambiar-password', usuariosController.cambiarContrasena);
// ✅ Ruta específica PRIMERO
router.put('/perfil/actualizar', validarToken, authController.actualizarPerfil);

// ✅ Ruta con parámetro DESPUÉS
router.get('/perfil/:email', validarToken, authController.getPerfil);
router.get('/bandeja/:email', usuariosController.verBandejaInterna);
module.exports = router;