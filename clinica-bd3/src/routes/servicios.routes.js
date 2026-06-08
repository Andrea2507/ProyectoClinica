const express = require('express');
const { obtenerServicios } = require('../controllers/servicios.controller');

const router = express.Router();

router.get('/', obtenerServicios);

module.exports = router;
