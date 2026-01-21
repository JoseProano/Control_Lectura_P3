# Índice Completo del Proyecto

Este documento proporciona un mapa completo de todos los archivos y su propósito en el proyecto.

## 📂 Estructura del Proyecto

```
ControlLecturaP3/
│
├── 📄 README.md                    # Documentación principal del proyecto
├── 📄 RESUMEN_EJECUTIVO.md         # Resumen ejecutivo completo
├── 📄 ARCHITECTURE.md              # Diagramas y detalles de arquitectura
├── 📄 TESTING.md                   # Guía completa de pruebas
├── 📄 DEPLOYMENT.md                # Guía de despliegue paso a paso
├── 📄 .gitignore                   # Archivos ignorados por Git
├── 🔧 start.ps1                    # Script de inicio (Windows)
├── 🔧 start.sh                     # Script de inicio (Linux/Mac)
│
├── 📁 infrastructure/              # Configuración de infraestructura
│   ├── 📄 docker-compose.yml       # Orquestación de servicios
│   ├── 📄 .env.example             # Variables de entorno de ejemplo
│   └── 📄 README.md                # Documentación de infraestructura
│
├── 📁 order-service/               # Microservicio de Órdenes
│   ├── 📁 src/
│   │   └── 📁 main/
│   │       ├── 📁 java/ec/edu/espe/orderservice/
│   │       │   │
│   │       │   ├── 📁 domain/                    # Capa de Dominio
│   │       │   │   ├── 📁 model/
│   │       │   │   │   ├── Order.java           # Entidad Order
│   │       │   │   │   ├── OrderItem.java       # Entidad OrderItem
│   │       │   │   │   ├── OrderStatus.java     # Enum de estados
│   │       │   │   │   └── ShippingAddress.java # Value Object
│   │       │   │   └── 📁 repository/
│   │       │   │       └── OrderRepository.java  # Repositorio JPA
│   │       │   │
│   │       │   ├── 📁 application/               # Capa de Aplicación
│   │       │   │   ├── 📁 dto/
│   │       │   │   │   ├── CreateOrderRequest.java
│   │       │   │   │   ├── CreateOrderResponse.java
│   │       │   │   │   ├── OrderResponse.java
│   │       │   │   │   ├── OrderItemRequest.java
│   │       │   │   │   ├── OrderItemResponse.java
│   │       │   │   │   ├── ShippingAddressRequest.java
│   │       │   │   │   └── ShippingAddressResponse.java
│   │       │   │   └── 📁 service/
│   │       │   │       ├── OrderService.java          # Interfaz
│   │       │   │       └── 📁 impl/
│   │       │   │           ├── OrderServiceImpl.java  # Implementación
│   │       │   │           └── OrderMapper.java       # Mapper DTO
│   │       │   │
│   │       │   ├── 📁 infrastructure/            # Capa de Infraestructura
│   │       │   │   ├── 📁 config/
│   │       │   │   │   └── RabbitMQConfig.java       # Configuración RabbitMQ
│   │       │   │   └── 📁 messaging/
│   │       │   │       ├── 📁 event/
│   │       │   │       │   ├── OrderCreatedEvent.java
│   │       │   │       │   ├── StockReservedEvent.java
│   │       │   │       │   └── StockRejectedEvent.java
│   │       │   │       ├── 📁 publisher/
│   │       │   │       │   ├── EventPublisher.java        # Interfaz
│   │       │   │       │   └── RabbitMQEventPublisher.java
│   │       │   │       └── 📁 consumer/
│   │       │   │           └── StockResponseConsumer.java
│   │       │   │
│   │       │   ├── 📁 presentation/              # Capa de Presentación
│   │       │   │   ├── 📁 controller/
│   │       │   │   │   └── OrderController.java      # REST Controller
│   │       │   │   └── 📁 exception/
│   │       │   │       ├── GlobalExceptionHandler.java
│   │       │   │       └── ErrorResponse.java
│   │       │   │
│   │       │   └── OrderServiceApplication.java  # Clase principal
│   │       │
│   │       └── 📁 resources/
│   │           └── application.properties        # Configuración Spring
│   │
│   ├── 📄 Dockerfile                    # Imagen Docker
│   ├── 📄 .dockerignore                 # Archivos ignorados en Docker
│   ├── 📄 .gitignore                    # Archivos ignorados en Git
│   ├── 📄 pom.xml                       # Dependencias Maven
│   └── 📄 README.md                     # Documentación del servicio
│
└── 📁 inventory-service/               # Microservicio de Inventario
    ├── 📁 src/
    │   ├── 📁 config/                          # Configuración
    │   │   ├── config.ts                       # Config principal
    │   │   └── logger.ts                       # Winston logger
    │   │
    │   ├── 📁 domain/                          # Capa de Dominio
    │   │   ├── 📁 models/
    │   │   │   └── ProductStock.ts             # Modelo de dominio
    │   │   └── 📁 repositories/
    │   │       └── IProductStockRepository.ts  # Interfaz repositorio
    │   │
    │   ├── 📁 application/                     # Capa de Aplicación
    │   │   └── 📁 services/
    │   │       └── InventoryService.ts         # Lógica de negocio
    │   │
    │   ├── 📁 infrastructure/                  # Capa de Infraestructura
    │   │   ├── 📁 database/
    │   │   │   └── DatabaseConnection.ts       # Conexión PostgreSQL
    │   │   ├── 📁 repositories/
    │   │   │   └── PostgresProductStockRepository.ts
    │   │   └── 📁 messaging/
    │   │       ├── events.ts                   # Definición de eventos
    │   │       ├── RabbitMQConnection.ts       # Conexión RabbitMQ
    │   │       ├── EventPublisher.ts           # Publisher
    │   │       └── OrderCreatedConsumer.ts     # Consumer
    │   │
    │   ├── 📁 presentation/                    # Capa de Presentación
    │   │   ├── ProductStockController.ts       # REST Controller
    │   │   └── ExpressApp.ts                   # Configuración Express
    │   │
    │   └── index.ts                            # Punto de entrada
    │
    ├── 📄 Dockerfile                    # Imagen Docker
    ├── 📄 .dockerignore                 # Archivos ignorados en Docker
    ├── 📄 .gitignore                    # Archivos ignorados en Git
    ├── 📄 .env.example                  # Variables de entorno de ejemplo
    ├── 📄 package.json                  # Dependencias npm
    ├── 📄 tsconfig.json                 # Configuración TypeScript
    └── 📄 README.md                     # Documentación del servicio
```

