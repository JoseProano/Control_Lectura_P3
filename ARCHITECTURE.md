# Arquitectura y Diagramas del Sistema

## Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│                         Cliente HTTP                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ POST /api/v1/orders
                         │ GET  /api/v1/orders/{id}
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Order Service (Spring Boot)                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Presentation Layer                                           │ │
│ │  - OrderController (REST API)                                │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Application Layer                                            │ │
│ │  - OrderService (Business Logic)                             │ │
│ │  - OrderMapper (DTO Mapping)                                 │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Domain Layer                                                 │ │
│ │  - Order, OrderItem, OrderStatus                             │ │
│ │  - OrderRepository                                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Infrastructure Layer                                         │ │
│ │  - RabbitMQEventPublisher                                    │ │
│ │  - StockResponseConsumer                                     │ │
│ └──────────────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────────────┬──────────────────────┘
             │                              │
             │ Publish:                     │ Read/Write
             │ - OrderCreated               │
             │                              ▼
             │                    ┌──────────────────┐
             │                    │   PostgreSQL     │
             │                    │   (Order DB)     │
             │                    └──────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       RabbitMQ Message Broker                     │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Exchange: ecommerce.events (topic)                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Queue: order.created                                         │ │
│ │  - Routing Key: order.created                                │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Queue: stock.response                                        │ │
│ │  - Routing Key: stock.reserved                               │ │
│ │  - Routing Key: stock.rejected                               │ │
│ └──────────────────────────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ Consume:
             │ - OrderCreated
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Inventory Service (Node.js)                      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Presentation Layer                                           │ │
│ │  - ProductStockController (REST API)                         │ │
│ │  - ExpressApp (HTTP Server)                                  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Application Layer                                            │ │
│ │  - InventoryService (Business Logic)                         │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Domain Layer                                                 │ │
│ │  - ProductStock (Model)                                      │ │
│ │  - IProductStockRepository (Interface)                       │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Infrastructure Layer                                         │ │
│ │  - PostgresProductStockRepository                            │ │
│ │  - RabbitMQEventPublisher                                    │ │
│ │  - OrderCreatedConsumer                                      │ │
│ └──────────────────────────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ Read/Write
             ▼
   ┌──────────────────┐
   │   PostgreSQL     │
   │ (Inventory DB)   │
   └──────────────────┘
```

## Diagrama de Secuencia - Flujo Exitoso

```
Cliente          Order Service       RabbitMQ        Inventory Service    Inventory DB
  │                    │                 │                   │                  │
  │  POST /orders      │                 │                   │                  │
  ├───────────────────>│                 │                   │                  │
  │                    │                 │                   │                  │
  │                    │ Save Order      │                   │                  │
  │                    │ (PENDING)       │                   │                  │
  │                    │                 │                   │                  │
  │  201 Created       │                 │                   │                  │
  │<───────────────────│                 │                   │                  │
  │  orderId, PENDING  │                 │                   │                  │
  │                    │                 │                   │                  │
  │                    │ Publish         │                   │                  │
  │                    │ OrderCreated    │                   │                  │
  │                    ├────────────────>│                   │                  │
  │                    │                 │                   │                  │
  │                    │                 │ Consume           │                  │
  │                    │                 │ OrderCreated      │                  │
  │                    │                 ├──────────────────>│                  │
  │                    │                 │                   │                  │
  │                    │                 │                   │ Check Stock      │
  │                    │                 │                   ├─────────────────>│
  │                    │                 │                   │                  │
  │                    │                 │                   │ Stock Available  │
  │                    │                 │                   │<─────────────────│
  │                    │                 │                   │                  │
  │                    │                 │                   │ Reserve Stock    │
  │                    │                 │                   ├─────────────────>│
  │                    │                 │                   │                  │
  │                    │                 │                   │ Success          │
  │                    │                 │                   │<─────────────────│
  │                    │                 │                   │                  │
  │                    │                 │   Publish         │                  │
  │                    │                 │   StockReserved   │                  │
  │                    │                 │<──────────────────│                  │
  │                    │                 │                   │                  │
  │                    │ Consume         │                   │                  │
  │                    │ StockReserved   │                   │                  │
  │                    │<────────────────│                   │                  │
  │                    │                 │                   │                  │
  │                    │ Update Order    │                   │                  │
  │                    │ (CONFIRMED)     │                   │                  │
  │                    │                 │                   │                  │
  │  GET /orders/{id}  │                 │                   │                  │
  ├───────────────────>│                 │                   │                  │
  │                    │                 │                   │                  │
  │  200 OK            │                 │                   │                  │
  │  status: CONFIRMED │                 │                   │                  │
  │<───────────────────│                 │                   │                  │
