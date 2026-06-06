const express = require('express');
const { obtenerMedicos } = require('../controllers/medicos.controller');

const router = express.Router();

router.get('/', obtenerMedicos);

module.exports = router;