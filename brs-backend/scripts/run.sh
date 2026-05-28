#!/bin/bash
# ============================================================
# BRS Backend Run Script
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Default profile
PROFILE="${1:-dev}"

echo "=========================================="
echo "  BRS Backend - Running"
echo "  Profile: $PROFILE"
echo "=========================================="

# Check if JAR exists
JAR=$(find target -name "brs-backend-*.jar" -type f | head -1)

if [ -z "$JAR" ]; then
    echo "Error: JAR file not found. Please run build.sh first."
    exit 1
fi

# Generate keys if not exist
mkdir -p keys
if [ ! -f keys/jwt-private.pem ]; then
    echo "Generating JWT keys..."
    openssl genrsa -out keys/jwt-private.pem 2048
    openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem
fi

# Run
exec java \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -Dspring.profiles.active="$PROFILE" \
    -jar "$JAR" \
    "$@"
