const historialesPorPaciente = [
  {
    $match: {
      pacienteId: "1",
    },
  },
  {
    $project: {
      pacienteId: 1,
      totalDiagnosticos: { $size: "$diagnosticos" },
      totalTratamientos: { $size: "$tratamientos" },
      updatedAt: 1,
    },
  },
];

module.exports = {
  historialesPorPaciente,
};
