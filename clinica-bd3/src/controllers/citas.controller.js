const pool = require('../config/postgres');

async function obtenerCitas(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT 
        c.id,
        c.fecha_inicio,
        c.fecha_fin,
        c.estado,
        c.motivo,
        p.nombres || ' ' || p.apellidos AS paciente,
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
      error: error.message
    });
  }
}
module.exports = {
  obtenerCitas,
  cancelarCita
};