#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/output}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

pg_dump "$POSTGRES_DATABASE" > "$BACKUP_DIR/postgres_$TIMESTAMP.sql"
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo_$TIMESTAMP"

echo "Backup creado en $BACKUP_DIR"
