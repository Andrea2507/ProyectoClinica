# Configuracion de WAL archiving

Para el backup incremental se propone utilizar WAL archiving de PostgreSQL.

Los archivos WAL registran los cambios realizados en la base de datos despues del ultimo backup completo. Esto permite recuperar cambios posteriores al backup full.

## Configuracion sugerida

En el archivo `postgresql.conf` se debe configurar:

```conf
wal_level = replica
archive_mode = on
archive_command = 'copy "%p" "C:\\backups\\wal\\%f"'