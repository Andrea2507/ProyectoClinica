INSERT INTO pacientes (nombres, apellidos, fecha_nacimiento, telefono, email)
VALUES
  ('Ana', 'Lopez', '1998-04-12', '5550-1001', 'ana.lopez@example.com'),
  ('Carlos', 'Mendez', '1987-09-03', '5550-1002', 'carlos.mendez@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (nombres, apellidos, especialidad, colegiado)
VALUES
  ('Mariana', 'Soto', 'Medicina general', 'COL-1001'),
  ('Luis', 'Garcia', 'Cardiologia', 'COL-1002')
ON CONFLICT (colegiado) DO NOTHING;
