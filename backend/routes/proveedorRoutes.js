const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const validarToken = require('../middlewares/authMiddleware');

router.get('/', validarToken, proveedorController.getProveedores);
router.post('/', validarToken, proveedorController.createProveedor);
router.put('/:id', validarToken, proveedorController.updateProveedor);
router.delete('/:id', validarToken, proveedorController.deleteProveedor);

module.exports = router;