# Guía breve de respaldo y restauración

## 1. Backup completo

El backup completo guarda toda la base de datos: tablas, datos, vistas, funciones, procedures, índices y restricciones.

Se realiza con `pg_dump`:

```powershell
pg_dump -U postgres -d clinica -F c -f "C:\backups\clinica_full.backup"

En ste caso yo utilicé
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -d clinica -F c -f "..\backups\clinica_full.backup"
```

Explicación rápida:

- `-U postgres`: usuario de PostgreSQL.
- `-d clinica`: base de datos que se respalda.
- `-F c`: formato custom, útil para restaurar con `pg_restore`.
- `-f`: ruta donde se guarda el archivo.

El archivo generado es el respaldo completo de la base.

## 2. Backup incremental con WAL

El backup incremental se maneja con **WAL archiving**.

WAL significa **Write Ahead Log**.  
Sirve para guardar los cambios que ocurren después del backup completo.

Idea simple:

Backup completo = foto de la base.  
WAL = historial de cambios después de esa foto.

En `postgresql.conf` se configura:

```conf
wal_level = replica
archive_mode = on
archive_command = 'copy /Y "%p" "C:\\backups\\wal\\%f"'
```

Después de modificar esa configuración, se reinicia PostgreSQL.

Para forzar que se archive un WAL:

```sql
SELECT pg_switch_wal();
```
Se debe ejecutar el siguiente comando en la terminal
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d clinica -c "SELECT pg_switch_wal();"

Si funciona, debe aparecer un archivo nuevo en:

```txt
C:\backups\wal
```

## 3. Restauración

La restauración se hace sobre una base limpia para no dañar la original.

Crear base limpia:

```sql
CREATE DATABASE clinica_restore;
```

Restaurar el backup:

```powershell
pg_restore -U postgres -d clinica_restore "C:\backups\clinica_full.backup"
```

## 4. Validación

Después de restaurar, se revisa que los datos existan:

```sql
SELECT COUNT(*) FROM pacientes;
SELECT COUNT(*) FROM medicos;
SELECT COUNT(*) FROM citas;
SELECT COUNT(*) FROM facturas;
SELECT COUNT(*) FROM pagos;
SELECT COUNT(*) FROM auditoria;
```

También se prueban vistas y funciones:

```sql
SELECT * FROM vw_agenda_diaria LIMIT 5;
SELECT * FROM mv_facturacion_mensual LIMIT 5;
SELECT fn_saldo_factura(1);
```

## 5. Frase para defensa

La estrategia usa un backup completo con `pg_dump` y un backup incremental con WAL. El backup completo guarda toda la base, mientras que WAL guarda los cambios posteriores. Para comprobarlo, se restaura en una base limpia con `pg_restore` y se validan datos, vistas y funciones.