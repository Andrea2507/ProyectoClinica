# Restauracion del backup completo
# Antes de ejecutar este script, la base clinica_restore debe estar vacia

$PG_RESTORE = "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe"
$DATABASE = "clinica_restore"
$USER = "postgres"
$BACKUP_FILE = "backups\clinica_full.backup"

& $PG_RESTORE -U $USER -d $DATABASE --clean --if-exists $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restauracion completada en la base: $DATABASE"
} else {
    Write-Host "Error al restaurar el backup"
}