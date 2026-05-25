const HistorialClinico = require("../models/historialClinico.model");

async function listarHistoriales(req, res) {
  const historiales = await HistorialClinico.find().limit(50);
  res.json(historiales);
}

async function crearHistorial(req, res) {
  const historial = await HistorialClinico.create(req.body);
  res.status(201).json(historial);
}

async function obtenerHistorialPorPaciente(req, res) {
  const historial = await HistorialClinico.findOne({
    pacienteId: req.params.pacienteId,
  });

  if (!historial) {
    return res.status(404).json({ message: "Historial no encontrado" });
  }

  return res.json(historial);
}

async function actualizarHistorial(req, res) {
  const historial = await HistorialClinico.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!historial) {
    return res.status(404).json({ message: "Historial no encontrado" });
  }

  return res.json(historial);
}

module.exports = {
  listarHistoriales,
  crearHistorial,
  obtenerHistorialPorPaciente,
  actualizarHistorial,
};
