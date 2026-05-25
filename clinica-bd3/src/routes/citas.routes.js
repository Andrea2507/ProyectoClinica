const { Router } = require("express");
const citasController = require("../controllers/citas.controller");

const router = Router();

router.get("/", citasController.listarCitas);
router.post("/", citasController.crearCita);
router.get("/:id", citasController.obtenerCita);
router.put("/:id", citasController.actualizarCita);
router.delete("/:id", citasController.eliminarCita);

module.exports = router;
