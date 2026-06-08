const { Router } = require('express');
const facturasController = require('../controllers/facturas.controller');

const router = Router();

router.get('/', facturasController.listarFacturas);
router.post('/', facturasController.generarFactura);

module.exports = router;
