CREATE OR REPLACE FUNCTION fn_calcular_edad(fecha_nacimiento DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN DATE_PART('year', AGE(fecha_nacimiento));
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_saldo_factura(p_factura_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC;
    v_pagado NUMERIC;
BEGIN
    SELECT total INTO v_total
    FROM facturas
    WHERE id = p_factura_id;

    IF v_total IS NULL THEN
        RAISE EXCEPTION 'La factura no existe';
    END IF;

    SELECT COALESCE(SUM(monto), 0) INTO v_pagado
    FROM pagos
    WHERE factura_id = p_factura_id;

    RETURN v_total - v_pagado;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_disponibilidad_medico(
    p_medico_id INTEGER,
    p_fecha DATE
)
RETURNS TABLE (
    hora_inicio TIME,
    hora_fin TIME,
    disponible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hm.hora_inicio,
        hm.hora_fin,
        NOT EXISTS (
            SELECT 1
            FROM citas c
            WHERE c.medico_id = p_medico_id
              AND DATE(c.fecha_inicio) = p_fecha
              AND c.estado IN ('programada', 'confirmada', 'atendida')
              AND c.fecha_inicio::time < hm.hora_fin
              AND c.fecha_fin::time > hm.hora_inicio
        ) AS disponible
    FROM horarios_medicos hm
    WHERE hm.medico_id = p_medico_id
      AND hm.activo = true
      AND hm.dia_semana = EXTRACT(DOW FROM p_fecha);
END;
$$ LANGUAGE plpgsql;