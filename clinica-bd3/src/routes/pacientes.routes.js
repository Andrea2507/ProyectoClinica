const express = require('express');
const {
  obtenerPacientes,
  registrarPaciente
} = require('../controllers/pacientes.controller');

const router = express.Router();

router.get('/', obtenerPacientes);
router.post('/', registrarPaciente);

module.exports = router;