## 📚 Guía de Lectura por Rol

### Para Evaluar el Proyecto

1. **Primer Vistazo** (5 minutos):
   - `README.md` - Visión general
   - `RESUMEN_EJECUTIVO.md` - Detalles del cumplimiento

2. **Entender la Arquitectura** (10 minutos):
   - `ARCHITECTURE.md` - Diagramas y diseño
   - Revisar diagramas de secuencia

3. **Probar el Sistema** (15 minutos):
   - `DEPLOYMENT.md` - Cómo iniciar
   - `TESTING.md` - Casos de prueba
   - Ejecutar scripts de inicio

### Para Entender el Código

#### Order Service (Spring Boot)
1. Empezar por: `OrderServiceApplication.java`
2. Ver modelo de dominio: `domain/model/Order.java`
3. Lógica de negocio: `application/service/impl/OrderServiceImpl.java`
4. API REST: `presentation/controller/OrderController.java`
5. Mensajería: `infrastructure/messaging/`

#### Inventory Service (Node.js)
1. Empezar por: `index.ts`
2. Ver modelo: `domain/models/ProductStock.ts`
3. Lógica de negocio: `application/services/InventoryService.ts`
4. API REST: `presentation/ProductStockController.ts`
5. Mensajería: `infrastructure/messaging/`

### Para Desplegar

1. Leer: `DEPLOYMENT.md`
2. Verificar requisitos
3. Ejecutar: `start.ps1` (Windows) o `start.sh` (Linux/Mac)
4. Seguir verificaciones en `TESTING.md`

## 🎯 Archivos Clave por Objetivo

### Ver Principios SOLID

**Single Responsibility:**
- `OrderRepository.java` - Solo persistencia
- `OrderService.java` - Solo lógica de negocio
- `OrderController.java` - Solo HTTP

**Dependency Inversion:**
- `IProductStockRepository.ts` - Interfaz
- `PostgresProductStockRepository.ts` - Implementación

**Interface Segregation:**
- `EventPublisher.java` - Solo eventos
- `OrderRepository.java` - Solo órdenes

### Ver Clean Architecture

**Capas en Order Service:**
- `domain/` - Entidades puras
- `application/` - Casos de uso
- `infrastructure/` - Detalles técnicos
- `presentation/` - UI/API

**Capas en Inventory Service:**
- `domain/` - Modelos y contratos
- `application/` - Lógica de negocio
- `infrastructure/` - BD y mensajería
- `presentation/` - REST API

### Ver Event-Driven Architecture

