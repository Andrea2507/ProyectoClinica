# Estrategia de respaldo y restauracion

## Objetivo

El objetivo de esta estrategia es asegurar que la base de datos PostgreSQL del sistema de clinica pueda respaldarse y restaurarse en caso de error, perdida de informacion o fallo del servidor.

La base de datos principal se llama `clinica`.

---

## Backup completo

Para el backup completo se utiliza `pg_dump`, ya que permite exportar toda la estructura y datos de la base de datos PostgreSQL.

Comando propuesto:

```bash
pg_dump -U postgres -d clinica -F c -f backups/clinica_full.backup

## Prueba realizada

Se realizo una prueba de restauracion desde pgAdmin.

Primero se genero un backup completo de la base original `clinica` usando la opcion **Backup** de pgAdmin, en formato **Custom**. Luego se creo una base limpia llamada `clinica_restore` y se restauro el archivo generado usando la opcion **Restore**.

Despues de la restauracion se validaron los datos ejecutando consultas de conteo sobre las tablas principales: especialidades, medicos, pacientes, citas, facturas, pagos y auditoria.

Tambien se probaron vistas y reportes principales como `vw_agenda_diaria`, `vw_facturas_pendientes`, `mv_facturacion_mensual` y `mv_ranking_medicos_trimestral`.

La restauracion fue exitosa porque la base restaurada mostro datos correctamente y las consultas principales funcionaron.

## Prueba de WAL archiving

Se configuró WAL archiving en PostgreSQL para manejar una estrategia de backup incremental.

La configuración aplicada fue:

```conf
wal_level = replica
archive_mode = on
archive_command = 'copy "%p" "C:\\backups\\wal\\%f"'

Tambien se creo el script:

backups/backup_full.ps1
Para ejecutarlo:

.\backups\backup_full.ps1

Este backup incluye tablas, datos, vistas, vistas materializadas, funciones, procedures, indices y restricciones.

Restauracion

La restauracion se probo sobre una base limpia llamada:

clinica_restore

Tambien se creo el script:

backups/restore.ps1
Para ejecutarlo:

.\backups\restore.ps1

Si se necesita limpiar la base antes de restaurar, se puede ejecutar desde pgAdmin en la base postgres:

Backup incremental con WAL archiving

Para el backup incremental se uso WAL archiving.

Los archivos WAL guardan los cambios realizados despues del ultimo backup completo.

Se modifico el archivo postgresql.conf con la siguiente configuracion:

wal_level = replica
archive_mode = on
archive_command = 'copy "%p" "C:\\backups\\wal\\%f"'

La carpeta utilizada fue:

C:\backups\wal

Despues de modificar la configuracion, se reinicio el servicio de PostgreSQL.

Luego se valido con:

SHOW archive_mode;
SHOW archive_command;
SHOW wal_level;

Para probar la generacion de WAL se ejecuto:

SELECT pg_switch_wal();

La prueba fue exitosa porque se generaron archivos WAL en:

C:\backups\wal
Script de backup incremental

Se creo el script:

backups/backup_incremental_wal.ps1
Para ejecutarlo:

.\backups\backup_incremental_wal.ps1

Politica de retencion

La politica de retencion propuesta es:

Realizar un backup completo una vez por semana.
Conservar los ultimos 4 backups completos.
Conservar los archivos WAL durante 7 dias.
Guardar el backup completo en backups/.
Guardar los archivos WAL en C:\backups\wal.
Eliminar respaldos antiguos fuera del periodo de retencion.
Probar restauracion antes de entregas o cambios importantes.