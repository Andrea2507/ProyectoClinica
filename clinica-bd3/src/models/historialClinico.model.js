const mongoose = require("mongoose");

const historialClinicoSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: String,
      required: true,
      index: true,
    },
    alergias: [
      {
        type: String,
        trim: true,
      },
    ],
    antecedentes: [
      {
        type: String,
        trim: true,
      },
    ],
    diagnosticos: [
      {
        descripcion: {
          type: String,
          required: true,
        },
        medicoId: String,
        fecha: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tratamientos: [
      {
        descripcion: {
          type: String,
          required: true,
        },
        fechaInicio: Date,
        fechaFin: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HistorialClinico", historialClinicoSchema);
