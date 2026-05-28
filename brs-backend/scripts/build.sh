#!/bin/bash
# ============================================================
# BRS Backend Build Script
# ============================================================

set -e

echo "=========================================="
echo "  BRS Backend - Build Script"
echo "=========================================="

# Variables
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Check for JDK
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed"
    exit 1
fi

# Check for Maven
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed"
    exit 1
fi

# Parse arguments
PROFILE="${1:-dev}"
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --profile)
            PROFILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "Profile: $PROFILE"
echo "Skip tests: $SKIP_TESTS"

# Clean
echo "Cleaning..."
mvn clean

# Generate JWT keys for development
echo "Generating JWT keys..."
mkdir -p keys
if [ ! -f keys/jwt-private.pem ]; then
    openssl genrsa -out keys/jwt-private.pem 2048
    openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem
    echo "JWT keys generated successfully!"
else
    echo "JWT keys already exist, skipping..."
fi

# Build
echo "Building..."
if [ "$SKIP_TESTS" = true ]; then
    mvn package -DskipTests -P"$PROFILE"
else
    mvn package -P"$PROFILE"
fi

echo "=========================================="
echo "  Build completed successfully!"
echo "  JAR file: target/brs-backend-*.jar"
echo "=========================================="
