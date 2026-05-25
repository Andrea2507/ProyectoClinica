async function listarPagos(req, res) {
  res.json({ message: "Listado de pagos pendiente de implementar" });
}

async function registrarPago(req, res) {
  res.status(201).json({ message: "Registro de pago pendiente de implementar" });
}

async function obtenerPago(req, res) {
  res.json({ message: "Detalle de pago pendiente de implementar", id: req.params.id });
}

module.exports = {
  listarPagos,
  registrarPago,
  obtenerPago,
};
