const pool = require('../config/postgres');

async function obtenerMedicos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT 
        m.id,
        m.nombres,
        m.apellidos,
        m.colegiado,
        m.telefono,
        m.email,
        e.nombre AS especialidad
      FROM medicos m
      INNER JOIN especialidades e ON e.id = m.especialidad_id
      ORDER BY m.id
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener médicos',
      error: error.message
    });
  }
}

async function obtenerEspecialidades(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, descripcion
      FROM especialidades
      WHERE activo = true
      ORDER BY nombre
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener especialidades',
      error: error.message
    });
  }
}

function mensajeErrorMedico(error) {
  if (error.constraint === 'medicos_colegiado_key') {
    return 'Ya existe un medico con ese numero de colegiado.';
  }

  if (error.constraint === 'medicos_email_key') {
    return 'Ya existe un medico con ese email.';
  }

  if (error.constraint === 'horarios_medicos_check') {
    return 'La hora de inicio del horario debe ser menor que la hora de fin.';
  }

  if (error.constraint === 'horarios_medicos_dia_semana_check') {
    return 'El dia de semana debe estar entre 1 y 7.';
  }

  return error.message;
}

function validarHorarios(horarios) {
  if (!Array.isArray(horarios) || horarios.length === 0) {
    throw new Error('Debes registrar al menos un horario semanal para el medico.');
  }

  for (const horario of horarios) {
    const dia = Number(horario.dia_semana);

    if (!Number.isInteger(dia) || dia < 1 || dia > 7) {
      throw new Error('Cada horario debe tener un dia de semana valido entre 1 y 7.');
    }

    if (!horario.hora_inicio || !horario.hora_fin) {
      throw new Error('Cada horario debe incluir hora de inicio y hora de fin.');
    }

    if (horario.hora_inicio >= horario.hora_fin) {
      throw new Error('La hora de inicio debe ser menor que la hora de fin.');
    }
  }
}

async function registrarMedico(req, res) {
  const {
    especialidad_id,
    nombres,
    apellidos,
    colegiado,
    telefono,
    email,
    horarios = []
  } = req.body;

  if (!especialidad_id || !nombres || !apellidos || !colegiado) {
    return res.status(400).json({
      mensaje: 'Error al registrar medico',
      error: 'Especialidad, nombres, apellidos y colegiado son obligatorios.'
    });
  }

  const client = await pool.connect();

  try {
    validarHorarios(horarios);
    await client.query('BEGIN');

    const especialidad = await client.query(
      'SELECT id FROM especialidades WHERE id = $1 AND activo = true',
      [especialidad_id]
    );

    if (especialidad.rows.length === 0) {
      throw new Error('La especialidad no existe o no esta activa.');
    }

    const medico = await client.query(`
      INSERT INTO medicos (
        especialidad_id,
        nombres,
        apellidos,
        colegiado,
        telefono,
        email
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, especialidad_id, nombres, apellidos, colegiado, telefono, email, activo
    `, [
      especialidad_id,
      nombres.trim(),
      apellidos.trim(),
      colegiado.trim(),
      telefono || null,
      email || null
    ]);

    for (const horario of horarios) {
      await client.query(`
        INSERT INTO horarios_medicos (
          medico_id,
          dia_semana,
          hora_inicio,
          hora_fin
        )
        VALUES ($1, $2, $3, $4)
      `, [
        medico.rows[0].id,
        Number(horario.dia_semana),
        horario.hora_inicio,
        horario.hora_fin
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Medico registrado correctamente',
      medico: medico.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({
      mensaje: 'Error al registrar medico',
      error: mensajeErrorMedico(error)
    });
  } finally {
    client.release();
  }
}

module.exports = {
  obtenerMedicos,
  obtenerEspecialidades,
  registrarMedico
};