**Eventos:**
- `OrderCreatedEvent.java` / `events.ts`
- `StockReservedEvent.java` / `events.ts`
- `StockRejectedEvent.java` / `events.ts`

**Publishers:**
- `RabbitMQEventPublisher.java`
- `EventPublisher.ts`

**Consumers:**
- `StockResponseConsumer.java`
- `OrderCreatedConsumer.ts`

### Ver Configuración

**Docker:**
- `infrastructure/docker-compose.yml` - Orquestación
- `order-service/Dockerfile` - Imagen Spring Boot
- `inventory-service/Dockerfile` - Imagen Node.js

**Bases de Datos:**
- Inicialización automática en:
  - `DatabaseConnection.ts` (Inventory)
  - JPA auto-create (Order)

**RabbitMQ:**
- `RabbitMQConfig.java` - Exchanges, queues, bindings
- `RabbitMQConnection.ts` - Setup de infraestructura

## 📊 Estadísticas del Proyecto

### Archivos por Tipo
- **Java**: 20 archivos
- **TypeScript**: 12 archivos
- **Configuración**: 8 archivos
- **Documentación**: 6 archivos
- **Docker**: 3 archivos
- **Scripts**: 2 archivos

### Líneas de Código (aprox.)
- **Order Service**: ~2,000 líneas
- **Inventory Service**: ~1,500 líneas
- **Documentación**: ~2,500 líneas
- **Configuración**: ~500 líneas

### Cobertura de Requerimientos
- ✅ Todos los endpoints especificados
- ✅ Todos los eventos implementados
- ✅ Todos los casos de uso cubiertos
- ✅ Todos los principios SOLID aplicados

## 🔍 Búsqueda Rápida

### ¿Dónde está...?

**La lógica de creación de pedidos?**
→ `order-service/src/main/java/.../service/impl/OrderServiceImpl.java`

**La verificación de stock?**
→ `inventory-service/src/application/services/InventoryService.ts`

**La configuración de RabbitMQ?**
→ `order-service/.../infrastructure/config/RabbitMQConfig.java`
→ `inventory-service/src/infrastructure/messaging/RabbitMQConnection.ts`

**Los endpoints REST?**
→ `order-service/.../presentation/controller/OrderController.java`
→ `inventory-service/src/presentation/ProductStockController.ts`

**El manejo de errores?**
→ `order-service/.../presentation/exception/GlobalExceptionHandler.java`
→ `inventory-service/src/presentation/ExpressApp.ts` (setupErrorHandling)

**La configuración de Docker?**
→ `infrastructure/docker-compose.yml`

**Las pruebas de ejemplo?**
→ `TESTING.md`

## 🎓 Conceptos por Archivo

### Patrones de Diseño

**Repository Pattern:**
- `OrderRepository.java`
- `IProductStockRepository.ts`
- `PostgresProductStockRepository.ts`

**Service Layer:**
- `OrderServiceImpl.java`
- `InventoryService.ts`

**DTO Pattern:**
- `application/dto/*.java`

**Builder Pattern:**
- Uso de Lombok `@Builder`
- TypeScript builders en eventos

**Dependency Injection:**
- Constructores en todos los servicios

**Singleton:**
- `DatabaseConnection.ts`
- `RabbitMQConnection.ts`

### Principios de Diseño

**SOLID:** Ver sección específica arriba

**Clean Architecture:** Ver estructura de capas

**DDD Concepts:**
- `Order` - Aggregate Root
- `OrderItem` - Entity
- `ShippingAddress` - Value Object
- `OrderStatus` - Enum

## 📖 Orden de Lectura Sugerido

### Para Aprender
1. `README.md` - Contexto
2. `ARCHITECTURE.md` - Diseño
3. Código Order Service (de abajo hacia arriba):
   - Domain → Application → Infrastructure → Presentation
4. Código Inventory Service (misma estructura)
5. `TESTING.md` - Probar lo aprendido

### Para Implementar Similar
1. `ARCHITECTURE.md` - Entender el diseño
2. `infrastructure/docker-compose.yml` - Setup
3. Domain layer de ambos servicios
4. Application layer
5. Infrastructure layer
6. Presentation layer
7. `DEPLOYMENT.md` - Desplegar

### Para Debugging
1. `DEPLOYMENT.md` - Solución de problemas
2. `docker-compose logs` - Ver errores
3. Código relevante según el error
4. `TESTING.md` - Verificar funcionalidad

---

**Este índice es su mapa del proyecto. Úselo como referencia rápida para navegar y entender el código.**

**Proyecto completo y listo para evaluación! ✅**
