const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validarToken = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/recuperar', authController.recuperar);

// ✅ Ruta específica PRIMERO
router.put('/perfil/actualizar', validarToken, authController.actualizarPerfil);

// ✅ Ruta con parámetro DESPUÉS
router.get('/perfil/:email', validarToken, authController.getPerfil);

module.exports = router;