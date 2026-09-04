const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validarToken = require('../middlewares/authMiddleware');
const authAdmin = require('../middlewares/authAdmin');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// --- RUTAS PÚBLICAS ---
router.get('/catalogo', productController.getCatalogo);
router.get('/categorias', productController.getCategorias);

// --- RUTAS PARA CLIENTES LOGUEADOS ---
router.post('/finalizarCompra', validarToken, productController.finalizarCompra);
router.post('/finalizar-compra', validarToken, productController.finalizarCompra);
router.get('/mis-pedidos-simple/:id_usuario', validarToken, productController.getPedidosUsuario);
router.get('/mis-pedidos/:id_usuario', validarToken, productController.getMisPedidos);

// --- RUTAS EXCLUSIVAS DE ADMINISTRADORES ---
router.get('/ReporteVentas', validarToken, authAdmin, productController.getReporteVentas);
router.get('/reporte-ventas', validarToken, authAdmin, productController.getReporteVentas);
router.get('/', validarToken, authAdmin, productController.getAllProducts);
router.post('/', validarToken, authAdmin, upload.single('imagen'), productController.createProduct);
router.put('/:id', validarToken, authAdmin, upload.single('imagen'), productController.updateProduct);

// Rutas configuradas para alternar el estado (Activar / Inactivar) en lugar de borrar físicamente
router.delete('/:id', validarToken, authAdmin, productController.toggleProductStatus);
router.put('/:id/estado', validarToken, authAdmin, productController.toggleProductStatus);

module.exports = router;