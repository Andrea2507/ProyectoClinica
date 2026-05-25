CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ingresos_por_mes AS
SELECT
  DATE_TRUNC('month', COALESCE(pagado_en, creado_en)) AS mes,
  SUM(monto) AS total_ingresos,
  COUNT(*) AS total_pagos
FROM pagos
WHERE estado = 'pagado'
GROUP BY DATE_TRUNC('month', COALESCE(pagado_en, creado_en));
