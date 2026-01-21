# 🚀 GUÍA RÁPIDA DE VERIFICACIÓN - RabbitMQ y Sistema

## 📋 PASOS PARA VERIFICAR TODO

### 1. VERIFICAR QUE DOCKER ESTÉ CORRIENDO

```powershell
cd "d:\Escritorio\Clases\Aplicaciones Distribuidas\ControlLecturaP3\infrastructure"
docker compose ps
```

**Debe mostrar:**
```
NAME                  STATUS
order-service         Up (healthy)
inventory-service     Up (healthy)
rabbitmq-ecommerce    Up (healthy)
order-db              Up
inventory-db          Up
```

Si no están corriendo:
```powershell
docker compose up -d
```

---

### 2. VERIFICAR RABBITMQ MANAGEMENT UI

**Abrir navegador:**
```
http://localhost:15673
```

**Login:**
- Usuario: `admin`
- Password: `admin123`

**Qué verificar:**

#### A. Exchange (Pestaña "Exchanges")
- Click en `ecommerce.events`
- Tipo: `topic`
- Durability: `Durable`
- En "Bindings" ver las rutas configuradas

#### B. Queues (Pestaña "Queues")
1. **Queue: order.created**
   - Binding: `order.created` → exchange `ecommerce.events`
   - Consumida por: Inventory Service
   
2. **Queue: stock.response**
   - Bindings: 
     - `stock.reserved` → exchange `ecommerce.events`
     - `stock.rejected` → exchange `ecommerce.events`
   - Consumida por: Order Service

#### C. Mensajes (En cada Queue)
- Click en una queue → sección "Get messages"
- Click "Get Message(s)" para ver mensajes

**Ejemplo de mensaje OrderCreated:**
```json
{
  "eventType": "OrderCreated",
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "correlationId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "createdAt": "2026-01-21T15:30:45.123Z",
  "items": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2
    }
  ]
}
```

**Ejemplo de mensaje StockReserved:**
```json
{
  "eventType": "StockReserved",
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "correlationId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "reservedItems": [
    {
      "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
      "quantity": 2
    }
  ],
  "reservedAt": 1737468650
}
```

**Ejemplo de mensaje StockRejected:**
```json
{
  "eventType": "StockRejected",
  "orderId": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "correlationId": "2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
  "reason": "Insufficient stock for product c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "rejectedAt": 1737468755
}
```

---

### 3. PROBAR FLUJO COMPLETO (CASO EXITOSO)

#### Paso 1: Ver stock inicial
```powershell
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

**Respuesta esperada:**
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 100,
  "reservedStock": 0,
  "updatedAt": "2026-01-21T..."
}
```

#### Paso 2: Crear pedido
```powershell
curl -X POST http://localhost:8080/api/v1/orders `
  -H "Content-Type: application/json" `
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

**Respuesta esperada:**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "status": "PENDING",
  "message": "Order received. Inventory check in progress."
}
```

**⚠️ COPIAR EL orderId PARA EL SIGUIENTE PASO**

#### Paso 3: Esperar procesamiento (2-3 segundos)
```powershell
Start-Sleep -Seconds 3
```

#### Paso 4: Consultar estado del pedido
```powershell
# Reemplazar {orderId} con el ID real del paso 2
curl http://localhost:8080/api/v1/orders/{orderId}
```

**Respuesta esperada (CONFIRMED):**
```json
{
  "orderId": "0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34",
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "status": "CONFIRMED",  ✅
  "items": [...],
  "createdAt": "2026-01-21T15:30:45Z",
  "updatedAt": "2026-01-21T15:30:50Z"  ✅ Actualizado
}
```

#### Paso 5: Verificar stock actualizado
```powershell
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

**Respuesta esperada:**
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 98,  ✅ Reducido en 2
  "reservedStock": 2,    ✅ Aumentado en 2
  "updatedAt": "2026-01-21T15:30:50Z"
}
```

---

### 4. PROBAR FLUJO COMPLETO (CASO RECHAZADO)

#### Paso 1: Crear pedido SIN stock suficiente
```powershell
curl -X POST http://localhost:8080/api/v1/orders `
  -H "Content-Type: application/json" `
  -d '{
    "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
    "items": [
      {
        "productId": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
        "quantity": 50
      }
    ],
    "shippingAddress": {
      "country": "EC",
      "city": "Quito",
      "street": "Av. Amazonas",
      "postalCode": "170135"
    },
    "paymentReference": "pay_xyz789"
  }'
```

**Nota:** El producto `c1d2e3f4...` tiene solo 25 unidades disponibles, pero pedimos 50.

**Respuesta esperada:**
```json
{
  "orderId": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "status": "PENDING",
  "message": "Order received. Inventory check in progress."
}
```

**⚠️ COPIAR EL orderId**

#### Paso 2: Esperar procesamiento
```powershell
Start-Sleep -Seconds 3
```

#### Paso 3: Consultar estado del pedido
```powershell
curl http://localhost:8080/api/v1/orders/{orderId}
```

**Respuesta esperada (CANCELLED):**
```json
{
  "orderId": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
  "status": "CANCELLED",  ✅
  "reason": "Insufficient stock for product c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",  ✅
  "items": [...],
  "createdAt": "2026-01-21T15:32:10Z",
  "updatedAt": "2026-01-21T15:32:13Z"  ✅
}
```

#### Paso 4: Verificar que stock NO cambió
```powershell
curl http://localhost:3000/api/v1/products/c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f/stock
```

**Respuesta esperada:**
```json
{
  "productId": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "availableStock": 25,  ✅ Sin cambios
  "reservedStock": 0,    ✅ Sin cambios
  "updatedAt": "2026-01-21T..."
}
```