```

## Diagrama de Secuencia - Flujo Fallido (Stock Insuficiente)

```
Cliente          Order Service       RabbitMQ        Inventory Service    Inventory DB
  │                    │                 │                   │                  │
  │  POST /orders      │                 │                   │                  │
  ├───────────────────>│                 │                   │                  │
  │                    │                 │                   │                  │
  │                    │ Save Order      │                   │                  │
  │                    │ (PENDING)       │                   │                  │
  │                    │                 │                   │                  │
  │  201 Created       │                 │                   │                  │
  │<───────────────────│                 │                   │                  │
  │  orderId, PENDING  │                 │                   │                  │
  │                    │                 │                   │                  │
  │                    │ Publish         │                   │                  │
  │                    │ OrderCreated    │                   │                  │
  │                    ├────────────────>│                   │                  │
  │                    │                 │                   │                  │
  │                    │                 │ Consume           │                  │
  │                    │                 │ OrderCreated      │                  │
  │                    │                 ├──────────────────>│                  │
  │                    │                 │                   │                  │
  │                    │                 │                   │ Check Stock      │
  │                    │                 │                   ├─────────────────>│
  │                    │                 │                   │                  │
  │                    │                 │                   │ Insufficient     │
  │                    │                 │                   │<─────────────────│
  │                    │                 │                   │                  │
  │                    │                 │   Publish         │                  │
  │                    │                 │   StockRejected   │                  │
  │                    │                 │<──────────────────│                  │
  │                    │                 │                   │                  │
  │                    │ Consume         │                   │                  │
  │                    │ StockRejected   │                   │                  │
  │                    │<────────────────│                   │                  │
  │                    │                 │                   │                  │
  │                    │ Update Order    │                   │                  │
  │                    │ (CANCELLED)     │                   │                  │
  │                    │                 │                   │                  │
  │  GET /orders/{id}  │                 │                   │                  │
  ├───────────────────>│                 │                   │                  │
  │                    │                 │                   │                  │
  │  200 OK            │                 │                   │                  │
  │  status: CANCELLED │                 │                   │                  │
  │  reason: "..."     │                 │                   │                  │
  │<───────────────────│                 │                   │                  │
