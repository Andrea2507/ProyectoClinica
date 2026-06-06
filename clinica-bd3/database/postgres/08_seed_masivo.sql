TRUNCATE TABLE
  auditoria,
  pagos,
  factura_detalles,
  facturas,
  citas,
  horarios_medicos,
  medicos,
  pacientes,
  servicios,
  especialidades,
  usuarios_sistema
RESTART IDENTITY CASCADE;


-- Usuarios del sistema
INSERT INTO usuarios_sistema (nombre, email, rol, activo)
VALUES
('Admin Principal', 'admin@clinica.com', 'admin', true),
('Recepcion 1', 'recepcion1@clinica.com', 'recepcion', true),
('Recepcion 2', 'recepcion2@clinica.com', 'recepcion', true),
('Medico Usuario', 'medico@clinica.com', 'medico', true);


-- Especialidades
INSERT INTO especialidades (nombre, descripcion, activo)
VALUES
('Medicina General', 'Atencion medica general', true),
('Pediatria', 'Atencion medica para ninos', true),
('Cardiologia', 'Atencion de enfermedades del corazon', true),
('Dermatologia', 'Atencion de piel y enfermedades dermatologicas', true),
('Ginecologia', 'Atencion medica ginecologica', true);


-- Medicos: 10, dos por especialidad
INSERT INTO medicos (especialidad_id, nombres, apellidos, colegiado, telefono, email, activo)
SELECT
  ((i - 1) / 2) + 1 AS especialidad_id,
  nombres[i],
  apellidos[i],
  'COL-' || LPAD(i::text, 4, '0'),
  '5555-' || LPAD(i::text, 4, '0'),
  'medico' || i || '@clinica.com',
  true
FROM generate_series(1, 10) AS i,
LATERAL (
  SELECT
    ARRAY['Carlos','Patricia','Roberto','Elena','Gabriela','Mario','Lucia','Fernando','Andrea','Jorge'] AS nombres,
    ARRAY['Mendez','Gomez','Fuentes','Santos','Perez','Lopez','Herrera','Castillo','Rivera','Morales'] AS apellidos
) datos;


-- Horarios medicos: lunes a viernes, 8:00 a 16:00
INSERT INTO horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, activo)
SELECT
  m.id,
  d.dia,
  TIME '08:00',
  TIME '16:00',
  true
FROM medicos m
CROSS JOIN generate_series(1, 5) AS d(dia);


-- Pacientes: 30
INSERT INTO pacientes (nombres, apellidos, fecha_nacimiento, telefono, email, direccion)
SELECT
  nombres[((i - 1) % 10) + 1],
  apellidos[((i - 1) % 10) + 1],
  DATE '1970-01-01' + (i * 370),
  '4000-' || LPAD(i::text, 4, '0'),
  'paciente' || i || '@correo.com',
  'Direccion paciente ' || i
FROM generate_series(1, 30) AS i,
LATERAL (
  SELECT
    ARRAY['Maria','Jose','Ana','Luis','Sofia','Pedro','Laura','Diego','Valeria','Ricardo'] AS nombres,
    ARRAY['Lopez','Ramirez','Morales','Castillo','Hernandez','Garcia','Perez','Gomez','Diaz','Ruiz'] AS apellidos
) datos;


-- Servicios facturables
INSERT INTO servicios (nombre, tipo, precio, activo)
VALUES
('Consulta general', 'consulta', 150.00, true),
('Consulta pediatrica', 'consulta', 175.00, true),
('Consulta cardiologica', 'consulta', 500.00, true),
('Consulta dermatologica', 'consulta', 300.00, true),
('Consulta ginecologica', 'consulta', 350.00, true),
('Electrocardiograma', 'examen', 250.00, true),
('Hemograma', 'examen', 100.00, true),
('Ultrasonido', 'examen', 400.00, true),
('Curacion menor', 'procedimiento', 125.00, true),
('Control medico', 'consulta', 120.00, true);


