CREATE OR REPLACE FUNCTION fn_total_pagado_por_paciente(p_paciente_id INTEGER)
RETURNS NUMERIC(10, 2)
LANGUAGE plpgsql
AS $$
DECLARE
  total NUMERIC(10, 2);
BEGIN
  SELECT COALESCE(SUM(p.monto), 0)
  INTO total
  FROM pagos p
  JOIN citas c ON c.id = p.cita_id
  WHERE c.paciente_id = p_paciente_id
    AND p.estado = 'pagado';

  RETURN total;
END;
$$;
