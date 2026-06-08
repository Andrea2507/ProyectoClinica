# Bitácora de uso de IA

## Proyecto Final - Bases de Datos III  
## Sistema de clínica médica privada

## 1. Introducción

Durante el desarrollo del proyecto sí usamos herramientas de inteligencia artificial como apoyo, principalmente para orientarnos, revisar ideas, entender conceptos y organizar mejor la documentación. La IA no se usó con la intención de entregar algo sin entenderlo, sino como una herramienta de ayuda para aprender y avanzar más rápido.

Como el proyecto incluye muchos temas que no dominábamos completamente al inicio, usamos IA para aclarar conceptos relacionados con PostgreSQL, MongoDB, vistas, funciones, stored procedures, pipelines de aggregation, índices, backups y documentación técnica.

También usamos IA para revisar si el proyecto cumplía con los requisitos del enunciado y para preparar explicaciones más claras para la defensa oral.


## 2. Partes en las que usamos IA

### 2.1 Explicación de conceptos

Pedimos ayuda para entender conceptos básicos y poder explicarlos con palabras sencillas. Algunos de los conceptos consultados fueron:

- Qué es PostgreSQL.
- Qué es MongoDB.
- Qué es una base de datos relacional.
- Qué es una base de datos NoSQL.
- Qué es una vista normal.
- Qué es una vista materializada.
- Qué es una función en PostgreSQL.
- Qué es un stored procedure.
- Qué es un pipeline de aggregation en MongoDB.
- Qué es un índice.
- Qué es `EXPLAIN ANALYZE`.
- Qué es una auditoría.
- Qué significa normalización hasta 3FN.
- Qué significa una transacción.
- Qué significa concurrencia.

Esto nos ayudó bastante porque al inicio varios conceptos eran confusos, especialmente la diferencia entre una función, un procedure y un pipeline.


## 3. Uso de IA en el diseño de la base de datos

Usamos IA para revisar si las entidades elegidas tenían sentido para el escenario de clínica médica privada. Se le pidió apoyo para analizar si tablas como `pacientes`, `medicos`, `especialidades`, `citas`, `facturas`, `pagos`, `servicios` y `auditoria` estaban bien justificadas.

La IA también nos ayudó a entender por qué era mejor guardar la información transaccional en PostgreSQL y los historiales clínicos en MongoDB.

Sin embargo, las decisiones finales se tomaron revisando el enunciado del proyecto y adaptándolas a nuestro sistema. No se copió el diseño sin revisarlo, sino que se usó como guía para ordenar mejor las ideas.



## 4. Uso de IA en PostgreSQL

En la parte de PostgreSQL, usamos IA para entender mejor cómo funcionaban los objetos de base de datos que el proyecto pedía, especialmente:

- Vistas normales.
- Vistas materializadas.
- Funciones.
- Stored procedures.
- Triggers.
- Índices.
- Restricciones `CHECK`, `UNIQUE` y llaves foráneas.

También pedimos explicaciones sobre qué hacía cada parte del código para poder estudiarlo y defenderlo. Por ejemplo, se pidió ayuda para explicar el registro de pagos, la cancelación de citas y la validación de horarios médicos.

La IA también se usó para preparar respuestas de defensa oral, especialmente sobre por qué se usaba `FOR UPDATE`, por qué las vistas materializadas necesitaban refresh y por qué algunas reglas iban en el schema y otras en procedures.



## 5. Uso de IA en MongoDB

En MongoDB usamos IA para entender cómo funcionaban los documentos y los pipelines de aggregation.

Pedimos ejemplos y explicaciones sobre operadores como:

- `$match`
- `$unwind`
- `$group`
- `$sort`
- `$limit`
- `$project`
- `$facet`

También usamos IA para entender por qué los historiales clínicos eran mejores en MongoDB que en PostgreSQL. La explicación principal fue que los historiales pueden cambiar según la especialidad médica, por lo que MongoDB permite una estructura más flexible.

Además, se pidió ayuda para explicar por qué se embebieron diagnósticos, medicamentos, exámenes y signos vitales dentro del historial clínico.



## 6. Uso de IA en la documentación

Usamos IA para ayudarnos a redactar y ordenar varios documentos del proyecto, como:

- Documento de decisiones de diseño.
- Explicación del modelo relacional normalizado hasta 3FN.
- Justificación de índices.
- Reporte de performance.
- Guía de estudio para la defensa oral.
- Preguntas y respuestas posibles para la defensa.

La IA ayudó principalmente a ordenar la información en un lenguaje más claro, porque algunos temas estaban muy técnicos y necesitábamos explicarlos de forma más sencilla.

Después de eso, revisamos el contenido y lo adaptamos a nuestro proyecto.


## 7. Partes que modificamos manualmente

Después de recibir ayuda de IA, hicimos modificaciones manuales para que todo coincidiera con nuestro proyecto real. Algunas de las cosas que ajustamos fueron:

- Nombres de tablas.
- Nombres de vistas.
- Nombres de funciones.
- Nombres de stored procedures.
- Explicaciones sobre los reportes.
- Justificaciones de PostgreSQL y MongoDB.
- Explicaciones para la defensa oral.
- Documentos finales en Word y Markdown.

También revisamos que las explicaciones no fueran demasiado complicadas, porque necesitábamos poder entenderlas y defenderlas oralmente.


## 8. Errores o detalles que tuvimos que corregir

La IA ayudó bastante, pero también hubo cosas que tuvimos que revisar o corregir.

Por ejemplo:

- Algunas respuestas eran demasiado largas o formales, y tuvimos que pedir versiones más cortas.
- Algunas explicaciones eran muy técnicas y las simplificamos.
- Al principio se incluyó MongoDB dentro del diagrama ER, pero luego corregimos eso porque el ER debía ser solo del modelo PostgreSQL.
- También se revisó que el documento de normalización no fuera solo texto, sino que incluyera una tabla con las tablas, llaves primarias, llaves foráneas y propósito.
- En la parte de procedures, tuvimos que tener cuidado con la explicación de rollback, porque no era correcto decir simplemente que había un `ROLLBACK` escrito si no aparecía literalmente así.

Estos ajustes nos ayudaron a entender mejor el proyecto y a no depender únicamente de lo que generaba la IA.


## 9. Cómo verificamos lo generado

No solo copiamos lo que decía la IA. También revisamos el enunciado y comparamos los requisitos con lo que tenía nuestro proyecto.

Se verificó que el proyecto incluyera:

- 2 vistas normales.
- 2 vistas materializadas.
- 3 funciones.
- 2 stored procedures.
- Índices justificados.
- Función JavaScript reutilizable para MongoDB.
- 4 pipelines de aggregation.
- Un pipeline con `$facet`.
- Datos de prueba suficientes.
- Auditoría.
- Documentación de diseño.
- Reporte de performance.

También se revisaron las explicaciones para que fueran coherentes con el sistema de clínica médica privada.



## 11. Conclusión

La IA se utilizó como apoyo para aprender, revisar, organizar y documentar el proyecto. No se usó para evitar entender el trabajo, sino para poder comprender mejor los temas y prepararnos para la defensa.

Las partes más importantes del proyecto fueron revisadas y adaptadas manualmente para que coincidieran con nuestro sistema. Además, se usó la IA para practicar posibles preguntas y respuestas de la defensa oral.

En general, la IA fue útil como guía de estudio y revisión, pero el objetivo final fue entender el proyecto lo suficiente como para poder explicarlo con nuestras propias palabras.