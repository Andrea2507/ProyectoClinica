const { Router } = require("express");
const historialesController = require("../controllers/historiales.controller");

const router = Router();

router.get("/", historialesController.listarHistoriales);
router.post("/", historialesController.crearHistorial);
router.get("/:pacienteId", historialesController.obtenerHistorialPorPaciente);
router.patch("/:id", historialesController.actualizarHistorial);

module.exports = router;
