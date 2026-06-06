# Decisiones de diseño

Se seleccionó la **opción A: Clínica médica privada**. El sistema permite gestionar pacientes, médicos, especialidades, horarios, citas, servicios, facturas, pagos, auditoría e historiales clínicos.

## Uso de PostgreSQL

PostgreSQL se utiliza para almacenar la información transaccional del sistema, ya que estos datos requieren integridad, relaciones claras y validaciones estrictas.

En esta base se guardan pacientes, médicos, especialidades, horarios médicos, citas, servicios, facturas, detalles de factura, pagos, usuarios del sistema y auditoría.

Se eligió PostgreSQL para esta parte porque permite manejar llaves foráneas, restricciones, índices, vistas, funciones y stored procedures. Esto es importante especialmente para las citas, pagos y facturas, ya que son datos que no pueden quedar inconsistentes.

## Uso de MongoDB

MongoDB se utiliza para almacenar los historiales clínicos, ya que la información médica puede variar según la especialidad.

Por ejemplo, una consulta de cardiología puede registrar presión arterial, frecuencia cardiaca o antecedentes cardiovasculares, mientras que una consulta de dermatología puede registrar lesiones, zonas afectadas o tipo de piel.

Usar MongoDB permite guardar esta información de forma flexible sin crear muchas columnas vacías o tablas adicionales en PostgreSQL.

## Separación entre PostgreSQL y MongoDB

PostgreSQL se usa para la parte estructurada y transaccional del sistema: pacientes, médicos, citas, facturas, pagos y auditoría.

MongoDB se usa para la parte clínica flexible: historiales médicos, diagnósticos, medicamentos, exámenes solicitados, signos vitales y datos específicos por especialidad.

Esta separación permite que el sistema tenga consistencia en la parte operativa y financiera, y flexibilidad en la parte clínica.

## Tablas principales creadas

- `pacientes`: almacena la información personal y de contacto de los pacientes.
- `especialidades`: contiene el catálogo de especialidades médicas.
- `medicos`: almacena los médicos y su relación con una especialidad.
- `horarios_medicos`: define los horarios de atención de cada médico.
- `citas`: registra las citas médicas, su horario, estado y motivo.
- `servicios`: contiene los servicios facturables de la clínica.
- `facturas`: registra las facturas emitidas a los pacientes.
- `factura_detalles`: almacena los servicios incluidos en cada factura.
- `pagos`: registra los pagos realizados sobre facturas.
- `auditoria`: guarda operaciones importantes realizadas en el sistema.
- `usuarios_sistema`: representa a los usuarios internos que realizan acciones.

## Reglas de negocio

Algunas reglas se manejan directamente en PostgreSQL mediante restricciones, llaves foráneas e índices. Otras se manejan con stored procedures.

Entre las reglas consideradas están:

- Un médico no debe tener dos citas en el mismo horario.
- Una cita debe tener un estado válido.
- Una factura debe tener un estado válido.
- Un pago debe estar asociado a una factura existente.
- Los pagos no deben exceder el saldo pendiente de una factura.
- No se deben registrar pagos sobre facturas anuladas.
- Una cita atendida no puede cancelarse.
- Una cita cancelada debe registrar un motivo.
- Las operaciones críticas deben registrarse en auditoría.

## Vistas, funciones y procedures

Se implementaron vistas normales para consultas frecuentes como agenda diaria y facturas pendientes.

También se implementaron vistas materializadas para reportes gerenciales como facturación mensual y ranking trimestral de médicos. Estas vistas se usan porque no necesitan actualizarse en tiempo real.

Las funciones se usaron para lógica reutilizable, como calcular edad, calcular saldo de factura y consultar disponibilidad de médicos.

Los stored procedures se usaron para operaciones críticas, como registrar pagos y cancelar citas, ya que estas operaciones necesitan validaciones y deben quedar registradas en auditoría.

## Índices

Se crearon índices para mejorar consultas frecuentes, especialmente en citas, facturas, pagos y auditoría.

Los índices ayudan en búsquedas por fecha de cita, médico, paciente, estado de factura, factura asociada a pagos y operaciones registradas en auditoría.

## Conclusión

El diseño busca mantener en PostgreSQL los datos que necesitan consistencia fuerte y relaciones claras, mientras que MongoDB se usa para los datos clínicos que pueden cambiar según la especialidad.

De esta forma, el sistema aprovecha las ventajas de ambos motores de base de datos.