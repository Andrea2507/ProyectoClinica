# Backup completo de la base de datos clinica
# Ejecutar desde la raiz del proyecto

$PG_DUMP = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
$DATABASE = "clinica"
$USER = "postgres"
$BACKUP_DIR = "backups"
$BACKUP_FILE = "$BACKUP_DIR\clinica_full.backup"

if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

& $PG_DUMP -U $USER -d $DATABASE -F c -f $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup generado correctamente en: $BACKUP_FILE"
} else {
    Write-Host "Error al generar el backup"
}