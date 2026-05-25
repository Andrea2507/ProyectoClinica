CREATE OR REPLACE PROCEDURE sp_marcar_pago_realizado(p_pago_id INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE pagos
  SET estado = 'pagado',
      pagado_en = CURRENT_TIMESTAMP
  WHERE id = p_pago_id;
END;
$$;
