const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validarToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- Configuración de Multer para guardar las fotos ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Asegúrate de crear esta carpeta en tu backend
  },
  filename: (req, file, cb) => {
    // Le pone un nombre único: fecha-nombreoriginal
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- RUTAS ---

// Listar catálogo (Público)
router.get('/catalogo', productController.getCatalogo);

// Obtener todos (Privado)
router.get('/', validarToken, productController.getAllProducts);

// CREAR PRODUCTO + IMAGEN (Añadimos upload.single('imagen'))
router.post('/', validarToken, upload.single('imagen'), productController.createProduct);

// ACTUALIZAR PRODUCTO (Esta es la que te faltaba y daba error 404)
router.put('/:id', validarToken, upload.single('imagen'), productController.updateProduct);

// ELIMINAR PRODUCTO
router.delete('/:id', validarToken, productController.deleteProduct);

module.exports = router;