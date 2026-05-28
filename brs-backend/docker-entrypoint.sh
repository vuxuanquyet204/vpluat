#!/bin/bash
# ============================================================
# BRS Backend Docker Entrypoint Script
# ============================================================

set -e

echo "=========================================="
echo "  BRS Backend - Starting Application"
echo "=========================================="

# Wait for database to be ready
wait_for_db() {
    echo "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "http://${DB_HOST}:${DB_PORT}/" > /dev/null 2>&1 || \
           nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || \
           java -jar app.jar --spring.datasource.url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
               --spring.datasource.username="${DB_USER}" \
               --spring.datasource.password="${DB_PASSWORD}" \
               -Dspring.datasource.hikari.maximum-pool-size=1 \
               -Dspring.jpa.show-sql=false \
               -c "SELECT 1" > /dev/null 2>&1; then
            echo "Database is ready!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "Warning: Database may not be ready, continuing anyway..."
}

# Wait for Redis
wait_for_redis() {
    echo "Checking Redis connectivity..."
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" -a "${REDIS_PASSWORD:-}" ping > /dev/null 2>&1; then
            echo "Redis is ready!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting for Redis..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "Warning: Redis may not be ready, continuing anyway..."
}

# Wait for RabbitMQ
wait_for_rabbitmq() {
    echo "Checking RabbitMQ connectivity..."
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "http://${RABBITMQ_HOST:-localhost}:${RABBITMQ_PORT:-15672}/api/overview" > /dev/null 2>&1; then
            echo "RabbitMQ is ready!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting for RabbitMQ..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "Warning: RabbitMQ may not be ready, continuing anyway..."
}

# Generate RSA keys if not exist
generate_keys() {
    if [ ! -f "$JWT_PRIVATE_KEY_PATH" ] || [ ! -f "$JWT_PUBLIC_KEY_PATH" ]; then
        echo "Generating JWT RSA keys..."
        mkdir -p "$(dirname "$JWT_PRIVATE_KEY_PATH")"
        
        openssl genrsa -out "$JWT_PRIVATE_KEY_PATH" 2048 2>/dev/null || \
        openssl genrsa -out "$JWT_PRIVATE_KEY_PATH" 2048
        
        openssl rsa -in "$JWT_PRIVATE_KEY_PATH" -pubout -out "$JWT_PUBLIC_KEY_PATH" 2>/dev/null || \
        openssl rsa -in "$JWT_PRIVATE_KEY_PATH" -pubout -out "$JWT_PUBLIC_KEY_PATH"
        
        echo "JWT keys generated successfully!"
    else
        echo "JWT keys already exist, skipping generation."
    fi
}

# Run database migrations
run_migrations() {
    echo "Running Flyway migrations..."
    java -jar app.jar --spring.flyway.enabled=true --spring.jpa.show-sql=false \
        --spring.flyway.locations=classpath:db/migration 2>&1 | grep -E "(Migrate|Migration|error|Error)" || true
    echo "Migrations completed."
}

# Main startup
main() {
    # Wait for dependencies (optional, in docker-compose they handle this)
    if [ -n "$DB_HOST" ]; then
        wait_for_db
    fi
    
    if [ -n "$REDIS_HOST" ]; then
        wait_for_redis
    fi
    
    if [ -n "$RABBITMQ_HOST" ]; then
        wait_for_rabbitmq
    fi
    
    # Generate keys if needed
    if [ -n "$JWT_PRIVATE_KEY_PATH" ]; then
        generate_keys
    fi
    
    echo "=========================================="
    echo "  Starting Spring Boot Application"
    echo "=========================================="
    
    # Run the application
    exec java \
        -XX:+UseContainerSupport \
        -XX:MaxRAMPercentage=75.0 \
        -XX:+UseG1GC \
        -XX:+HeapDumpOnOutOfMemoryError \
        -Dfile.encoding=UTF-8 \
        -Dspring.profiles.active="${SPRING_PROFILES_ACTIVE:-dev}" \
        -jar app.jar \
        "$@"
}

# Execute main function
main "$@"
