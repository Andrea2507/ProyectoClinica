async function listarCitas(req, res) {
  res.json({ message: "Listado de citas pendiente de implementar" });
}

async function crearCita(req, res) {
  res.status(201).json({ message: "Creacion de cita pendiente de implementar" });
}

async function obtenerCita(req, res) {
  res.json({ message: "Detalle de cita pendiente de implementar", id: req.params.id });
}

async function actualizarCita(req, res) {
  res.json({ message: "Actualizacion de cita pendiente de implementar", id: req.params.id });
}

async function eliminarCita(req, res) {
  res.json({ message: "Eliminacion de cita pendiente de implementar", id: req.params.id });
}

module.exports = {
  listarCitas,
  crearCita,
  obtenerCita,
  actualizarCita,
  eliminarCita,
};
