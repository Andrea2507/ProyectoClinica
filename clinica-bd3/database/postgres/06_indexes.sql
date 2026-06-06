CREATE INDEX IF NOT EXISTS idx_citas_fecha_inicio 
ON citas(fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha 
ON citas(medico_id, fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_citas_paciente_fecha 
ON citas(paciente_id, fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_facturas_estado 
ON facturas(estado);

CREATE INDEX IF NOT EXISTS idx_facturas_paciente 
ON facturas(paciente_id);

CREATE INDEX IF NOT EXISTS idx_pagos_factura 
ON pagos(factura_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidad 
ON auditoria(entidad, entidad_id);