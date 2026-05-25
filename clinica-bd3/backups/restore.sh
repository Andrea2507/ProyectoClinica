#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: ./restore.sh <postgres_dump.sql> <mongo_dump_dir>"
  exit 1
fi

psql "$POSTGRES_DATABASE" < "$1"
mongorestore --uri="$MONGO_URI" "$2"

echo "Restauracion completada"
