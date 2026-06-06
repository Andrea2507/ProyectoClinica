CREATE OR REPLACE VIEW vw_agenda_diaria AS
SELECT
    c.id AS cita_id,
    c.fecha_inicio,
    c.fecha_fin,
    c.estado,
    c.motivo,
    p.id AS paciente_id,
    p.nombres || ' ' || p.apellidos AS paciente,
    m.id AS medico_id,
    m.nombres || ' ' || m.apellidos AS medico,
    e.nombre AS especialidad
FROM citas c
JOIN pacientes p ON c.paciente_id = p.id
JOIN medicos m ON c.medico_id = m.id
JOIN especialidades e ON m.especialidad_id = e.id;


CREATE OR REPLACE VIEW vw_facturas_pendientes AS
SELECT
    f.id AS factura_id,
    f.numero,
    f.fecha_emision,
    p.id AS paciente_id,
    p.nombres || ' ' || p.apellidos AS paciente,
    f.total,
    COALESCE(SUM(pa.monto), 0) AS total_pagado,
    f.total - COALESCE(SUM(pa.monto), 0) AS saldo_pendiente,
    f.estado
FROM facturas f
JOIN pacientes p ON f.paciente_id = p.id
LEFT JOIN pagos pa ON pa.factura_id = f.id
WHERE f.estado IN ('pendiente', 'pagada_parcial')
GROUP BY
    f.id,
    f.numero,
    f.fecha_emision,
    p.id,
    p.nombres,
    p.apellidos,
    f.total,
    f.estado;