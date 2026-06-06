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

module.exports = {
  obtenerMedicos
};