const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validarToken = require('../middlewares/authMiddleware');
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


// --- RUTAS ESPECÍFICAS PRIMERO ---
router.get('/catalogo', productController.getCatalogo);
router.get('/ReporteVentas', validarToken, productController.getReporteVentas);
router.get('/categorias', productController.getCategorias);
router.post('/finalizarCompra', validarToken, productController.finalizarCompra);
router.post('/finalizar-compra', validarToken, productController.finalizarCompra);
router.get('/mis-pedidos/:id_usuario', validarToken, productController.getPedidosUsuario);

// --- RUTAS GENERALES ---
router.get('/', validarToken, productController.getAllProducts);
router.post('/', validarToken, upload.single('imagen'), productController.createProduct);
router.put('/:id', validarToken, upload.single('imagen'), productController.updateProduct);
router.delete('/:id', validarToken, productController.deleteProduct);

module.exports = router;
//fin