const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController'); // singular
const validarToken = require('../middlewares/authMiddleware');
const authAdmin = require('../middlewares/authAdmin');

router.use((req, res, next) => {
    console.log("👉 Alguien tocó las rutas de venta:", req.method, req.url);
    next();
});

// Rutas limpias
router.get('/ReporteVentas', validarToken, authAdmin, ventaController.getReporteVentas);
router.get('/categorias', validarToken, ventaController.getCategorias);

// CORRECCIÓN AQUÍ: Cambiar 'ventasController' por 'ventaController'
router.post('/finalizar-compra', ventaController.finalizarCompra);

module.exports = router;