# Testing Guide - E-commerce Microservices

Este documento contiene ejemplos prácticos para probar el sistema.

## Prerequisitos

Asegúrese de que todos los servicios estén ejecutándose:

```bash
cd infrastructure
docker-compose up -d
docker-compose ps
```

## 1. Health Checks

### Order Service
```bash
curl http://localhost:8080/actuator/health
```

### Inventory Service
```bash
curl http://localhost:3000/api/v1/health
```

## 2. Verificar Stock Disponible

### Producto 1 (Stock: 100)
```bash
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

### Producto 2 (Stock: 50)
```bash
curl http://localhost:3000/api/v1/products/b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f/stock
```

### Producto 3 (Stock: 75)
```bash
curl http://localhost:3000/api/v1/products/c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f/stock
```

## 3. Crear Pedidos

### Caso A: Pedido con Stock Suficiente

```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Salida esperada:**
```json
{
  "orderId": "...",
  "status": "PENDING",
  "message": "Order received. Inventory check in progress."
}
```

### Caso B: Pedido con Stock Insuficiente

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
    "paymentReference": "pay_abc456"
  }'
```

## 4. Consultar Estado del Pedido

**Reemplazar `{orderId}` con el ID obtenido en el paso anterior**

```bash
curl http://localhost:8080/api/v1/orders/{orderId}
```

**Ejemplo con UUID real:**
```bash
curl http://localhost:8080/api/v1/orders/0d3f6b7c-9a8e-4c12-8f67-5e0c2a1b9d34
```

### Posibles Respuestas

#### Status PENDING (aún procesando)
```json
{
  "orderId": "...",
  "customerId": "...",
  "status": "PENDING",
  "message": "Inventory verification pending.",
  "items": [...],
  "updatedAt": "2026-01-21T15:09:45Z"
}
```

#### Status CONFIRMED (stock reservado)
```json
{
  "orderId": "...",
  "customerId": "...",
  "status": "CONFIRMED",
  "items": [...],
  "updatedAt": "2026-01-21T15:10:02Z"
}
```

#### Status CANCELLED (stock insuficiente)
```json
{
  "orderId": "...",
  "customerId": "...",
  "status": "CANCELLED",
  "reason": "Insufficient stock for product ...",
  "items": [...],
  "updatedAt": "2026-01-21T15:10:02Z"
}
```

## 5. Script de Prueba Completo

### Windows PowerShell

```powershell
# 1. Crear pedido
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
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
    "paymentReference": "pay_test123"
  }'

Write-Host "Order Created: $($response.orderId)"
Write-Host "Status: $($response.status)"

# 2. Esperar procesamiento
Start-Sleep -Seconds 3

# 3. Consultar estado
$orderId = $response.orderId
$orderStatus = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders/$orderId"

Write-Host "Final Status: $($orderStatus.status)"
$orderStatus | ConvertTo-Json -Depth 10
```

### Linux/Mac Bash

```bash
#!/bin/bash

# 1. Crear pedido
echo "Creating order..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/orders \
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
    "paymentReference": "pay_test123"
  }')

ORDER_ID=$(echo $RESPONSE | jq -r '.orderId')
echo "Order Created: $ORDER_ID"
echo "Status: $(echo $RESPONSE | jq -r '.status')"

# 2. Esperar procesamiento
echo "Waiting for processing..."
sleep 3

# 3. Consultar estado
echo "Fetching order status..."
curl -s http://localhost:8080/api/v1/orders/$ORDER_ID | jq '.'
```

## 6. Verificar en RabbitMQ Management

1. Abrir navegador: http://localhost:15672
2. Login: `admin` / `admin123`
3. Ir a pestaña "Queues"
4. Verificar colas:
   - `order.created`
   - `stock.response`
5. Ver mensajes publicados/consumidos

## 7. Verificar Logs

### Ver logs de Order Service
```bash
docker logs order-service -f
```

### Ver logs de Inventory Service
```bash
docker logs inventory-service -f
```

### Ver todos los logs
```bash
docker-compose logs -f
```

## 8. Casos de Prueba Detallados

### Test 1: Orden Simple (Success)
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
    "items": [{"productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d", "quantity": 1}],
    "shippingAddress": {"country": "EC", "city": "Quito", "street": "Test St", "postalCode": "170135"},
    "paymentReference": "pay_test1"
  }'
```
**Resultado esperado**: CONFIRMED

### Test 2: Orden Múltiple (Success)
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
    "items": [
      {"productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d", "quantity": 5},
      {"productId": "b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f", "quantity": 3}
    ],
    "shippingAddress": {"country": "EC", "city": "Quito", "street": "Test St", "postalCode": "170135"},
    "paymentReference": "pay_test2"
  }'
```
**Resultado esperado**: CONFIRMED

### Test 3: Stock Insuficiente (Failure)
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
    "items": [{"productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d", "quantity": 999}],
    "shippingAddress": {"country": "EC", "city": "Quito", "street": "Test St", "postalCode": "170135"},
    "paymentReference": "pay_test3"
  }'
```
**Resultado esperado**: CANCELLED

### Test 4: Producto Inexistente (Failure)
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
    "items": [{"productId": "00000000-0000-0000-0000-000000000000", "quantity": 1}],
    "shippingAddress": {"country": "EC", "city": "Quito", "street": "Test St", "postalCode": "170135"},
    "paymentReference": "pay_test4"
  }'
```
**Resultado esperado**: CANCELLED

## 9. Troubleshooting

### Si un servicio no responde:

```bash
# Verificar estado
docker-compose ps

# Reiniciar servicio específico
docker-compose restart order-service
docker-compose restart inventory-service

# Ver logs detallados
docker-compose logs --tail=100 order-service
docker-compose logs --tail=100 inventory-service
```

### Si RabbitMQ no funciona:

```bash
# Verificar RabbitMQ
docker-compose logs rabbitmq

# Reiniciar RabbitMQ
docker-compose restart rabbitmq
```

### Limpiar y reiniciar todo:

```bash
docker-compose down -v
docker-compose up -d --build
```

## 10. Performance Testing

### Crear múltiples órdenes en paralelo (Bash)

```bash
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/v1/orders \
    -H "Content-Type: application/json" \
    -d '{
      "customerId": "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e",
      "items": [{"productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d", "quantity": 1}],
      "shippingAddress": {"country": "EC", "city": "Quito", "street": "Test", "postalCode": "170135"},
      "paymentReference": "pay_perf_'$i'"
    }' &
done
wait
echo "All orders created"
```

---

**Nota**: Espere 2-3 segundos después de crear una orden antes de consultar su estado para permitir el procesamiento asíncrono.
