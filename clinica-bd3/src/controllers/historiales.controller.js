const HistorialClinico = require('../models/historialClinico.model');
const procesarHistorialClinico = require('../utils/procesarHistorial');
const pool = require('../config/postgres');

function mensajeErrorHistorial(error) {
  if (error.code === 11000) {
    return 'Ya existe un historial clinico registrado para esa cita.';
  }

  if (error.name === 'ValidationError') {
    return 'Faltan campos obligatorios del historial clinico o algun dato tiene formato invalido.';
  }

  return error.message;
}

async function crearHistorial(req, res) {
  try {
    const cita = await pool.query(
      'SELECT id, estado FROM citas WHERE id = $1',
      [req.body.cita_id]
    );

    if (cita.rows.length === 0) {
      return res.status(400).json({
        mensaje: 'Error al registrar historial clinico',
        error: 'La cita no existe'
      });
    }

    if (cita.rows[0].estado !== 'atendida') {
      return res.status(400).json({
        mensaje: 'Error al registrar historial clinico',
        error: 'El historial clinico solo puede registrarse para citas atendidas'
      });
    }

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
      error: mensajeErrorHistorial(error)
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
      fecha_registro: 1
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
