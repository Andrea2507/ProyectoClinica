# Decisiones de diseno

- PostgreSQL se usa para datos transaccionales y relaciones fuertes: pacientes, medicos, citas y pagos.
- MongoDB se usa para historiales clinicos, porque su estructura puede variar entre pacientes.
- Express separa rutas, controladores, modelos y configuracion para mantener responsabilidades claras.
