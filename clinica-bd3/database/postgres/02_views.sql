CREATE OR REPLACE VIEW vw_citas_detalle AS
SELECT
  c.id,
  c.fecha_hora,
  c.estado,
  c.motivo,
  p.nombres || ' ' || p.apellidos AS paciente,
  m.nombres || ' ' || m.apellidos AS medico,
  m.especialidad
FROM citas c
JOIN pacientes p ON p.id = c.paciente_id
JOIN medicos m ON m.id = c.medico_id;
