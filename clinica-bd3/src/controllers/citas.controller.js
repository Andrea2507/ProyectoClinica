const pool = require('../config/postgres');

function mensajeErrorCita(error) {
  if (error.constraint === 'citas_medico_sin_solape') {
    return 'El medico ya tiene una cita programada, confirmada o atendida en ese horario.';
  }

  if (error.constraint === 'citas_check') {
    return 'La fecha de inicio debe ser menor que la fecha de fin.';
  }

  return error.message;
}

async function agendarCita(req, res) {
  const {
    paciente_id,
    medico_id,
    fecha_inicio,
    fecha_fin,
    motivo,
    usuario_id
  } = req.body;

  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return res.status(400).json({
      mensaje: 'Error al agendar cita',
      error: 'La fecha de inicio y la fecha de fin deben ser validas'
    });
  }

  if (inicio >= fin) {
    return res.status(400).json({
      mensaje: 'Error al agendar cita',
      error: 'La fecha de fin debe ser mayor que la fecha de inicio'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const medico = await client.query(
      'SELECT id FROM medicos WHERE id = $1 AND activo = true',
      [medico_id]
    );

    if (medico.rows.length === 0) {
      throw new Error('El medico no existe o no esta activo');
    }

    const paciente = await client.query(
      'SELECT id FROM pacientes WHERE id = $1',
      [paciente_id]
    );

    if (paciente.rows.length === 0) {
      throw new Error('El paciente no existe');
    }

    const horario = await client.query(`
      SELECT 1
      FROM horarios_medicos
      WHERE medico_id = $1
        AND activo = true
        AND dia_semana = EXTRACT(ISODOW FROM $2::timestamp)
        AND hora_inicio <= ($2::timestamp)::time
        AND hora_fin >= ($3::timestamp)::time
      LIMIT 1
    `, [medico_id, fecha_inicio, fecha_fin]);

    if (horario.rows.length === 0) {
      throw new Error('La cita esta fuera del horario de atencion del medico');
    }

    const citaActivaPaciente = await client.query(`
      SELECT 1
      FROM citas
      WHERE paciente_id = $1
        AND medico_id = $2
        AND fecha_inicio::date = $3::timestamp::date
        AND estado IN ('programada', 'confirmada', 'atendida')
      LIMIT 1
    `, [paciente_id, medico_id, fecha_inicio]);

    if (citaActivaPaciente.rows.length > 0) {
      throw new Error('El paciente ya tiene una cita activa con este medico en ese dia');
    }

    const nuevaCita = await client.query(`
      INSERT INTO citas (
        paciente_id,
        medico_id,
        fecha_inicio,
        fecha_fin,
        estado,
        motivo,
        creado_por
      )
      VALUES ($1, $2, $3, $4, 'programada', $5, $6)
      RETURNING *
    `, [paciente_id, medico_id, fecha_inicio, fecha_fin, motivo, usuario_id]);

    await client.query(`
      INSERT INTO auditoria (usuario_id, entidad, entidad_id, operacion, detalles)
      VALUES ($1, 'citas', $2, 'creacion_cita', jsonb_build_object(
        'paciente_id', $3::integer,
        'medico_id', $4::integer,
        'fecha_inicio', $5::timestamp,
        'fecha_fin', $6::timestamp
      ))
    `, [usuario_id, nuevaCita.rows[0].id, paciente_id, medico_id, fecha_inicio, fecha_fin]);

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Cita agendada correctamente',
      cita: nuevaCita.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({
      mensaje: 'Error al agendar cita',
      error: mensajeErrorCita(error)
    });
  } finally {
    client.release();
  }
}

async function obtenerCitas(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT 
        c.id,
        c.fecha_inicio,
        c.fecha_fin,
        c.estado,
        c.motivo,
        p.id AS paciente_id,
        p.nombres || ' ' || p.apellidos AS paciente,
        m.id AS medico_id,
        m.nombres || ' ' || m.apellidos AS medico
      FROM citas c
      INNER JOIN pacientes p ON p.id = c.paciente_id
      INNER JOIN medicos m ON m.id = c.medico_id
      ORDER BY c.fecha_inicio
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener citas',
      error: error.message
    });
  }
}


async function cancelarCita(req, res) {
  const { id } = req.params;
  const { motivo_cancelacion, usuario_id } = req.body;

  try {
    await pool.query(
      `CALL sp_cancelar_cita($1, $2, $3)`,
      [id, motivo_cancelacion, usuario_id]
    );

    res.json({
      mensaje: 'Cita cancelada correctamente'
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al cancelar cita',
      error: mensajeErrorCita(error)
    });
  }
}

async function cambiarEstadoCita(req, res) {
  const { id } = req.params;
  const { estado, usuario_id, motivo_cancelacion } = req.body;

  try {
    await pool.query(
      `CALL sp_cambiar_estado_cita($1, $2, $3, $4)`,
      [id, estado, usuario_id, motivo_cancelacion || null]
    );

    res.json({
      mensaje: 'Estado de cita actualizado correctamente'
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al cambiar estado de cita',
      error: mensajeErrorCita(error)
    });
  }
}

module.exports = {
  agendarCita,
  obtenerCitas,
  cancelarCita,
  cambiarEstadoCita
};
