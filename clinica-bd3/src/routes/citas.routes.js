const express = require('express');
const {
  obtenerCitas,
  cancelarCita
} = require('../controllers/citas.controller');

const router = express.Router();

router.get('/', obtenerCitas);
router.post('/:id/cancelar', cancelarCita);

module.exports = router;