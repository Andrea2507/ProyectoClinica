const mongoose = require('mongoose');

const historialClinicoSchema = new mongoose.Schema({
  cita_id: {
    type: Number,
    required: true,
    unique: true
  },
  paciente_id: {
    type: Number,
    required: true
  },
  medico_id: {
    type: Number,
    required: true
  },
  especialidad: {
    type: String,
    required: true,
    trim: true
  },
  motivo_consulta: {
    type: String,
    required: true,
    trim: true
  },
  signos_vitales: {
    presion_arterial: String,
    frecuencia_cardiaca: Number,
    temperatura: Number,
    peso: Number,
    altura: Number,
    saturacion_oxigeno: Number
  },
  diagnosticos: [
    {
      codigo: String,
      descripcion: {
        type: String,
        required: true
      },
      tipo: {
        type: String,
        enum: ['principal', 'secundario'],
        default: 'principal'
      }
    }
  ],
  medicamentos: [
    {
      nombre: {
        type: String,
        required: true
      },
      dosis: String,
      frecuencia: String,
      duracion: String,
      indicaciones: String
    }
  ],
  examenes_solicitados: [
    {
      nombre: String,
      descripcion: String,
      prioridad: {
        type: String,
        enum: ['normal', 'urgente'],
        default: 'normal'
      }
    }
  ],
  notas_adicionales: String,
  datos_especialidad: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  registrado_por: {
    type: Number,
    required: true
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'historiales_clinicos',
  versionKey: false
});

module.exports = mongoose.model('HistorialClinico', historialClinicoSchema);