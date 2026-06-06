const HistorialClinico = require('../models/historialClinico.model');
const procesarHistorialClinico = require('../utils/procesarHistorial');

async function crearHistorial(req, res) {
  try {
    const datosProcesados = procesarHistorialClinico(req.body);
    const historial = new HistorialClinico(datosProcesados);
    const historialGuardado = await historial.save();

    res.status(201).json({
      mensaje: 'Historial clínico registrado correctamente',
      historial: historialGuardado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar historial clínico',
      error: error.message
    });
  }
}

async function obtenerHistoriales(req, res) {
  try {
    const historiales = await HistorialClinico.find().sort({ fecha_registro: -1 });
    res.json(historiales);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener historiales clínicos',
      error: error.message
    });
  }
}

async function obtenerHistorialPorPaciente(req, res) {
  try {
    const pacienteId = Number(req.params.pacienteId);

    const historiales = await HistorialClinico.find({
      paciente_id: pacienteId
    }).sort({
      fecha_registro: -1
    });

    res.json(historiales);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener historial del paciente',
      error: error.message
    });
  }
}

module.exports = {
  crearHistorial,
  obtenerHistoriales,
  obtenerHistorialPorPaciente
};