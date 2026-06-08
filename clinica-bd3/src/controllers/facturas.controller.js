const pool = require('../config/postgres');

function mensajeErrorFactura(error) {
  if (error.constraint === 'facturas_numero_key') {
    return 'Ya existe una factura con ese numero. Ingresa un numero de factura diferente.';
  }

  if (error.constraint === 'facturas_cita_id_key') {
    return 'La cita seleccionada ya tiene una factura asociada.';
  }

  if (error.constraint === 'facturas_check') {
    return 'El descuento no puede ser mayor que el subtotal de la factura.';
  }

  return error.message;
}

async function generarFactura(req, res) {
  const {
    paciente_id,
    cita_id,
    numero,
    descuento = 0,
    servicios = [],
    usuario_id
  } = req.body;

  if (!Array.isArray(servicios) || servicios.length === 0) {
    return res.status(400).json({
      mensaje: 'Debe incluir al menos un servicio en la factura'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const paciente = await client.query(
      'SELECT id FROM pacientes WHERE id = $1',
      [paciente_id]
    );

    if (paciente.rows.length === 0) {
      throw new Error('El paciente no existe');
    }

    if (cita_id) {
      const cita = await client.query(
        'SELECT id FROM citas WHERE id = $1 AND paciente_id = $2',
        [cita_id, paciente_id]
      );

      if (cita.rows.length === 0) {
        throw new Error('La cita no existe o no pertenece al paciente');
      }
    }

    let subtotal = 0;
    const detalles = [];

    for (const item of servicios) {
      const cantidad = Number(item.cantidad || 1);
      const servicio = await client.query(
        'SELECT id, precio FROM servicios WHERE id = $1 AND activo = true',
        [item.servicio_id]
      );

      if (servicio.rows.length === 0) {
        throw new Error(`El servicio ${item.servicio_id} no existe o no esta activo`);
      }

      if (cantidad <= 0) {
        throw new Error('La cantidad de cada servicio debe ser mayor a cero');
      }

      const precio = Number(servicio.rows[0].precio);
      subtotal += precio * cantidad;
      detalles.push({
        servicio_id: servicio.rows[0].id,
        cantidad,
        precio_unitario: precio
      });
    }

    const descuentoNumerico = Number(descuento || 0);

    if (descuentoNumerico < 0 || descuentoNumerico > subtotal) {
      throw new Error('El descuento no puede ser negativo ni mayor al subtotal');
    }

    const total = subtotal - descuentoNumerico;

    const factura = await client.query(`
      INSERT INTO facturas (
        paciente_id,
        cita_id,
        numero,
        subtotal,
        descuento,
        total,
        estado,
        creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7)
      RETURNING *
    `, [paciente_id, cita_id || null, numero, subtotal, descuentoNumerico, total, usuario_id]);

    for (const detalle of detalles) {
      await client.query(`
        INSERT INTO factura_detalles (
          factura_id,
          servicio_id,
          cantidad,
          precio_unitario
        )
        VALUES ($1, $2, $3, $4)
      `, [factura.rows[0].id, detalle.servicio_id, detalle.cantidad, detalle.precio_unitario]);
    }

    await client.query(`
      INSERT INTO auditoria (usuario_id, entidad, entidad_id, operacion, detalles)
      VALUES ($1, 'facturas', $2, 'generacion_factura', jsonb_build_object(
        'paciente_id', $3::integer,
        'cita_id', $4::integer,
        'subtotal', $5::numeric,
        'descuento', $6::numeric,
        'total', $7::numeric
      ))
    `, [usuario_id, factura.rows[0].id, paciente_id, cita_id || null, subtotal, descuentoNumerico, total]);

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Factura generada correctamente',
      factura: factura.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({
      mensaje: 'Error al generar factura',
      error: mensajeErrorFactura(error)
    });
  } finally {
    client.release();
  }
}

async function listarFacturas(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        f.id,
        f.numero,
        f.fecha_emision,
        f.paciente_id,
        p.nombres || ' ' || p.apellidos AS paciente,
        f.cita_id,
        f.subtotal,
        f.descuento,
        f.total,
        COALESCE(SUM(pa.monto), 0) AS total_pagado,
        f.total - COALESCE(SUM(pa.monto), 0) AS saldo_pendiente,
        f.estado
      FROM facturas f
      JOIN pacientes p ON p.id = f.paciente_id
      LEFT JOIN pagos pa ON pa.factura_id = f.id
      GROUP BY
        f.id,
        f.numero,
        f.fecha_emision,
        f.paciente_id,
        p.nombres,
        p.apellidos,
        f.cita_id,
        f.subtotal,
        f.descuento,
        f.total,
        f.estado
      ORDER BY f.fecha_emision DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al listar facturas',
      error: error.message
    });
  }
}

module.exports = {
  generarFactura,
  listarFacturas
};
