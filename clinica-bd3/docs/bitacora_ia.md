# Bitacora IA

## 2026-05-24

Se utilizo IA para entender mejor el enunciado del proyecto y saber que tablas eran necesarias para el escenario de clinica medica privada. Con ese apoyo se reviso el diseño inicial y se adapto para incluir pacientes, medicos, especialidades, horarios, citas, servicios, facturas, pagos, usuarios del sistema y auditoria.

Tambien se utilizo IA para crear la estructura inicial del proyecto `clinica-bd3`. Ayudo a generar carpetas y archivos base para Express, PostgreSQL, MongoDB, backups y documentacion. Ademas, se uso para crear el archivo `.gitignore` y evitar subir archivos innecesarios como `node_modules` o archivos de configuracion local.

## 2026-05-31

Se utilizo IA para apoyar la insercion de datos de prueba basicos dentro del archivo `database/postgres/07_seed.sql`. Se agregaron datos iniciales para poder probar pacientes, medicos, citas, facturas y pagos.

Despues se revisaron esos datos para comprobar que tuvieran relacion con el escenario de clinica y que sirvieran para probar las consultas principales del sistema.

## Revision de PostgreSQL

Se utilizo IA para revisar los archivos SQL y encontrar errores en los nombres de tablas o columnas. Durante esta revision se detectaron columnas que no existian en la base real, como `fecha_hora`, `pagos.estado` y `pagos.cita_id`.

Con ayuda de IA se identifico que esas columnas debian cambiarse por las columnas reales del modelo, como `fecha_inicio`, `fecha_fin` y `factura_id`. Tambien se corrigieron consultas, vistas, indices, funciones y procedures para que coincidieran con el schema real de la base de datos.

## Insercion, modificacion y borrado de codigo

Se utilizo IA como apoyo para saber que partes del codigo era necesario insertar, modificar o eliminar. Por ejemplo, se revisaron archivos que tenian codigo incompleto o que ya no coincidia con el modelo actual.

Algunas partes fueron agregadas para completar funcionalidades, otras se modificaron para corregir errores, y otras se eliminaron porque usaban columnas o estructuras antiguas. Todo esto fue revisado y probado manualmente antes de dejarlo en el proyecto.

## Vistas, funciones y procedures

Se utilizo IA para apoyar la revision de las vistas normales, vistas materializadas, funciones y stored procedures. Las vistas normales se trabajaron para consultas como agenda diaria y facturas pendientes. Las vistas materializadas se usaron para reportes como facturacion mensual y ranking trimestral de medicos.

Tambien se uso IA para revisar funciones como calcular edad, consultar saldo de factura y consultar disponibilidad de medicos. Los stored procedures de registro de pago y cancelacion de cita fueron probados directamente en pgAdmin para confirmar que funcionaran correctamente.

## Conexion de API con PostgreSQL

Se utilizo IA para apoyar la conexion entre Node.js y PostgreSQL usando `pg`. Tambien ayudo a ordenar rutas y controladores en Express para consultar informacion de pacientes, medicos y citas.

Ademas, se uso IA para conectar endpoints con operaciones criticas como registro de pago y cancelacion de cita. Estas operaciones llaman stored procedures de PostgreSQL, por lo que se verifico que la API estuviera usando los nombres correctos de los procedures y parametros.

## Conexion con MongoDB e historiales clinicos

Se utilizo IA para apoyar la conexion entre Express y MongoDB mediante Mongoose. Tambien ayudo a crear la estructura inicial del modelo de historiales clinicos.

MongoDB se uso para esta parte porque los historiales clinicos pueden cambiar segun la especialidad medica. Se probaron endpoints para insertar y consultar historiales clinicos.

## Funcion de procesamiento para MongoDB

Se utilizo IA para crear una funcion JavaScript reutilizable que procesa los datos del historial clinico antes de insertarlos en MongoDB.

Esta funcion ayuda a limpiar datos, quitar espacios innecesarios, validar arreglos de diagnosticos, medicamentos y examenes, y asignar valores por defecto cuando algun campo viene vacio o no se envia.

## Documentacion

Se utilizo IA para mejorar la documentacion del proyecto. Ayudo a redactar y ordenar el documento de decisiones de diseño, la bitacora de uso de IA y partes del README.


## Uso responsable de IA

La IA se utilizo como herramienta de apoyo para entender el proyecto, insertar partes necesarias, borrar codigo que ya no servia, modificar errores y mejorar la documentacion.

No se dejo el codigo sin revisar. Las partes importantes fueron probadas manualmente en pgAdmin o desde la API para confirmar que funcionaran correctamente.