-- Citas: 200 distribuidas en los ultimos 6 meses
INSERT INTO citas (
  paciente_id,
  medico_id,
  fecha_inicio,
  fecha_fin,
  estado,
  motivo,
  motivo_cancelacion,
  creado_por
)
SELECT
  ((i - 1) % 30) + 1 AS paciente_id,
  ((i - 1) % 10) + 1 AS medico_id,
  (CURRENT_DATE - ((i % 180) || ' days')::interval)
    + ((8 + (i % 8)) || ' hours')::interval AS fecha_inicio,
  (CURRENT_DATE - ((i % 180) || ' days')::interval)
    + ((8 + (i % 8)) || ' hours')::interval
    + INTERVAL '30 minutes' AS fecha_fin,
  CASE
    WHEN i % 10 = 0 THEN 'cancelada'
    WHEN i % 7 = 0 THEN 'confirmada'
    WHEN i % 3 = 0 THEN 'programada'
    ELSE 'atendida'
  END AS estado,
  CASE
    WHEN i % 5 = 0 THEN 'Control de seguimiento'
    WHEN i % 5 = 1 THEN 'Dolor de cabeza'
    WHEN i % 5 = 2 THEN 'Chequeo general'
    WHEN i % 5 = 3 THEN 'Dolor abdominal'
    ELSE 'Consulta de rutina'
  END AS motivo,
  CASE
    WHEN i % 10 = 0 THEN 'Paciente solicito cancelacion'
    ELSE NULL
  END AS motivo_cancelacion,
  ((i - 1) % 4) + 1 AS creado_por
FROM generate_series(1, 200) AS i;


-- Facturas: 100, asociadas a las primeras 100 citas
-- Facturas: 100, asociadas a las primeras 100 citas
INSERT INTO facturas (
  paciente_id,
  cita_id,
  numero,
  fecha_emision,
  descuento,
  total,
  estado,
  creado_por
)
SELECT
  c.paciente_id,
  c.id AS cita_id,
  'FAC-' || LPAD(c.id::text, 5, '0'),
  c.fecha_inicio + INTERVAL '1 hour',
  0,
  s.precio,
  CASE
    WHEN c.id <= 40 THEN 'pagada'
    WHEN c.id <= 80 THEN 'pagada_parcial'
    ELSE 'pendiente'
  END AS estado,
  1
FROM citas c
JOIN servicios s ON s.id = ((c.id - 1) % 10) + 1
WHERE c.id <= 100;

-- Detalles de factura
-- Detalles de factura
INSERT INTO factura_detalles (
  factura_id,
  servicio_id,
  cantidad,
  precio_unitario
)
SELECT
  f.id,
  ((f.id - 1) % 10) + 1 AS servicio_id,
  1,
  s.precio
FROM facturas f
JOIN servicios s ON s.id = ((f.id - 1) % 10) + 1;
-- Pagos: 80
-- Facturas 1-40 pagadas completo, 41-80 pagadas parcial
INSERT INTO pagos (
  factura_id,
  monto,
  metodo_pago,
  referencia,
  registrado_por,
  pagado_en
)
SELECT
  f.id,
  CASE
    WHEN f.id <= 40 THEN f.total
    ELSE ROUND(f.total * 0.50, 2)
  END AS monto,
  CASE
    WHEN f.id % 3 = 0 THEN 'tarjeta'
    WHEN f.id % 3 = 1 THEN 'efectivo'
    ELSE 'transferencia'
  END AS metodo_pago,
  'PAGO-' || LPAD(f.id::text, 5, '0'),
  ((f.id - 1) % 4) + 1,
  f.fecha_emision + INTERVAL '2 hours'
FROM facturas f
WHERE f.id <= 80;


-- Auditoria: 500 registros
INSERT INTO auditoria (
  usuario_id,
  entidad,
  entidad_id,
  operacion,
  detalles,
  creado_en
)
SELECT
  ((i - 1) % 4) + 1 AS usuario_id,
  CASE
    WHEN i % 4 = 0 THEN 'citas'
    WHEN i % 4 = 1 THEN 'facturas'
    WHEN i % 4 = 2 THEN 'pagos'
    ELSE 'historiales_clinicos'
  END AS entidad,
  ((i - 1) % 200) + 1 AS entidad_id,
  CASE
    WHEN i % 4 = 0 THEN 'creacion_cita'
    WHEN i % 4 = 1 THEN 'generacion_factura'
    WHEN i % 4 = 2 THEN 'registro_pago'
    ELSE 'registro_historial'
  END AS operacion,
  jsonb_build_object(
    'descripcion', 'Registro de auditoria generado como dato de prueba',
    'numero', i
  ) AS detalles,
  CURRENT_TIMESTAMP - ((i % 180) || ' days')::interval
FROM generate_series(1, 500) AS i;