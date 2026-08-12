const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const validarToken = require('../middlewares/authMiddleware');
const authAdmin = require('../middlewares/authAdmin'); // <--- 1. Importamos el filtro de admin

// Todas las rutas de proveedores exigen autenticación y rol de administrador:
router.get('/', validarToken, authAdmin, proveedorController.getProveedores);
router.post('/', validarToken, authAdmin, proveedorController.createProveedor);
router.put('/:id', validarToken, authAdmin, proveedorController.updateProveedor);
router.delete('/:id', validarToken, authAdmin, proveedorController.deleteProveedor);

module.exports = router;