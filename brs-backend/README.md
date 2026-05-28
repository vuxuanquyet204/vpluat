# BRS Backend - Law Firm Backend Platform

Backend RESTful API cho website Văn Phòng Luật, được xây dựng trên Java 21 và Spring Boot 3.3.

## Tính Năng Chính

- **Authentication & Authorization**: JWT RS256 với token rotation
- **Booking System**: Hệ thống đặt lịch tư vấn với OTP verification
- **CRM**: Quản lý leads, reviews, newsletter
- **Content Management**: Blog, categories, tags
- **Chatbot**: AI-powered chatbot với OpenAI/Gemini integration
- **Multi-language**: Hỗ trợ Vietnamese, English

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Java 21 LTS |
| Framework | Spring Boot 3.3.x |
| Database | PostgreSQL 16 |
| ORM | Spring Data JPA |
| Migration | Flyway |
| Cache | Redis 7.2 |
| Message Broker | RabbitMQ 3.13 |
| Security | Spring Security 6 + JWT RS256 |
| API Docs | springdoc-openapi 2.3 |
| Container | Docker |

## Cấu Trúc Project

```
brs-backend/
├── src/main/java/com/lawfirm/brs/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST Controllers
│   ├── service/         # Business Logic
│   ├── repository/      # Data Access
│   ├── dto/             # Request/Response DTOs
│   ├── entity/          # JPA Entities
│   ├── mapper/          # Entity <-> DTO Mapping
│   ├── exception/       # Exception Handling
│   ├── constants/       # Enums & Constants
│   ├── util/            # Utilities
│   └── messaging/       # RabbitMQ Producers/Consumers
├── src/main/resources/
│   ├── application.yml  # Main configuration
│   └── db/migration/    # Flyway migrations
├── docker/             # Docker configurations
└── scripts/            # Build & deployment scripts
```

## Getting Started

### Yêu Cầu

- JDK 21+
- Maven 3.9+
- Docker & Docker Compose (for local development)
- PostgreSQL 16 (nếu không dùng Docker)
- Redis 7.2

### Development Setup

1. **Clone và cài đặt dependencies:**

```bash
cd brs-backend
./scripts/build.sh
```

2. **Tạo JWT keys:**

```bash
mkdir -p keys
openssl genrsa -out keys/jwt-private.pem 2048
openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem
```

3. **Khởi động infrastructure (PostgreSQL, Redis, RabbitMQ):**

```bash
cd docker
docker-compose up -d postgres redis rabbitmq
```

4. **Khởi tạo database:**

```bash
./scripts/init-db.sh
```

5. **Chạy ứng dụng:**

```bash
./scripts/run.sh dev
```

Ứng dụng sẽ chạy tại `http://localhost:8080`

### Sử dụng Docker Compose

Khởi động toàn bộ stack:

```bash
cd docker
docker-compose up -d
```

## API Documentation

Swagger UI: `http://localhost:8080/swagger-ui.html`

## Test Tài Khoản

| Email | Password | Role |
|-------|----------|------|
| admin@lawfirm.vn | Admin@123 | SUPER_ADMIN |
| editor@lawfirm.vn | Admin@123 | EDITOR |
| cskh@lawfirm.vn | Admin@123 | CSKH |
| lawyer1@lawfirm.vn | Admin@123 | LAWYER |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SPRING_PROFILES_ACTIVE | Profile (dev/prod) | dev |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | brs_dev |
| DB_USER | Database user | brs_dev |
| DB_PASSWORD | Database password | - |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| JWT_PRIVATE_KEY_PATH | Path to JWT private key | keys/jwt-private.pem |
| JWT_PUBLIC_KEY_PATH | Path to JWT public key | keys/jwt-public.pem |

## Building for Production

```bash
# Build JAR
./scripts/build.sh --profile prod

# Build Docker image
docker build -t brs-backend:latest .
```

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest
```

## License

Internal Use Only - LawFirm
