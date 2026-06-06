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

module.exports = {
  obtenerPacientes
};