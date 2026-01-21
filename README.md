# E-commerce Microservices Architecture
## Control de Lectura - Aplicaciones Distribuidas

**Universidad de las Fuerzas Armadas ESPE**  
**Profesor**: Geovanny Cudco  
**Fecha**: 21 de enero de 2026

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Principios SOLID Aplicados](#principios-solid-aplicados)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Instalación y Ejecución](#instalación-y-ejecución)
7. [Endpoints API](#endpoints-api)
8. [Flujo de Eventos](#flujo-de-eventos)
9. [Casos de Uso](#casos-de-uso)
10. [Pruebas](#pruebas)

---

## 🎯 Descripción General

Sistema de e-commerce basado en arquitectura de microservicios que implementa comunicación asíncrona mediante RabbitMQ para el procesamiento de pedidos e inventario.

### Objetivos

- ✅ Implementar microservicios independientes y desacoplados
- ✅ Comunicación asíncrona tolerante a fallos
- ✅ Escalabilidad horizontal
- ✅ Aplicación de principios SOLID
- ✅ Contenedorización con Docker

---

## 🏗️ Arquitectura

### Componentes del Sistema

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Cliente   │────────▶│ Order Service│────────▶│   RabbitMQ      │
│   (HTTP)    │         │ (Spring Boot)│         │  (Message Broker)│
└─────────────┘         └──────────────┘         └─────────────────┘
                               │                          │
                               │                          │
                               ▼                          ▼
                        ┌──────────────┐         ┌─────────────────┐
                        │  PostgreSQL  │         │Inventory Service│
                        │  (Order DB)  │         │   (Node.js)     │
                        └──────────────┘         └─────────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │  PostgreSQL  │
                                                  │(Inventory DB)│
                                                  └──────────────┘
```

### Flujo de Eventos

1. **Cliente** → POST `/api/v1/orders` → **Order Service**
2. **Order Service** → Crea pedido (PENDING) → Base de datos
3. **Order Service** → Publica `OrderCreated` → **RabbitMQ**
4. **Inventory Service** ← Consume `OrderCreated` ← **RabbitMQ**
5. **Inventory Service** → Verifica stock → Base de datos
6. **Inventory Service** → Publica `StockReserved` o `StockRejected` → **RabbitMQ**
7. **Order Service** ← Consume respuesta ← **RabbitMQ**
8. **Order Service** → Actualiza pedido (CONFIRMED/CANCELLED)

---

## 🛠️ Tecnologías Utilizadas

### Order Service
- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data JPA**
- **Spring AMQP (RabbitMQ)**
- **PostgreSQL**
- **Maven**
- **Lombok**

### Inventory Service
- **Node.js 20**
- **TypeScript 5**
- **Express.js**
- **PostgreSQL (pg)**
- **amqplib (RabbitMQ)**
- **Winston (logging)**

### Infraestructura
- **Docker & Docker Compose**
- **RabbitMQ 3.12**
- **PostgreSQL 15**

---

## 💡 Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- Cada clase tiene una única responsabilidad
- **Ejemplo**: `OrderRepository` solo maneja persistencia de órdenes
- `RabbitMQEventPublisher` solo publica eventos

### 2. Open/Closed Principle (OCP)
- Abierto para extensión, cerrado para modificación
- **Ejemplo**: Eventos extensibles sin modificar código existente
- Nuevos tipos de eventos se agregan fácilmente

### 3. Liskov Substitution Principle (LSP)
- Las implementaciones pueden sustituir interfaces
- **Ejemplo**: `PostgresProductStockRepository` implementa `IProductStockRepository`
- Cualquier implementación del repositorio es intercambiable

### 4. Interface Segregation Principle (ISP)
- Interfaces específicas para cada funcionalidad
- **Ejemplo**: `IEventPublisher` vs `IProductStockRepository`
- No se obliga a implementar métodos innecesarios

### 5. Dependency Inversion Principle (DIP)
- Dependencias de abstracciones, no de concreciones
- **Ejemplo**: Servicios dependen de interfaces, no de implementaciones concretas
- Inyección de dependencias en constructores

---

## 📁 Estructura del Proyecto

```
ControlLecturaP3/
├── order-service/                 # Microservicio de órdenes
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── ec/edu/espe/orderservice/
│   │       │       ├── domain/           # Entidades y repositorios
│   │       │       ├── application/      # DTOs y servicios
│   │       │       ├── infrastructure/   # RabbitMQ, configuración
│   │       │       └── presentation/     # Controladores REST
│   │       └── resources/
│   ├── Dockerfile
│   ├── pom.xml
│   └── README.md
│
├── inventory-service/             # Microservicio de inventario
│   ├── src/
│   │   ├── config/               # Configuración
│   │   ├── domain/               # Modelos y repositorios
│   │   ├── application/          # Servicios de negocio
│   │   ├── infrastructure/       # Base de datos, RabbitMQ
│   │   └── presentation/         # Controladores HTTP
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── infrastructure/                # Infraestructura Docker
    ├── docker-compose.yml
    ├── .env.example
    └── README.md
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Docker Desktop instalado
- Puertos disponibles: 8080, 3000, 5672, 15672, 5432, 5433

### Inicio Rápido

1. **Clonar el repositorio**
   ```bash
   cd ControlLecturaP3
   ```

2. **Navegar a infrastructure**
   ```bash
   cd infrastructure
   ```

3. **Iniciar todos los servicios**
   ```bash
   docker-compose up -d
   ```

4. **Verificar estado**
   ```bash
   docker-compose ps
   ```

5. **Ver logs**
   ```bash
   docker-compose logs -f
   ```

### Acceso a Servicios

- **Order Service API**: http://localhost:8080/api/v1
- **Inventory Service API**: http://localhost:3000/api/v1
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)

### Detener Servicios

```bash
docker-compose down
```

### Reconstruir Servicios

```bash
docker-compose up -d --build
```

---

## 📡 Endpoints API

### Order Service (Puerto 8080)

#### 1. Crear Pedido

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

#### 2. Consultar Pedido

**GET** `/api/v1/orders/{orderId}`

**Response - Confirmado:**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "status": "CONFIRMED",
  "items": [...],
  "updatedAt": "2026-01-21T15:10:02Z"
}
```

**Response - Cancelado:**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "status": "CANCELLED",
  "reason": "Insufficient stock for product ...",
  "items": [...],
  "updatedAt": "2026-01-21T15:10:02Z"
}
```

### Inventory Service (Puerto 3000)

#### Consultar Stock

**GET** `/api/v1/products/{productId}/stock`

**Response:**
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 25,
  "reservedStock": 3,
  "updatedAt": "2026-01-21T15:08:10Z"
}
```

---

## 🔄 Flujo de Eventos

### Eventos RabbitMQ

#### 1. OrderCreated
```json
{
  "eventType": "OrderCreated",
  "orderId": "uuid",
  "correlationId": "uuid",
  "createdAt": "2026-01-21T10:32:15Z",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
}
```

#### 2. StockReserved
```json
{
  "eventType": "StockReserved",
  "orderId": "uuid",
  "correlationId": "uuid",
  "reservedItems": [...],
  "reservedAt": "2026-01-21T10:32:17Z"
}
```

#### 3. StockRejected
```json
{
  "eventType": "StockRejected",
  "orderId": "uuid",
  "correlationId": "uuid",
  "reason": "Insufficient stock for product ...",
  "rejectedAt": "2026-01-21T10:32:17Z"
}
```

---

## 📝 Casos de Uso

### Caso 1: Pedido Exitoso (Stock Suficiente)

1. **Crear pedido**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/orders \
     -H "Content-Type: application/json" \
     -d '{
       "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
       "items": [
         {
           "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
           "quantity": 2
         }
       ],
       "shippingAddress": {
         "country": "EC",
         "city": "Quito",
         "street": "Av. Amazonas",
         "postalCode": "170135"
       },
       "paymentReference": "pay_abc123"
     }'
   ```

2. **Consultar pedido** (esperar 2-3 segundos):
   ```bash
   curl http://localhost:8080/api/v1/orders/{orderId}
   ```

   **Resultado**: Status `CONFIRMED`

### Caso 2: Pedido Rechazado (Stock Insuficiente)

1. **Crear pedido con cantidad grande**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/orders \
     -H "Content-Type: application/json" \
     -d '{
       "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
       "items": [
         {
           "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
           "quantity": 200
         }
       ],
       "shippingAddress": {
         "country": "EC",
         "city": "Quito",
         "street": "Av. Amazonas",
         "postalCode": "170135"
       },
       "paymentReference": "pay_abc123"
     }'
   ```

2. **Consultar pedido**:
   ```bash
   curl http://localhost:8080/api/v1/orders/{orderId}
   ```

   **Resultado**: Status `CANCELLED` con razón

### Caso 3: Verificar Stock Actual

```bash
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

---

## 🧪 Pruebas

### Productos de Prueba

El sistema incluye 3 productos precargados:

1. **UUID**: `a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d` - Stock: 100
2. **UUID**: `b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f` - Stock: 50
3. **UUID**: `c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f` - Stock: 75

### Customer ID de Prueba

- `9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e`

### Verificar RabbitMQ

1. Acceder a: http://localhost:15672
2. Usuario: `admin`, Password: `admin123`
3. Ver exchanges y colas en la pestaña "Queues"

---

## 🎓 Conclusiones

Este proyecto demuestra:

✅ **Arquitectura de Microservicios**: Servicios independientes y desacoplados  
✅ **Comunicación Asíncrona**: RabbitMQ para tolerancia a fallos  
✅ **Principios SOLID**: Código mantenible y extensible  
✅ **Escalabilidad**: Diseño preparado para escala horizontal  
✅ **Contenedorización**: Despliegue simplificado con Docker  
✅ **Event-Driven Architecture**: Flujo basado en eventos

---

## 👥 Autores

José Proaño
Darwin Panchez
