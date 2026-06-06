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

ALTER TABLE citas
ADD CONSTRAINT citas_medico_sin_solape
EXCLUDE USING gist (
  medico_id WITH =,
  tsrange(fecha_inicio, fecha_fin, '[)') WITH &&
)
WHERE (estado IN ('programada', 'confirmada', 'atendida'));

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

CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios_sistema(id),
  entidad VARCHAR(80) NOT NULL,
  entidad_id INTEGER,
  operacion VARCHAR(80) NOT NULL,
  detalles JSONB,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);