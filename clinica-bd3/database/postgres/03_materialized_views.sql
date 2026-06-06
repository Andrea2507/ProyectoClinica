DROP MATERIALIZED VIEW IF EXISTS mv_facturacion_mensual;
DROP MATERIALIZED VIEW IF EXISTS mv_ranking_medicos_trimestral;

DROP MATERIALIZED VIEW IF EXISTS mv_facturacion_mensual;

CREATE MATERIALIZED VIEW mv_facturacion_mensual AS
SELECT
    DATE_TRUNC('month', f.fecha_emision)::date AS mes,
    e.nombre AS especialidad,
    SUM(f.total) AS total_facturado,
    COALESCE(SUM(pg.total_pagado), 0) AS total_cobrado,
    SUM(f.total) - COALESCE(SUM(pg.total_pagado), 0) AS saldo_pendiente
FROM facturas f
JOIN citas c ON f.cita_id = c.id
JOIN medicos m ON c.medico_id = m.id
JOIN especialidades e ON m.especialidad_id = e.id
LEFT JOIN (
    SELECT
        factura_id,
        SUM(monto) AS total_pagado
    FROM pagos
    GROUP BY factura_id
) pg ON pg.factura_id = f.id
WHERE f.estado <> 'anulada'
GROUP BY
    DATE_TRUNC('month', f.fecha_emision),
    e.nombre;

CREATE MATERIALIZED VIEW mv_ranking_medicos_trimestral AS
SELECT
    m.id AS medico_id,
    m.nombres || ' ' || m.apellidos AS medico,
    e.nombre AS especialidad,
    COUNT(c.id) AS citas_atendidas,
    COALESCE(SUM(f.total), 0) AS monto_facturado
FROM medicos m
JOIN especialidades e ON m.especialidad_id = e.id
LEFT JOIN citas c 
    ON c.medico_id = m.id
    AND c.estado = 'atendida'
    AND c.fecha_inicio >= CURRENT_DATE - INTERVAL '3 months'
LEFT JOIN facturas f 
    ON f.cita_id = c.id
    AND f.estado <> 'anulada'
GROUP BY
    m.id,
    m.nombres,
    m.apellidos,
    e.nombre
ORDER BY
    citas_atendidas DESC,
    monto_facturado DESC;