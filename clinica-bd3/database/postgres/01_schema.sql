CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS factura_detalles CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS horarios_medicos CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios_sistema CASCADE;

CREATE TABLE usuarios_sistema (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  rol VARCHAR(30) NOT NULL CHECK (rol IN ('recepcion', 'medico', 'admin')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pacientes (
  id SERIAL PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  telefono VARCHAR(25),
  email VARCHAR(150) UNIQUE,
  direccion TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicos (
  id SERIAL PRIMARY KEY,
  especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  colegiado VARCHAR(50) UNIQUE NOT NULL,
  telefono VARCHAR(25),
  email VARCHAR(150) UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE horarios_medicos (
  id SERIAL PRIMARY KEY,
  medico_id INTEGER NOT NULL REFERENCES medicos(id),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (hora_inicio < hora_fin),
  UNIQUE (medico_id, dia_semana, hora_inicio, hora_fin)
);

CREATE TABLE citas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  medico_id INTEGER NOT NULL REFERENCES medicos(id),
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'atendida', 'cancelada', 'no_asistio')),
  motivo TEXT,
  motivo_cancelacion TEXT,
  creado_por INTEGER REFERENCES usuarios_sistema(id),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (fecha_inicio < fecha_fin),
  CHECK (estado <> 'cancelada' OR motivo_cancelacion IS NOT NULL)
);

CREATE OR REPLACE FUNCTION trg_validar_cita()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado IN ('programada', 'confirmada', 'atendida') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM horarios_medicos hm
      WHERE hm.medico_id = NEW.medico_id
        AND hm.activo = true
        AND hm.dia_semana = EXTRACT(ISODOW FROM NEW.fecha_inicio)
        AND hm.hora_inicio <= NEW.fecha_inicio::time
        AND hm.hora_fin >= NEW.fecha_fin::time
    ) THEN
      RAISE EXCEPTION 'La cita debe estar dentro del horario de atencion del medico';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM citas c
      WHERE c.id <> COALESCE(NEW.id, -1)
        AND c.paciente_id = NEW.paciente_id
        AND c.medico_id = NEW.medico_id
        AND c.fecha_inicio::date = NEW.fecha_inicio::date
        AND c.estado IN ('programada', 'confirmada', 'atendida')
    ) THEN
      RAISE EXCEPTION 'El paciente ya tiene una cita activa con este medico en ese dia';
    END IF;
  END IF;

  IF NEW.estado = 'cancelada'
     AND (NEW.motivo_cancelacion IS NULL OR LENGTH(TRIM(NEW.motivo_cancelacion)) = 0) THEN
    RAISE EXCEPTION 'Una cita cancelada debe registrar el motivo de cancelacion';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validar_cita
BEFORE INSERT OR UPDATE OF paciente_id, medico_id, fecha_inicio, fecha_fin, estado, motivo_cancelacion
ON citas
FOR EACH ROW
EXECUTE FUNCTION trg_validar_cita();

ALTER TABLE citas
ADD CONSTRAINT citas_medico_sin_solape
EXCLUDE USING gist (
  medico_id WITH =,
  tsrange(fecha_inicio, fecha_fin, '[)') WITH &&
)
WHERE (estado IN ('programada', 'confirmada', 'atendida'));

CREATE UNIQUE INDEX citas_paciente_medico_dia_activa_idx
ON citas (paciente_id, medico_id, (fecha_inicio::date))
WHERE estado IN ('programada', 'confirmada', 'atendida');

CREATE TABLE servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('consulta', 'procedimiento', 'examen')),
  precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facturas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  cita_id INTEGER UNIQUE REFERENCES citas(id),
  numero VARCHAR(30) UNIQUE NOT NULL,
  fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  descuento NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada_parcial', 'pagada', 'anulada')),
  creado_por INTEGER REFERENCES usuarios_sistema(id),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (descuento <= subtotal)
);

CREATE TABLE factura_detalles (
  id SERIAL PRIMARY KEY,
  factura_id INTEGER NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id),
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
  subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  factura_id INTEGER NOT NULL REFERENCES facturas(id),
  monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo_pago VARCHAR(40) NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cheque')),
  referencia VARCHAR(100),
  registrado_por INTEGER REFERENCES usuarios_sistema(id),
  pagado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION trg_validar_pago()
RETURNS TRIGGER AS $$
DECLARE
  v_total NUMERIC;
  v_estado VARCHAR;
  v_pagado NUMERIC;
BEGIN
  SELECT total, estado
  INTO v_total, v_estado
  FROM facturas
  WHERE id = NEW.factura_id
  FOR UPDATE;

  IF v_total IS NULL THEN
    RAISE EXCEPTION 'La factura no existe';
  END IF;

  IF v_estado = 'anulada' THEN
    RAISE EXCEPTION 'No se pueden registrar pagos sobre facturas anuladas';
  END IF;

  SELECT COALESCE(SUM(monto), 0)
  INTO v_pagado
  FROM pagos
  WHERE factura_id = NEW.factura_id
    AND id <> COALESCE(NEW.id, -1);

  IF (v_pagado + NEW.monto) > v_total THEN
    RAISE EXCEPTION 'El monto total de pagos no puede exceder el total de la factura';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_actualizar_estado_factura_por_pago()
RETURNS TRIGGER AS $$
DECLARE
  v_factura_id INTEGER;
  v_total NUMERIC;
  v_pagado NUMERIC;
  v_estado VARCHAR;
BEGIN
  v_factura_id := COALESCE(NEW.factura_id, OLD.factura_id);

  SELECT total
  INTO v_total
  FROM facturas
  WHERE id = v_factura_id;

  SELECT COALESCE(SUM(monto), 0)
  INTO v_pagado
  FROM pagos
  WHERE factura_id = v_factura_id;

  IF v_pagado = 0 THEN
    v_estado := 'pendiente';
  ELSIF v_pagado < v_total THEN
    v_estado := 'pagada_parcial';
  ELSE
    v_estado := 'pagada';
  END IF;

  UPDATE facturas
  SET estado = v_estado
  WHERE id = v_factura_id
    AND estado <> 'anulada';

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validar_pago
BEFORE INSERT OR UPDATE OF factura_id, monto
ON pagos
FOR EACH ROW
EXECUTE FUNCTION trg_validar_pago();

CREATE TRIGGER actualizar_estado_factura_por_pago
AFTER INSERT OR UPDATE OF factura_id, monto OR DELETE
ON pagos
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_estado_factura_por_pago();

CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios_sistema(id),
  entidad VARCHAR(80) NOT NULL,
  entidad_id INTEGER,
  operacion VARCHAR(80) NOT NULL,
  detalles JSONB,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
