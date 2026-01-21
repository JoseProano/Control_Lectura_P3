# 🧪 Guía Completa de Pruebas - Sistema E-commerce Microservicios

## 📋 Checklist de Validación

### ✅ Pre-requisitos
- [ ] Docker Desktop corriendo
- [ ] Todos los contenedores levantados (`docker ps`)
- [ ] Postman instalado (o usar curl)
- [ ] Navegador web para RabbitMQ Management

---

## 🚀 PASO 1: Verificar que todos los servicios están corriendo

```powershell
# Ver estado de contenedores
cd "D:\Escritorio\Clases\Aplicaciones Distribuidas\ControlLecturaP3\infrastructure"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Resultado esperado:**
```
NAMES                STATUS                 PORTS
rabbitmq-ecommerce   Up (healthy)          0.0.0.0:5673->5672/tcp, 0.0.0.0:15673->15672/tcp
order-service        Up                    0.0.0.0:8080->8080/tcp
inventory-service    Up                    0.0.0.0:3000->3000/tcp
order-db             Up (healthy)          0.0.0.0:5432->5432/tcp
inventory-db         Up (healthy)          0.0.0.0:5433->5432/tcp
```

---

## 🏪 PASO 2: Verificar Inventory Service

### 2.1 Health Check
```powershell
curl http://localhost:3000/api/v1/health
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "service": "Inventory Service"
}
```

### 2.2 Consultar Stock Inicial (Endpoint del documento: GET /api/v1/products/{productId}/stock)

**Producto 1:** (100 unidades disponibles)
```powershell
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

