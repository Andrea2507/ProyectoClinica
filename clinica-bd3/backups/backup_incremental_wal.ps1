# Backup incremental usando WAL archiving
# Este script fuerza a PostgreSQL a cerrar el WAL actual para que pueda archivarse.
# Requiere que WAL archiving este configurado previamente en postgresql.conf.

$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$DATABASE = "clinica"
$USER = "postgres"
$WAL_DIR = "C:\backups\wal"

if (!(Test-Path $WAL_DIR)) {
    New-Item -ItemType Directory -Path $WAL_DIR
}

Write-Host "Forzando cambio de WAL..."

& $PSQL -U $USER -d $DATABASE -c "SELECT pg_switch_wal();"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Cambio de WAL ejecutado correctamente."
    Write-Host "Los archivos WAL deben archivarse en: $WAL_DIR"
} else {
    Write-Host "Error al ejecutar pg_switch_wal."
}