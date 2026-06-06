const pool = require('../config/postgres');

async function agendaDiaria(req, res) {
  const { fecha } = req.query;

  try {
    const resultado = await pool.query(`
      SELECT *
      FROM vw_agenda_diaria
      WHERE fecha_inicio::date = $1::date
      ORDER BY fecha_inicio
    `, [fecha]);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener agenda diaria',
      error: error.message
    });
  }
}

async function facturasPendientes(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT *
      FROM vw_facturas_pendientes
      ORDER BY fecha_emision ASC
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener facturas pendientes',
      error: error.message
    });
  }
}

async function facturacionMensual(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT *
      FROM mv_facturacion_mensual
      ORDER BY mes DESC, especialidad
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener facturación mensual',
      error: error.message
    });
  }
}

async function rankingMedicos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT *
      FROM mv_ranking_medicos_trimestral
      ORDER BY citas_atendidas DESC, monto_facturado DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener ranking de médicos',
      error: error.message
    });
  }
}

async function saldoPaciente(req, res) {
  const { pacienteId } = req.params;

  try {
    const resultado = await pool.query(`
      SELECT
        p.id AS paciente_id,
        p.nombres || ' ' || p.apellidos AS paciente,
        COALESCE(SUM(f.total), 0) AS total_facturado,
        COALESCE(SUM(pg.total_pagado), 0) AS total_pagado,
        COALESCE(SUM(f.total), 0) - COALESCE(SUM(pg.total_pagado), 0) AS saldo_pendiente
      FROM pacientes p
      LEFT JOIN facturas f 
        ON f.paciente_id = p.id
        AND f.estado <> 'anulada'
      LEFT JOIN (
        SELECT
          factura_id,
          SUM(monto) AS total_pagado
        FROM pagos
        GROUP BY factura_id
      ) pg ON pg.factura_id = f.id
      WHERE p.id = $1
      GROUP BY p.id, p.nombres, p.apellidos
    `, [pacienteId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Paciente no encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener saldo del paciente',
      error: error.message
    });
  }
}

module.exports = {
  agendaDiaria,
  facturasPendientes,
  facturacionMensual,
  rankingMedicos,
  saldoPaciente
};