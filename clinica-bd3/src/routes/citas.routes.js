const express = require('express');
const {
  agendarCita,
  obtenerCitas,
  cancelarCita,
  cambiarEstadoCita
} = require('../controllers/citas.controller');

const router = express.Router();

router.get('/', obtenerCitas);
router.post('/', agendarCita);
router.patch('/:id/estado', cambiarEstadoCita);
router.post('/:id/cancelar', cancelarCita);

module.exports = router;
