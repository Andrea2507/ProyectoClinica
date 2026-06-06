const express = require('express');
const { obtenerPacientes } = require('../controllers/pacientes.controller');

const router = express.Router();

router.get('/', obtenerPacientes);

module.exports = router;