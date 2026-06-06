# Colecciones MongoDB

## historiales_clinicos

Esta coleccion almacena los historiales clinicos registrados durante las consultas medicas.

Se usa MongoDB porque la informacion clinica puede variar segun la especialidad. Por ejemplo, cardiologia puede registrar datos diferentes a dermatologia, pediatria o ginecologia.

## Campos principales

- `cita_id`: identificador de la cita en PostgreSQL.
- `paciente_id`: identificador del paciente en PostgreSQL.
- `medico_id`: identificador del medico en PostgreSQL.
- `especialidad`: especialidad medica de la consulta.
- `motivo_consulta`: motivo principal de la consulta.
- `signos_vitales`: objeto con datos como presion arterial, temperatura, peso, altura y frecuencia cardiaca.
- `diagnosticos`: arreglo de diagnosticos registrados durante la consulta.
- `medicamentos`: arreglo de medicamentos recetados.
- `examenes_solicitados`: arreglo de examenes solicitados al paciente.
- `notas_adicionales`: observaciones extra del medico.
- `datos_especialidad`: objeto flexible para guardar informacion especifica segun la especialidad.
- `registrado_por`: usuario del sistema que registro el historial.
- `fecha_registro`: fecha en que se registro el historial.

## Decisiones de diseño

Los campos `cita_id`, `paciente_id` y `medico_id` funcionan como referencias logicas hacia PostgreSQL.

Los diagnosticos, medicamentos, examenes y signos vitales se guardan embebidos dentro del mismo documento porque normalmente se consultan junto con el historial clinico.

El campo `datos_especialidad` permite guardar informacion variable sin modificar el modelo cada vez que una especialidad necesite datos diferentes.