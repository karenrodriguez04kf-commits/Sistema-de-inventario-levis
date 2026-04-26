const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validarToken = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/recuperar', authController.recuperar);
router.get('/perfil/:email', validarToken, authController.getPerfil);

module.exports = router;