TRUNCATE TABLE auditoria, pagos, factura_detalles, facturas, servicios, citas, horarios_medicos, medicos, especialidades, pacientes, usuarios_sistema RESTART IDENTITY CASCADE;

INSERT INTO usuarios_sistema (nombre, email, rol) VALUES
('Andrea Recepción', 'recepcion@clinica.com', 'recepcion'),
('Dr. Carlos Méndez', 'carlos@clinica.com', 'medico'),
('Administrador General', 'admin@clinica.com', 'admin');

INSERT INTO pacientes (nombres, apellidos, fecha_nacimiento, telefono, email, direccion) VALUES
('María Fernanda', 'López García', '1998-04-12', '5555-1111', 'maria.lopez@email.com', 'Zona 1, Quetzaltenango'),
('José Antonio', 'Ramírez Pérez', '1985-09-20', '5555-2222', 'jose.ramirez@email.com', 'Zona 3, Quetzaltenango'),
('Ana Lucía', 'Morales Díaz', '2012-01-05', '5555-3333', 'ana.morales@email.com', 'Zona 7, Quetzaltenango'),
('Luis Fernando', 'Castillo Ruiz', '1975-11-18', '5555-4444', 'luis.castillo@email.com', 'Zona 2, Quetzaltenango'),
('Sofía Isabel', 'Hernández Soto', '2001-06-30', '5555-5555', 'sofia.hernandez@email.com', 'Zona 8, Quetzaltenango');

INSERT INTO especialidades (nombre, descripcion) VALUES
('Medicina General', 'Atención médica general para pacientes de todas las edades'),
('Pediatría', 'Atención médica para niños y adolescentes'),
('Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón'),
('Dermatología', 'Diagnóstico y tratamiento de enfermedades de la piel'),
('Ginecología', 'Atención médica especializada para la salud femenina');

INSERT INTO medicos (especialidad_id, nombres, apellidos, colegiado, telefono, email) VALUES
(1, 'Carlos', 'Méndez López', 'COL-1001', '5555-6001', 'carlos.mendez@clinica.com'),
(2, 'Patricia', 'Gómez Rivera', 'COL-1002', '5555-6002', 'patricia.gomez@clinica.com'),
(3, 'Roberto', 'Fuentes Molina', 'COL-1003', '5555-6003', 'roberto.fuentes@clinica.com'),
(4, 'Elena', 'Santos Herrera', 'COL-1004', '5555-6004', 'elena.santos@clinica.com'),
(5, 'Gabriela', 'Pérez Luna', 'COL-1005', '5555-6005', 'gabriela.perez@clinica.com');

INSERT INTO horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin) VALUES
(1, 1, '08:00', '12:00'),
(1, 3, '08:00', '12:00'),
(2, 2, '09:00', '13:00'),
(2, 4, '09:00', '13:00'),
(3, 1, '14:00', '18:00'),
(3, 5, '14:00', '18:00'),
(4, 3, '10:00', '15:00'),
(5, 4, '08:00', '12:00');

INSERT INTO citas (paciente_id, medico_id, fecha_inicio, fecha_fin, estado, motivo, creado_por) VALUES
(1, 1, '2026-06-01 08:00:00', '2026-06-01 08:30:00', 'programada', 'Dolor de cabeza frecuente', 1),
(2, 3, '2026-06-01 14:00:00', '2026-06-01 14:45:00', 'confirmada', 'Dolor en el pecho', 1),
(3, 2, '2026-06-02 09:00:00', '2026-06-02 09:30:00', 'atendida', 'Control pediátrico', 1),
(4, 1, '2026-06-03 08:00:00', '2026-06-03 08:30:00', 'atendida', 'Chequeo general', 1),
(5, 5, '2026-06-04 08:00:00', '2026-06-04 08:40:00', 'programada', 'Consulta ginecológica', 1);

INSERT INTO servicios (nombre, tipo, precio) VALUES
('Consulta general', 'consulta', 150.00),
('Consulta pediátrica', 'consulta', 175.00),
('Consulta cardiológica', 'consulta', 300.00),
('Consulta dermatológica', 'consulta', 250.00),
('Consulta ginecológica', 'consulta', 225.00),
('Electrocardiograma', 'examen', 200.00),
('Curación menor', 'procedimiento', 100.00);

INSERT INTO facturas (paciente_id, cita_id, numero, subtotal, descuento, total, estado, creado_por) VALUES
(3, 3, 'FAC-0001', 175.00, 0.00, 175.00, 'pagada', 1),
(4, 4, 'FAC-0002', 150.00, 0.00, 150.00, 'pagada_parcial', 1),
(2, 2, 'FAC-0003', 500.00, 0.00, 500.00, 'pendiente', 1);

INSERT INTO factura_detalles (factura_id, servicio_id, cantidad, precio_unitario) VALUES
(1, 2, 1, 175.00),
(2, 1, 1, 150.00),
(3, 3, 1, 300.00),
(3, 6, 1, 200.00);

INSERT INTO pagos (factura_id, monto, metodo_pago, referencia, registrado_por) VALUES
(1, 175.00, 'efectivo', 'PAGO-001', 1),
(2, 75.00, 'tarjeta', 'PAGO-002', 1);

INSERT INTO auditoria (usuario_id, entidad, entidad_id, operacion, detalles) VALUES
(1, 'citas', 1, 'creacion_cita', '{"mensaje": "Cita creada desde seed"}'),
(1, 'facturas', 1, 'creacion_factura', '{"mensaje": "Factura creada desde seed"}'),
(1, 'pagos', 1, 'registro_pago', '{"mensaje": "Pago registrado desde seed"}');