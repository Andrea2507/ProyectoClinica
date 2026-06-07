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