**Resultado esperado:**
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 100,
  "reservedStock": 0,
  "updatedAt": "2026-01-21T..."
}
```

**Producto 2:** (50 unidades disponibles)
```powershell
curl http://localhost:3000/api/v1/products/b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f/stock
```

**Producto 3:** (25 unidades disponibles)
```powershell
curl http://localhost:3000/api/v1/products/c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f/stock
```

---

## 📦 PASO 3: Crear Pedido con Stock Suficiente

### 3.1 Crear el pedido (Endpoint del documento: POST /api/v1/orders)

**En Postman:**
```
POST http://localhost:8080/api/v1/orders
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": "d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a",
  "customerName": "Juan Perez",
  "customerEmail": "juan.perez@example.com",
  "paymentReference": "PAY-2026-001",
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2,
      "unitPrice": 29.99
    }
  ],
  "shippingAddress": {
    "street": "Av Amazonas N34-451",
    "city": "Quito",
    "state": "Pichincha",
    "postalCode": "170515",
    "country": "Ecuador"
  }
}
```

**Resultado esperado (HTTP 201):**
```json
{
  "orderId": "abc12345-6789-...",
  "status": "PENDING",
  "customerName": "Juan Perez",
  "customerEmail": "juan.perez@example.com",
  "totalAmount": 59.98,
  "items": [
    {
      "itemId": "...",
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2,
      "unitPrice": 29.99,
      "subtotal": 59.98
    }
  ],
  "shippingAddress": {
    "street": "Av Amazonas N34-451",
    "city": "Quito",
    "state": "Pichincha",
    "postalCode": "170515",
    "country": "Ecuador"
  },
  "createdAt": "2026-01-21T..."
}
```

### 3.2 ⚠️ **IMPORTANTE: Copiar el orderId**
Guarda el UUID del `orderId` que te devuelve la respuesta, por ejemplo:
```
abc12345-6789-4def-gh12-ijklmnopqrst
```

---

## 🐰 PASO 4: Verificar RabbitMQ (Mensajería Asíncrona)

### 4.1 Acceder al Panel de RabbitMQ Management

1. Abre tu navegador
2. Ve a: **http://localhost:15673**
3. Login:
   - **Usuario:** `admin`
   - **Password:** `admin123`

### 4.2 Verificar Exchange (Punto de entrada de mensajes)

1. Click en la pestaña **"Exchanges"**
2. Busca: **`ecommerce.events`**
3. Verifica:
   - **Type:** `topic`
   - **Durability:** `Durable`
   - **Auto delete:** `No`

### 4.3 Verificar Colas (Queues)

1. Click en la pestaña **"Queues and Streams"**
2. Deberías ver 2 colas:

**Cola 1: order.created**
- **Messages ready:** 0 (si el Inventory Service ya procesó)
- **Messages unacked:** 0
- **Total:** Puede mostrar el historial de mensajes procesados

**Cola 2: stock.response**
- **Messages ready:** 0 (si el Order Service ya procesó)
- **Total:** Mensajes de respuesta procesados

### 4.4 Ver el contenido de los mensajes (Opcional)

**Para ver mensajes en la cola:**
1. Click en el nombre de la cola (ej: `order.created`)
2. Ve a la sección **"Get messages"**
3. Configura:
   - **Messages:** 1
   - **Ack mode:** Automatic ack
4. Click **"Get Message(s)"**

**Mensaje esperado (OrderCreated):**
```json
{
  "eventType": "OrderCreated",
  "orderId": "abc12345-...",
  "correlationId": "abc12345-...",
  "createdAt": "2026-01-21T...",
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2
    }
  ]
}
```

### 4.5 Verificar Bindings (Enrutamiento)

1. Click en **"Exchanges"** → `ecommerce.events`
2. Scroll down a **"Bindings"**
3. Deberías ver:
   ```
   To queue: order.created      Routing key: order.created
   To queue: stock.response     Routing key: stock.reserved
   To queue: stock.response     Routing key: stock.rejected
   ```

---

## 📊 PASO 5: Consultar el Estado del Pedido (Debe estar CONFIRMED)

### 5.1 Esperar 2-3 segundos

El procesamiento asíncrono toma unos segundos:
1. Order Service → Publica `OrderCreated`
2. Inventory Service → Consume, verifica stock, publica `StockReserved`
3. Order Service → Consume, actualiza pedido a `CONFIRMED`

### 5.2 Consultar pedido (Endpoint del documento: GET /api/v1/orders/{orderId})

```powershell
# Reemplaza {orderId} con el UUID que copiaste en el paso 3.2
curl http://localhost:8080/api/v1/orders/{orderId}
```

**Ejemplo:**
```powershell
curl http://localhost:8080/api/v1/orders/abc12345-6789-4def-gh12-ijklmnopqrst
```

**Resultado esperado (HTTP 200):**
```json
{
  "orderId": "abc12345-...",
  "status": "CONFIRMED",  ← ✅ CAMBIÓ DE PENDING A CONFIRMED
  "customerName": "Juan Perez",
  "customerEmail": "juan.perez@example.com",
  "totalAmount": 59.98,
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2,
      "unitPrice": 29.99,
      "subtotal": 59.98
    }
  ],
  "shippingAddress": {...},
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."  ← Timestamp de actualización
}
```

### 5.3 Verificar que el stock se redujo

```powershell
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

