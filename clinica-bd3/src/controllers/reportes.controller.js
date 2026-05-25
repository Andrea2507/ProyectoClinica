async function reporteCitas(req, res) {
  res.json({ message: "Reporte de citas pendiente de implementar" });
}

async function reportePagos(req, res) {
  res.json({ message: "Reporte de pagos pendiente de implementar" });
}

async function reportePacientes(req, res) {
  res.json({ message: "Reporte de pacientes pendiente de implementar" });
}

module.exports = {
  reporteCitas,
  reportePagos,
  reportePacientes,
};
