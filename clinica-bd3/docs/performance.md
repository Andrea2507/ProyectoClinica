# Performance

- Indices principales definidos en `database/postgres/06_indexes.sql`.
- La vista materializada `mv_ingresos_por_mes` resume ingresos para reportes frecuentes.
- En MongoDB, `pacienteId` queda indexado desde el modelo de Mongoose para buscar historiales rapidamente.
