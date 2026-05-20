const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validarToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración ultra-simple para evitar fallos de escritura
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    // Usamos el formato que tenías: fecha-nombre
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- RUTAS ---
router.get('/catalogo', productController.getCatalogo);
router.post('/finalizar-compra', productController.finalizarCompra);
router.get('/mis-pedidos/:id_usuario', productController.getPedidosUsuario);

router.get('/', validarToken, productController.getAllProducts);
// Asegúrate que en el frontend el campo se llame exactamente 'imagen'
router.post('/', validarToken, upload.single('imagen'), productController.createProduct);
router.put('/:id', validarToken, upload.single('imagen'), productController.updateProduct);
router.delete('/:id', validarToken, productController.deleteProduct);

module.exports = router;