---

### 5. VERIFICAR LOGS EN TIEMPO REAL

#### Ver logs de Order Service
```powershell
docker logs order-service -f --tail 50
```

**Buscar líneas como:**
```
[INFO] Received create order request for customer: 9f7a1e2a...
[INFO] Publishing OrderCreated event orderId=0d3f6b7c...
[INFO] ==> Received stock response: {"eventType":"StockReserved"...
[INFO] ==> Processing as StockReserved
[INFO] Order confirmed successfully: 0d3f6b7c...
```

#### Ver logs de Inventory Service
```powershell
docker logs inventory-service -f --tail 50
```

**Buscar líneas como:**
```
[INFO] Received OrderCreated event orderId=0d3f6b7c...
[INFO] Processing order orderId=0d3f6b7c...
[INFO] Checking stock for product a3c2b1d0...
[INFO] Stock available, reserving...
[INFO] Publishing StockReserved to exchange=ecommerce.events routing_key=stock.reserved
[INFO] Published: true
```

---

### 6. VERIFICAR BASE DE DATOS

#### Conectar a Order DB
```powershell
docker exec -it order-db psql -U orderuser -d orderdb
```

**Consultas SQL:**
```sql
-- Ver todos los pedidos
SELECT order_id, customer_id, status, created_at, updated_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver pedidos confirmados
SELECT * FROM orders WHERE status = 'CONFIRMED';

-- Ver pedidos cancelados con razón
SELECT order_id, status, cancellation_reason 
FROM orders 
WHERE status = 'CANCELLED';

-- Salir
\q
```

#### Conectar a Inventory DB
```powershell
docker exec -it inventory-db psql -U inventoryuser -d inventorydb
```

**Consultas SQL:**
```sql
-- Ver stock de todos los productos
SELECT 
  product_id, 
  available_stock, 
  reserved_stock, 
  updated_at 
FROM product_stock 
ORDER BY updated_at DESC;

-- Ver producto específico
SELECT * FROM product_stock 
WHERE product_id = 'a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d';

-- Salir
\q
```

---

### 7. USAR POSTMAN COLLECTION

**Archivo:** `Postman-Collection-Ecommerce-Microservices.json`

**Importar en Postman:**
1. Abrir Postman
2. File → Import
3. Seleccionar el archivo JSON
4. Ya tienes 8 requests listas para usar

**Requests disponibles:**
1. ✅ Create Order - CONFIRMED (con stock)
2. ✅ Create Order - CANCELLED (sin stock)
3. ✅ Get Order by ID - PENDING
4. ✅ Get Order by ID - CONFIRMED
5. ✅ Get Order by ID - CANCELLED
6. ✅ Get Product Stock - Product 1
7. ✅ Get Product Stock - Product 2
8. ✅ Get Product Stock - Product 3

---

## 🎯 CHECKLIST DE VERIFICACIÓN RÁPIDA

### Infraestructura
- [ ] Docker containers corriendo (`docker compose ps`)
- [ ] RabbitMQ UI accesible (http://localhost:15673)
- [ ] Order Service API accesible (http://localhost:8080)
- [ ] Inventory Service API accesible (http://localhost:3000)

### RabbitMQ
- [ ] Exchange `ecommerce.events` existe (tipo topic)
- [ ] Queue `order.created` existe con binding
- [ ] Queue `stock.response` existe con bindings
- [ ] Mensajes fluyen entre servicios

### Flujo de Eventos
- [ ] Crear pedido devuelve status PENDING
- [ ] OrderCreated evento se publica a RabbitMQ
- [ ] Inventory Service consume OrderCreated
- [ ] Stock se verifica y actualiza
- [ ] StockReserved/Rejected se publica
- [ ] Order Service consume respuesta
- [ ] Estado del pedido se actualiza a CONFIRMED/CANCELLED

### APIs
- [ ] POST /api/v1/orders funciona (HTTP 201)
- [ ] GET /api/v1/orders/{id} funciona (HTTP 200)
- [ ] GET /api/v1/products/{id}/stock funciona (HTTP 200)
- [ ] UUIDs consistentes en todo el sistema

### Base de Datos
- [ ] Pedidos se persisten en orderdb
- [ ] Stock se actualiza en inventorydb
- [ ] Timestamps (createdAt/updatedAt) se registran
- [ ] Estados (PENDING/CONFIRMED/CANCELLED) correctos

---

## 📸 CAPTURAS SUGERIDAS PARA EVIDENCIA

1. **RabbitMQ Exchange:**
   - Pestaña Exchanges → `ecommerce.events`

2. **RabbitMQ Queues:**
   - Pestaña Queues → ambas queues visibles

3. **RabbitMQ Bindings:**
   - Click en queue → sección Bindings

4. **RabbitMQ Messages:**
   - Get messages → payload JSON visible

5. **API Responses:**
   - Postman/curl responses para los 3 estados

6. **Database:**
   - SELECT queries mostrando pedidos y stock

7. **Logs:**
   - Docker logs mostrando flujo de eventos

---

## 🆘 TROUBLESHOOTING

### Si RabbitMQ no abre:
```powershell
docker restart rabbitmq-ecommerce
Start-Sleep -Seconds 10
```

### Si servicios no responden:
```powershell
docker compose restart
docker compose logs -f
```

### Si pedidos no se actualizan:
```powershell
# Ver logs de ambos servicios
docker logs order-service --tail 100
docker logs inventory-service --tail 100
```

### Para resetear todo:
```powershell
docker compose down -v
docker compose up -d
Start-Sleep -Seconds 15
```

---

**¡Todo verificado y funcionando! 🎉**