**Resultado esperado:**
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 98,      ← ✅ SE REDUJO DE 100 A 98
  "reservedStock": 2,        ← ✅ 2 UNIDADES RESERVADAS
  "updatedAt": "2026-01-21T..."
}
```

---

## ❌ PASO 6: Probar Pedido SIN Stock Suficiente (CANCELLED)

### 6.1 Crear pedido con cantidad mayor al stock disponible

**Body (solicita 50 unidades del Producto 3 que solo tiene 25):**
```json
{
  "customerId": "e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b",
  "customerName": "Maria Lopez",
  "customerEmail": "maria.lopez@example.com",
  "paymentReference": "PAY-2026-002",
  "items": [
    {
      "productId": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
      "quantity": 50,
      "unitPrice": 49.99
    }
  ],
  "shippingAddress": {
    "street": "Calle Garcia Moreno 123",
    "city": "Quito",
    "state": "Pichincha",
    "postalCode": "170150",
    "country": "Ecuador"
  }
}
```

**Respuesta inicial (HTTP 201):**
```json
{
  "orderId": "xyz98765-...",
  "status": "PENDING",
  ...
}
```

### 6.2 Esperar 2-3 segundos y consultar

```powershell
curl http://localhost:8080/api/v1/orders/{orderId-del-pedido-sin-stock}
```

**Resultado esperado:**
```json
{
  "orderId": "xyz98765-...",
  "status": "CANCELLED",  ← ✅ PEDIDO CANCELADO POR FALTA DE STOCK
  "customerName": "Maria Lopez",
  "reason": "Insufficient stock for product c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "items": [...],
  "updatedAt": "2026-01-21T..."
}
```

### 6.3 Verificar que el stock NO cambió

```powershell
curl http://localhost:3000/api/v1/products/c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f/stock
```

**Resultado esperado:**
```json
{
  "productId": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "availableStock": 25,  ← ✅ SE MANTIENE EN 25 (NO SE MODIFICÓ)
  "reservedStock": 0,
  "updatedAt": "2026-01-21T..."
}
```

---

## 📈 PASO 7: Probar Pedido con Múltiples Items

### 7.1 Crear pedido con 2 productos

```json
{
  "customerId": "f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f5a6b7c",
  "customerName": "Carlos Rodriguez",
  "customerEmail": "carlos.rodriguez@example.com",
  "paymentReference": "PAY-2026-003",
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 3,
      "unitPrice": 29.99
    },
    {
      "productId": "b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f",
      "quantity": 2,
      "unitPrice": 39.99
    }
  ],
  "shippingAddress": {
    "street": "Av 10 de Agosto 2345",
    "city": "Quito",
    "state": "Pichincha",
    "postalCode": "170135",
    "country": "Ecuador"
  }
}
```

### 7.2 Verificar que se procesaron ambos productos

Después de 2-3 segundos, consulta el pedido y verifica:
- `status: "CONFIRMED"`
- Los 2 items en la respuesta

Verifica el stock de ambos productos:
```powershell
# Producto 1 (debería tener 95 disponibles: 98-3)
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock

# Producto 2 (debería tener 48 disponibles: 50-2)
curl http://localhost:3000/api/v1/products/b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f/stock
```

---

## 🔍 PASO 8: Verificar Logs de los Servicios

### 8.1 Ver logs del Order Service

```powershell
docker logs order-service --tail 50
```

**Busca:**
- `Publishing OrderCreated event`
- `Received StockReserved event`
- `Order confirmed successfully`

### 8.2 Ver logs del Inventory Service

```powershell
docker logs inventory-service --tail 50
```

**Busca:**
- `Received OrderCreated event`
- `Processing order`
- `Stock reserved successfully`
- `Published StockReserved event`

---

## 📊 PASO 9: Validación de Requisitos del Documento

### ✅ Checklist de Cumplimiento

| Requisito | Estado | Cómo Validar |
|-----------|--------|--------------|
| **Order Service - POST /api/v1/orders** | ✅ | Probado en Paso 3 |
| **Order Service - GET /api/v1/orders/{orderId}** | ✅ | Probado en Paso 5 |
| **Inventory Service - GET /api/v1/products/{productId}/stock** | ✅ | Probado en Paso 2 |
| **Pedido inicial en estado PENDING** | ✅ | Respuesta inmediata del POST |
| **Evento OrderCreated publicado** | ✅ | RabbitMQ Management (Paso 4) |
| **Inventory Service consume OrderCreated** | ✅ | Logs inventory-service |
| **Evento StockReserved publicado** | ✅ | RabbitMQ Management |
| **Order Service consume StockReserved** | ✅ | Logs order-service |
| **Pedido actualizado a CONFIRMED** | ✅ | GET order después de procesamiento |
| **Stock reducido correctamente** | ✅ | GET stock muestra reducción |
| **Pedido CANCELLED si no hay stock** | ✅ | Probado en Paso 6 |
| **UUIDs en formato estándar** | ✅ | Todos los IDs son UUID |
| **RabbitMQ con exchange topic** | ✅ | Verificado en Management UI |
| **Colas separadas (order.created, stock.response)** | ✅ | Verificado en Management UI |
| **Bindings con routing keys** | ✅ | Verificado en Management UI |

---

## 🎯 PASO 10: Escenarios de Prueba Completos

### Escenario 1: ✅ Flujo Exitoso (Stock Suficiente)
1. POST order → `status: PENDING`
2. Esperar 2-3 segundos
3. GET order → `status: CONFIRMED`
4. GET stock → `availableStock` reducido

### Escenario 2: ❌ Flujo de Rechazo (Stock Insuficiente)
1. POST order con cantidad > stock disponible → `status: PENDING`
2. Esperar 2-3 segundos
3. GET order → `status: CANCELLED`
4. GET stock → `availableStock` sin cambios

### Escenario 3: 📦 Multiple Items
1. POST order con 2+ productos → `status: PENDING`
2. Esperar 2-3 segundos
3. GET order → `status: CONFIRMED` (si todos tienen stock)
4. Verificar stock de cada producto reducido

---

## 🛠️ Troubleshooting

### Problema: El pedido se queda en PENDING

**Solución:**
```powershell
# Ver logs del inventory-service
docker logs inventory-service --tail 50

