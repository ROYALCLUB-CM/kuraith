#!/bin/bash
# KURAITH Database Backup Script
# Usage: bash scripts/backup.sh [output-dir]
#
# Backs up the PostgreSQL database from Docker container
# Keeps last 7 backups, auto-compresses with gzip

set -e

CONTAINER="kuraith-db"
DB_NAME="kuraith"
DB_USER="kuraith"
OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="kuraith_backup_${TIMESTAMP}.sql"

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║       KURAITH Database Backup        ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# Check Docker container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "  ✗ Container '${CONTAINER}' is not running"
  echo "  → Start it: docker compose up -d db"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Run pg_dump inside container
echo "  [1/3] Dumping database..."
docker exec "$CONTAINER" pg_dump -U "$DB_USER" --clean --if-exists "$DB_NAME" > "$OUTPUT_DIR/$FILENAME"

# Compress
echo "  [2/3] Compressing..."
gzip "$OUTPUT_DIR/$FILENAME"
SIZE=$(du -h "$OUTPUT_DIR/${FILENAME}.gz" | cut -f1)
echo "        → ${FILENAME}.gz ($SIZE)"

# Cleanup old backups (keep last 7)
echo "  [3/3] Cleaning old backups..."
REMOVED=$(ls -t "$OUTPUT_DIR"/kuraith_backup_*.sql.gz 2>/dev/null | tail -n +8 | wc -l | tr -d ' ')
ls -t "$OUTPUT_DIR"/kuraith_backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true

echo ""
echo "  ══════════════════════════════════════"
echo "  Backup complete!"
echo "  File: $OUTPUT_DIR/${FILENAME}.gz"
echo "  Size: $SIZE"
echo "  Kept: 7 most recent backups"
if [ "$REMOVED" -gt 0 ] 2>/dev/null; then
  echo "  Removed: $REMOVED old backup(s)"
fi
echo ""

# --- Restore instructions ---
echo "  To restore:"
echo "    gunzip < $OUTPUT_DIR/${FILENAME}.gz | docker exec -i $CONTAINER psql -U $DB_USER $DB_NAME"
echo ""
