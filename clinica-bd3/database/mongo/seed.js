db.historialesclinicos.insertMany([
  {
    pacienteId: "1",
    alergias: ["Penicilina"],
    antecedentes: ["Asma"],
    diagnosticos: [
      {
        descripcion: "Control general sin hallazgos graves",
        medicoId: "1",
        fecha: new Date(),
      },
    ],
    tratamientos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
