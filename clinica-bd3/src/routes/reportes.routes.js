const { Router } = require('express');
const reportesController = require('../controllers/reportes.controller');

const router = Router();

router.get('/agenda-diaria', reportesController.agendaDiaria);
router.get('/facturas-pendientes', reportesController.facturasPendientes);
router.get('/facturacion-mensual', reportesController.facturacionMensual);
router.get('/ranking-medicos', reportesController.rankingMedicos);
router.get('/saldo-paciente/:pacienteId', reportesController.saldoPaciente);

module.exports = router;