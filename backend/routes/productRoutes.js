const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validarToken = require('../middlewares/authMiddleware');
const authAdmin = require('../middlewares/authAdmin'); // <--- 1. Importamos el filtro de admin
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
  limits: { fileSize: 5 * 1024 * 1024 } // Límite máximo de 5MB por archivo
});


// --- RUTAS PÚBLICAS (Cualquiera las puede ver) ---
router.get('/catalogo', productController.getCatalogo);
router.get('/categorias', productController.getCategorias);

// --- RUTAS PARA CLIENTES LOGUEADOS (Cualquier usuario registrado) ---
router.post('/finalizarCompra', validarToken, productController.finalizarCompra);
router.post('/finalizar-compra', validarToken, productController.finalizarCompra);
router.get('/mis-pedidos/:id_usuario', validarToken, productController.getPedidosUsuario);

// --- RUTAS EXCLUSIVAS DE ADMINISTRADORES (Blindadas con authAdmin) ---
router.get('/ReporteVentas', validarToken, authAdmin, productController.getReporteVentas);
router.get('/', validarToken, authAdmin, productController.getAllProducts);
router.post('/', validarToken, authAdmin, upload.single('imagen'), productController.createProduct);
router.put('/:id', validarToken, authAdmin, upload.single('imagen'), productController.updateProduct);
router.delete('/:id', validarToken, authAdmin, productController.deleteProduct);

module.exports = router;
//fin