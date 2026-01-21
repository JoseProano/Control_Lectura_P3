# Order Service

E-commerce Order Management Microservice built with Spring Boot.

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data JPA**
- **Spring AMQP (RabbitMQ)**
- **PostgreSQL**
- **Lombok**
- **Maven**

## Architecture

This service follows **Clean Architecture** principles and **SOLID** design principles:

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Proper use of interfaces and abstractions
- **Interface Segregation**: Specific interfaces for different concerns
- **Dependency Inversion**: Depend on abstractions, not concretions

### Package Structure

```
ec.edu.espe.orderservice
├── domain                      # Domain layer (entities, repositories)
│   ├── model                   # Domain entities
│   └── repository              # Repository interfaces
├── application                 # Application layer (use cases, DTOs)
│   ├── dto                     # Data Transfer Objects
│   └── service                 # Service interfaces and implementations
├── infrastructure              # Infrastructure layer (external concerns)
│   ├── config                  # Configuration classes
│   └── messaging               # RabbitMQ publishers and consumers
└── presentation                # Presentation layer (REST API)
    ├── controller              # REST controllers
    └── exception               # Exception handlers
```

## API Endpoints

### Create Order

**POST** `/api/v1/orders`

**Request Body:**
```json
{
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2
    },
    {
      "productId": "b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "country": "EC",
    "city": "Quito",
    "street": "Av. Amazonas",
    "postalCode": "170135"
  },
  "paymentReference": "pay_abc123"
}
```

**Response (201 Created):**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "status": "PENDING",
  "message": "Order received. Inventory check in progress."
}
```

### Get Order

**GET** `/api/v1/orders/{orderId}`

**Response (200 OK) - Confirmed:**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "status": "CONFIRMED",
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2
    }
  ],
  "updatedAt": "2026-01-21T15:10:02Z"
}
```

**Response (200 OK) - Cancelled:**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "status": "CANCELLED",
  "reason": "Insufficient stock for product b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f",
  "items": [...],
  "updatedAt": "2026-01-21T15:10:02Z"
}
```

## RabbitMQ Integration

### Published Events

- **OrderCreated**: Published when a new order is created

### Consumed Events

- **StockReserved**: Confirms the order when stock is successfully reserved
- **StockRejected**: Cancels the order when stock is insufficient

## Running Locally

### Prerequisites

- JDK 17+
- Maven 3.6+
- PostgreSQL
- RabbitMQ

### Configuration

Set the following environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/orderdb
SPRING_DATASOURCE_USERNAME=orderuser
SPRING_DATASOURCE_PASSWORD=orderpass
SPRING_RABBITMQ_HOST=localhost
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=admin123
```

### Build

```bash
mvn clean package
```

### Run

```bash
mvn spring-boot:run
```

Or:

```bash
java -jar target/order-service-1.0.0.jar
```

## Running with Docker

### Build Docker Image

```bash
docker build -t order-service:latest .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/orderdb \
  -e SPRING_RABBITMQ_HOST=host.docker.internal \
  order-service:latest
```

## Testing

```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify
```

## Database Schema

The service automatically creates the following tables:

- **orders**: Main order information
- **order_items**: Items in each order

## Design Patterns Used

1. **Repository Pattern**: Data access abstraction
2. **Service Layer Pattern**: Business logic encapsulation
3. **DTO Pattern**: Data transfer between layers
4. **Builder Pattern**: Object creation
5. **Dependency Injection**: IoC container management
6. **Event-Driven Architecture**: Asynchronous communication

## Error Handling

The service includes global exception handling with appropriate HTTP status codes and error messages.

## Logging

Structured logging using SLF4J and Logback.