# Verificar RabbitMQ
# Ir a http://localhost:15673 y ver si hay mensajes sin procesar
```

### Problema: El stock no se reduce

**Solución:**
```powershell
# Verificar que inventory-service está corriendo
docker ps | grep inventory

# Reiniciar inventory-service si es necesario
docker restart inventory-service
```

### Problema: Error 500 en Order Service

**Solución:**
```powershell
# Ver logs detallados
docker logs order-service --tail 100

# Verificar conexión a base de datos
docker logs order-db
```

---

## 📸 Evidencias para Entrega

### Capturas Recomendadas:

1. **Postman - Crear Orden (PENDING)**
   - Request POST con body
   - Response con status PENDING

2. **Postman - Consultar Orden (CONFIRMED)**
   - Request GET con orderId
   - Response con status CONFIRMED

3. **Postman - Consultar Stock Reducido**
   - Request GET stock
   - Response mostrando reducción

4. **RabbitMQ Management - Exchanges**
   - Captura de ecommerce.events

5. **RabbitMQ Management - Queues**
   - Captura de order.created y stock.response

6. **RabbitMQ Management - Bindings**
   - Captura de routing keys

7. **Logs - Order Service**
   - Terminal mostrando publicación de eventos

8. **Logs - Inventory Service**
   - Terminal mostrando consumo y procesamiento

9. **Orden Cancelada (Sin Stock)**
   - Response con status CANCELLED

10. **Docker PS**
    - Todos los contenedores corriendo

---

## 🎓 Resumen de Endpoints según Documento

### Order Service (Puerto 8080)
```
POST   /api/v1/orders              - Crear pedido (inicial PENDING)
GET    /api/v1/orders/{orderId}    - Consultar pedido (PENDING/CONFIRMED/CANCELLED)
```

### Inventory Service (Puerto 3000)
```
GET    /api/v1/health                         - Health check
GET    /api/v1/products/{productId}/stock     - Consultar stock
```

### RabbitMQ Management (Puerto 15673)
```
http://localhost:15673                        - Panel de administración
Usuario: admin / Password: admin123
```

---

## ✅ Checklist Final de Entrega

- [ ] Todos los endpoints funcionan correctamente
- [ ] Flujo asíncrono completo (PENDING → CONFIRMED/CANCELLED)
- [ ] RabbitMQ configurado con exchange y colas
- [ ] Stock se actualiza correctamente
- [ ] Capturas de pantalla tomadas
- [ ] Logs guardados
- [ ] README.md en cada servicio
- [ ] docker-compose.yml funcional
- [ ] Colección de Postman incluida

---

¡Sistema completamente funcional y listo para demostración! 🚀
