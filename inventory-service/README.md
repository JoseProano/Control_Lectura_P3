# Inventory Service

E-commerce Inventory Management Microservice built with Node.js and TypeScript.

## Technology Stack

- **Node.js 20**
- **TypeScript 5**
- **Express.js**
- **PostgreSQL**
- **RabbitMQ (amqplib)**
- **Winston (logging)**

## Architecture

This service follows **Clean Architecture** principles and **SOLID** design principles:

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Proper use of interfaces and abstractions
- **Interface Segregation**: Specific interfaces for different concerns
- **Dependency Inversion**: Depend on abstractions, not concretions

### Package Structure

```
src/
├── config/                     # Configuration and logging
├── domain/                     # Domain layer
│   ├── models/                 # Domain entities
│   └── repositories/           # Repository interfaces
├── application/                # Application layer
│   └── services/               # Business logic services
├── infrastructure/             # Infrastructure layer
│   ├── database/               # Database connection
│   ├── messaging/              # RabbitMQ integration
│   └── repositories/           # Repository implementations
└── presentation/               # Presentation layer
    └── controllers/            # HTTP controllers
```

## API Endpoints

### Get Product Stock

**GET** `/api/v1/products/{productId}/stock`

**Example Request:**
```
GET /api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

**Response (200 OK):**
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 25,
  "reservedStock": 3,
  "updatedAt": "2026-01-21T15:08:10Z"
}
```

### Health Check

**GET** `/api/v1/health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "inventory-service",
  "timestamp": "2026-01-21T15:08:10Z"
}
```

## RabbitMQ Integration

### Consumed Events

- **OrderCreated**: Processes order and checks stock availability

### Published Events

- **StockReserved**: Published when stock is successfully reserved
- **StockRejected**: Published when stock is insufficient

## Running Locally

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL
- RabbitMQ

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Running with Docker

### Build Docker Image

```bash
docker build -t inventory-service:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e RABBITMQ_URL=amqp://admin:admin123@host.docker.internal:5672 \
  inventory-service:latest
```

## Database Schema

The service automatically creates the following table:

**products_stock**
- `product_id` (UUID, PRIMARY KEY)
- `available_stock` (INTEGER)
- `reserved_stock` (INTEGER)
- `updated_at` (TIMESTAMP)

## Initial Test Data

The service seeds the following test products on startup:

1. **Product ID**: `a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d` - Stock: 100
2. **Product ID**: `b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f` - Stock: 50
3. **Product ID**: `c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f` - Stock: 75

## Design Patterns Used

1. **Repository Pattern**: Data access abstraction
2. **Service Layer Pattern**: Business logic encapsulation
3. **Dependency Injection**: Constructor injection
4. **Singleton Pattern**: Database and RabbitMQ connections
5. **Event-Driven Architecture**: Asynchronous communication

## Business Logic

### Stock Reservation Flow

1. Receive `OrderCreated` event from RabbitMQ
2. Check if all items have sufficient stock
3. If any item has insufficient stock → Publish `StockRejected`
4. Reserve stock for all items (atomic operation)
5. If reservation fails → Publish `StockRejected`
6. If all successful → Publish `StockReserved`

### Concurrency Handling

- Uses PostgreSQL row-level locking (`FOR UPDATE`)
- Ensures atomic stock reservations
- Prevents race conditions in high-concurrency scenarios

## Error Handling

- Global error handler for Express routes
- Message acknowledgment/rejection for RabbitMQ
- Structured logging with Winston

## Testing

Run tests:
```bash
npm test
```

## Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | HTTP server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `inventorydb` |
| `DB_USER` | Database user | `inventoryuser` |
| `DB_PASSWORD` | Database password | `inventorypass` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://admin:admin123@localhost:5672` |

## Logging

All logs are structured JSON format using Winston:
- `info`: General information
- `debug`: Detailed debugging information
- `warn`: Warning messages
- `error`: Error messages with stack traces
