const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validarToken = require('../middlewares/authMiddleware');

router.get('/', validarToken, clientController.getAllClients);
router.post('/', validarToken, clientController.createClient);
router.put('/:id', validarToken, clientController.updateClient);
router.delete('/:id', validarToken, clientController.deleteClient);

module.exports = router;