# Infrastructure Setup

This directory contains the Docker Compose configuration for the entire e-commerce microservices architecture.

## Architecture Components

- **RabbitMQ**: Message broker for asynchronous communication
- **Order Service Database**: PostgreSQL database for orders
- **Inventory Service Database**: PostgreSQL database for inventory
- **Order Service**: Spring Boot microservice (port 8080)
- **Inventory Service**: Node.js microservice (port 3000)

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Ports available: 8080, 3000, 5672, 15672, 5432, 5433

## Quick Start

1. **Clone the repository**

2. **Navigate to infrastructure directory**
   ```bash
   cd infrastructure
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Check services status**
   ```bash
   docker-compose ps
   ```

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

## Service Endpoints

- **Order Service API**: http://localhost:8080/api/v1
- **Inventory Service API**: http://localhost:3000/api/v1
- **RabbitMQ Management UI**: http://localhost:15672 (admin/admin123)

## Stopping Services

```bash
docker-compose down
```

## Stopping and Removing Data

```bash
docker-compose down -v
```

## RabbitMQ Configuration

- **Username**: admin
- **Password**: admin123
- **Management UI**: http://localhost:15672

### Exchanges and Queues

The services will automatically create:
- **Exchange**: `ecommerce.events` (topic)
- **Queue**: `order.created` - Consumed by Inventory Service
- **Queue**: `stock.response` - Consumed by Order Service

## Database Access

### Order Service Database
- **Host**: localhost
- **Port**: 5432
- **Database**: orderdb
- **User**: orderuser
- **Password**: orderpass

### Inventory Service Database
- **Host**: localhost
- **Port**: 5433
- **Database**: inventorydb
- **User**: inventoryuser
- **Password**: inventorypass

## Troubleshooting

### Services not starting
```bash
docker-compose logs [service-name]
```

### Rebuild services after code changes
```bash
docker-compose up -d --build
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d --build
```
