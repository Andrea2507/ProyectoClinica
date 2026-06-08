const express = require('express');
const {
  obtenerMedicos,
  obtenerEspecialidades,
  registrarMedico
} = require('../controllers/medicos.controller');

const router = express.Router();

router.get('/', obtenerMedicos);
router.post('/', registrarMedico);
router.get('/especialidades', obtenerEspecialidades);

module.exports = router;
