const express = require('express');
const reportesMongoController = require('../controllers/reportesMongo.controller');

const router = express.Router();

router.get('/top-diagnosticos', reportesMongoController.topDiagnosticos);
router.get('/medicamentos-especialidad', reportesMongoController.medicamentosPorEspecialidad);
router.get('/signos-vitales', reportesMongoController.signosVitalesPorGrupo);
router.get('/resumen-clinico', reportesMongoController.resumenClinico);

module.exports = router;