```

## Modelo de Datos

### Order Service Database

```sql
-- Orders Table
CREATE TABLE orders (
    order_id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,  -- PENDING, CONFIRMED, CANCELLED
    country VARCHAR(100),
    city VARCHAR(100),
    street VARCHAR(255),
    postal_code VARCHAR(20),
    payment_reference VARCHAR(255),
    cancellation_reason TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    item_id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(order_id),
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Inventory Service Database

```sql
-- Products Stock Table
CREATE TABLE products_stock (
    product_id UUID PRIMARY KEY,
    available_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_stock_updated_at ON products_stock(updated_at);
```

## Estructura de Eventos

### OrderCreated Event
```json
{
  "eventType": "OrderCreated",
  "orderId": "uuid",
  "correlationId": "uuid",
  "createdAt": "ISO 8601 timestamp",
  "items": [
    {
      "productId": "uuid",
      "quantity": "integer"
    }
  ]
}
```

### StockReserved Event
```json
{
  "eventType": "StockReserved",
  "orderId": "uuid",
  "correlationId": "uuid",
  "reservedItems": [
    {
      "productId": "uuid",
      "quantity": "integer"
    }
  ],
  "reservedAt": "ISO 8601 timestamp"
}
```

### StockRejected Event
```json
{
  "eventType": "StockRejected",
  "orderId": "uuid",
  "correlationId": "uuid",
  "reason": "string",
  "rejectedAt": "ISO 8601 timestamp"
}
```

## Configuración RabbitMQ

```
Exchange: ecommerce.events
Type: topic
Durable: true

Queue: order.created
  - Binding: order.created → ecommerce.events
  - Consumer: Inventory Service
  
Queue: stock.response
  - Binding: stock.reserved → ecommerce.events
  - Binding: stock.rejected → ecommerce.events
  - Consumer: Order Service
```

## Patrones de Diseño Implementados

### 1. Repository Pattern
- Abstracción de acceso a datos
- Interfaces: `IProductStockRepository`, `OrderRepository`
- Implementaciones: `PostgresProductStockRepository`

### 2. Service Layer Pattern
- Lógica de negocio encapsulada
- `OrderService`, `InventoryService`

### 3. Dependency Injection
- Constructor injection
- IoC container (Spring, Node.js)

### 4. Event-Driven Architecture
- Comunicación asíncrona
- Desacoplamiento de servicios
- Publisher/Subscriber pattern

### 5. DTO Pattern
- Transferencia de datos entre capas
- `CreateOrderRequest`, `OrderResponse`

### 6. Builder Pattern
- Construcción de objetos complejos
- Lombok `@Builder`, TypeScript builders

### 7. Singleton Pattern
- Conexiones de base de datos
- Conexiones RabbitMQ

## Principios SOLID en la Práctica

### Single Responsibility (SRP)
```
✓ OrderController - Solo maneja HTTP
✓ OrderService - Solo lógica de negocio
✓ OrderRepository - Solo persistencia
✓ RabbitMQEventPublisher - Solo publicación de eventos
```

### Open/Closed (OCP)
```
✓ Nuevos tipos de eventos sin modificar código
✓ Nuevas implementaciones de repositorio
✓ Extensible mediante interfaces
```

### Liskov Substitution (LSP)
```
✓ IProductStockRepository puede ser sustituido
✓ Cualquier implementación funciona
✓ Contratos bien definidos
```

### Interface Segregation (ISP)
```
✓ IEventPublisher - Solo eventos
✓ IProductStockRepository - Solo stock
✓ Interfaces específicas y cohesivas
```

### Dependency Inversion (DIP)
```
✓ Servicios dependen de interfaces
✓ No dependen de implementaciones concretas
✓ Inyección de dependencias
```

## Escalabilidad

### Horizontal Scaling

```
Load Balancer
      │
      ├──> Order Service Instance 1
      ├──> Order Service Instance 2
      └──> Order Service Instance 3
                │
                ▼
           RabbitMQ (with clustering)
                │
                ▼
      ├──> Inventory Service Instance 1
      ├──> Inventory Service Instance 2
      └──> Inventory Service Instance 3
```

### Características de Escalabilidad

- ✓ Servicios stateless
- ✓ RabbitMQ gestiona distribución de carga
- ✓ Bases de datos independientes
- ✓ Sin acoplamiento temporal
- ✓ Idempotencia en consumidores

## Resiliencia y Tolerancia a Fallos

### Mecanismos Implementados

1. **Message Acknowledgment**
   - ACK solo después de procesamiento exitoso
   - NACK para reintentos

2. **Transacciones de Base de Datos**
   - Operaciones atómicas
   - Rollback automático en errores

3. **Timeouts y Retries**
   - Configurables en RabbitMQ
   - Dead Letter Queues (opcional)

4. **Health Checks**
   - Endpoints de salud
   - Monitoreo de servicios

5. **Logging Estructurado**
   - Trazabilidad completa
   - Correlation IDs
