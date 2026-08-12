const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validarToken = require('../middlewares/authMiddleware');
const authAdmin = require('../middlewares/authAdmin'); // <--- 1. Importamos el filtro de admin

// Si ver la lista completa de clientes es exclusivo de administración:
router.get('/', validarToken, authAdmin, clientController.getAllClients);

// Las acciones de crear, actualizar y eliminar SÍ o SÍ exigen ser administrador:
router.post('/', validarToken, authAdmin, clientController.createClient);
router.put('/:id', validarToken, authAdmin, clientController.updateClient);
router.delete('/:id', validarToken, authAdmin, clientController.deleteClient);

module.exports = router;