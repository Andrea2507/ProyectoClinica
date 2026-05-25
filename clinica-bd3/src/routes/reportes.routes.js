const { Router } = require("express");
const reportesController = require("../controllers/reportes.controller");

const router = Router();

router.get("/citas", reportesController.reporteCitas);
router.get("/pagos", reportesController.reportePagos);
router.get("/pacientes", reportesController.reportePacientes);

module.exports = router;
