CREATE OR REPLACE PROCEDURE sp_registrar_pago(
    p_factura_id INTEGER,
    p_monto NUMERIC,
    p_metodo_pago VARCHAR,
    p_referencia VARCHAR,
    p_usuario_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC;
    v_pagado NUMERIC;
    v_saldo NUMERIC;
    v_nuevo_pagado NUMERIC;
    v_nuevo_estado VARCHAR;
BEGIN
    SELECT total
    INTO v_total
    FROM facturas
    WHERE id = p_factura_id
    FOR UPDATE;

    IF v_total IS NULL THEN
        RAISE EXCEPTION 'La factura no existe';
    END IF;

    SELECT COALESCE(SUM(monto), 0)
    INTO v_pagado
    FROM pagos
    WHERE factura_id = p_factura_id;

    v_saldo := v_total - v_pagado;

    IF p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto debe ser positivo';
    END IF;

    IF p_monto > v_saldo THEN
        RAISE EXCEPTION 'El pago excede el saldo pendiente';
    END IF;

    INSERT INTO pagos (
        factura_id,
        monto,
        metodo_pago,
        referencia,
        registrado_por,
        pagado_en
    )
    VALUES (
        p_factura_id,
        p_monto,
        p_metodo_pago,
        p_referencia,
        p_usuario_id,
        CURRENT_TIMESTAMP
    );

    v_nuevo_pagado := v_pagado + p_monto;

    IF v_nuevo_pagado = v_total THEN
        v_nuevo_estado := 'pagada';
    ELSIF v_nuevo_pagado > 0 THEN
        v_nuevo_estado := 'pagada_parcial';
    ELSE
        v_nuevo_estado := 'pendiente';
    END IF;

    UPDATE facturas
    SET estado = v_nuevo_estado
    WHERE id = p_factura_id;

    INSERT INTO auditoria (
        usuario_id,
        entidad,
        entidad_id,
        operacion,
        detalles
    )
    VALUES (
        p_usuario_id,
        'facturas',
        p_factura_id,
        'registro_pago',
        jsonb_build_object(
            'monto', p_monto,
            'metodo_pago', p_metodo_pago,
            'referencia', p_referencia,
            'nuevo_estado', v_nuevo_estado
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;