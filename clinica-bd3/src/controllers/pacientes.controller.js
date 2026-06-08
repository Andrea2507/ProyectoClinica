const pool = require('../config/postgres');

async function obtenerPacientes(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT id, nombres, apellidos, fecha_nacimiento, telefono, email, direccion
      FROM pacientes
      ORDER BY id
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener pacientes',
      error: error.message
    });
  }
}

function mensajeErrorPaciente(error) {
  if (error.constraint === 'pacientes_email_key') {
    return 'Ya existe un paciente con ese email.';
  }

  if (error.constraint === 'pacientes_fecha_nacimiento_check') {
    return 'La fecha de nacimiento no puede ser futura.';
  }

  return error.message;
}

async function registrarPaciente(req, res) {
  const {
    nombres,
    apellidos,
    fecha_nacimiento,
    telefono,
    email,
    direccion
  } = req.body;

  if (!nombres || !apellidos || !fecha_nacimiento) {
    return res.status(400).json({
      mensaje: 'Error al registrar paciente',
      error: 'Nombres, apellidos y fecha de nacimiento son obligatorios.'
    });
  }

  try {
    const resultado = await pool.query(`
      INSERT INTO pacientes (
        nombres,
        apellidos,
        fecha_nacimiento,
        telefono,
        email,
        direccion
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombres, apellidos, fecha_nacimiento, telefono, email, direccion
    `, [
      nombres.trim(),
      apellidos.trim(),
      fecha_nacimiento,
      telefono || null,
      email || null,
      direccion || null
    ]);

    res.status(201).json({
      mensaje: 'Paciente registrado correctamente',
      paciente: resultado.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar paciente',
      error: mensajeErrorPaciente(error)
    });
  }
}

module.exports = {
  obtenerPacientes,
  registrarPaciente
};
