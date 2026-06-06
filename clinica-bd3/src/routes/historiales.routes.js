const express = require('express');
const {
  crearHistorial,
  obtenerHistoriales,
  obtenerHistorialPorPaciente
} = require('../controllers/historiales.controller');

const router = express.Router();

router.post('/', crearHistorial);
router.get('/', obtenerHistoriales);
router.get('/paciente/:pacienteId', obtenerHistorialPorPaciente);

module.exports = router;