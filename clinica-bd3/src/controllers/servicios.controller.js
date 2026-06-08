const pool = require('../config/postgres');

async function obtenerServicios(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, tipo, precio, activo
      FROM servicios
      WHERE activo = true
      ORDER BY tipo, nombre
    `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener servicios',
      error: error.message
    });
  }
}

module.exports = {
  obtenerServicios
};
