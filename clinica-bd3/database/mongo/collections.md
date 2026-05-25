# Colecciones MongoDB

## historialesclinicos

Guarda informacion clinica flexible que puede crecer con el tiempo sin modificar el esquema relacional principal.

Campos sugeridos:

- `pacienteId`: identificador del paciente en PostgreSQL.
- `alergias`: lista de alergias conocidas.
- `antecedentes`: antecedentes medicos relevantes.
- `diagnosticos`: diagnosticos historicos.
- `tratamientos`: tratamientos indicados.
- `createdAt` y `updatedAt`: timestamps generados por Mongoose.
