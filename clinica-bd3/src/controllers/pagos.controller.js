const pool = require('../config/postgres');

function mensajeErrorPago(error) {
  if (error.constraint === 'pagos_metodo_pago_check') {
    return 'El metodo de pago debe ser efectivo, tarjeta, transferencia o cheque.';
  }

  if (error.constraint === 'pagos_monto_check') {
    return 'El monto del pago debe ser mayor que cero.';
  }

  if (error.constraint === 'pagos_factura_id_fkey') {
    return 'La factura indicada no existe.';
  }

  return error.message;
}

async function listarPagos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        p.id,
        p.factura_id,
        f.numero AS numero_factura,
        p.monto,
        p.metodo_pago,
        p.referencia,
        p.pagado_en,
        u.nombre AS registrado_por
      FROM pagos p
      JOIN facturas f ON f.id = p.factura_id
      LEFT JOIN usuarios_sistema u ON u.id = p.registrado_por
      ORDER BY p.pagado_en DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar pagos',
      error: error.message
    });
  }
}

async function registrarPago(req, res) {
  const {
    factura_id,
    monto,
    metodo_pago,
    referencia,
    usuario_id
  } = req.body;

  try {
    await pool.query(
      `CALL sp_registrar_pago($1, $2, $3, $4, $5)`,
      [factura_id, monto, metodo_pago, referencia, usuario_id]
    );

    res.status(201).json({
      mensaje: 'Pago registrado correctamente'
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar pago',
      error: mensajeErrorPago(error)
    });
  }
}

async function obtenerPago(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        p.id,
        p.factura_id,
        f.numero AS numero_factura,
        p.monto,
        p.metodo_pago,
        p.referencia,
        p.pagado_en,
        u.nombre AS registrado_por
      FROM pagos p
      JOIN facturas f ON f.id = p.factura_id
      LEFT JOIN usuarios_sistema u ON u.id = p.registrado_por
      WHERE p.id = $1
    `, [req.params.id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Pago no encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener pago',
      error: error.message
    });
  }
}

module.exports = {
  listarPagos,
  registrarPago,
  obtenerPago
};
