const { Router } = require("express");
const pagosController = require("../controllers/pagos.controller");

const router = Router();

router.get("/", pagosController.listarPagos);
router.post("/", pagosController.registrarPago);
router.get("/:id", pagosController.obtenerPago);

module.exports = router;
