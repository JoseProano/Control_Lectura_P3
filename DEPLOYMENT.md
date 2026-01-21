# Guía de Despliegue Paso a Paso

Esta guía le ayudará a desplegar el sistema completo desde cero.

## 📋 Requisitos Previos

### Software Necesario

1. **Docker Desktop**
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Git** (opcional, para control de versiones)
   - https://git-scm.com/downloads

3. **Un cliente REST** (opcional, para pruebas manuales)
   - Postman: https://www.postman.com/downloads/
   - Insomnia: https://insomnia.rest/download
   - O usar curl desde la terminal

### Verificar Instalación de Docker

Abra una terminal y ejecute:

```bash
docker --version
docker-compose --version
```

Debería ver algo como:
```
Docker version 24.0.x
Docker Compose version v2.x.x
```

### Verificar que Docker está Ejecutándose

```bash
docker info
```

Si ve un error, inicie Docker Desktop primero.

## 🚀 Opción 1: Despliegue Rápido (Recomendado)

### Windows (PowerShell)

1. Abra PowerShell como Administrador
2. Navegue al directorio del proyecto:
   ```powershell
   cd "d:\Escritorio\Clases\Aplicaciones Distribuidas\ControlLecturaP3"
   ```

3. Ejecute el script de inicio:
   ```powershell
   .\start.ps1
   ```

### Linux/Mac (Bash)

1. Abra una terminal
2. Navegue al directorio del proyecto:
   ```bash
   cd "/path/to/ControlLecturaP3"
   ```

3. Dé permisos de ejecución al script:
   ```bash
   chmod +x start.sh
   ```

4. Ejecute el script:
   ```bash
   ./start.sh
   ```

## 🛠️ Opción 2: Despliegue Manual

Si prefiere tener más control sobre cada paso:

### Paso 1: Navegar al Directorio de Infraestructura

```bash
cd infrastructure
```

### Paso 2: Iniciar los Servicios

```bash
docker-compose up -d
```

Este comando:
- Descarga las imágenes necesarias (primera vez)
- Crea las redes de Docker
- Inicia las bases de datos
- Inicia RabbitMQ
- Construye y ejecuta los microservicios

### Paso 3: Verificar el Estado

```bash
docker-compose ps
```

Todos los servicios deberían mostrar estado "Up" o "healthy":

```
NAME                STATUS              PORTS
order-service       Up (healthy)        0.0.0.0:8080->8080/tcp
inventory-service   Up (healthy)        0.0.0.0:3000->3000/tcp
rabbitmq           Up (healthy)        0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
order-db           Up (healthy)        0.0.0.0:5432->5432/tcp
inventory-db       Up (healthy)        0.0.0.0:5433->5432/tcp
```

### Paso 4: Ver los Logs (Opcional)

Para ver los logs en tiempo real:

```bash
docker-compose logs -f
```

Para ver logs de un servicio específico:

```bash
docker-compose logs -f order-service
docker-compose logs -f inventory-service
```

Presione `Ctrl+C` para salir de los logs.

## ✅ Verificar que Todo Funciona

### 1. Verificar RabbitMQ Management UI

1. Abra un navegador
2. Visite: http://localhost:15672
3. Login:
   - Usuario: `admin`
   - Contraseña: `admin123`
4. Verifique que aparezcan las colas:
   - `order.created`
   - `stock.response`

### 2. Verificar Order Service

```bash
curl http://localhost:8080/actuator/health
```

Debería responder con: `{"status":"UP"}`

### 3. Verificar Inventory Service

```bash
curl http://localhost:3000/api/v1/health
```

Debería responder con:
```json
{
  "status": "healthy",
  "service": "inventory-service",
  "timestamp": "..."
}
```

### 4. Verificar Stock de Productos

```bash
curl http://localhost:3000/api/v1/products/a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d/stock
```

Debería responder con:
```json
{
  "productId": "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d",
  "availableStock": 100,
  "reservedStock": 0,
  "updatedAt": "..."
}
```

## 🧪 Prueba Completa del Flujo

### Paso 1: Crear una Orden

**Windows PowerShell:**
```powershell
$body = @{
    customerId = "9f7a1e2a-31f6-4a53-b0d2-6f4f1c7a3b2e"
    items = @(
        @{
            productId = "a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d"
            quantity = 2
        }
    )
    shippingAddress = @{
        country = "EC"
        city = "Quito"
        street = "Av. Amazonas"
        postalCode = "170135"
    }
    paymentReference = "pay_test_001"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "Order ID: $($response.orderId)"
Write-Host "Status: $($response.status)"

$orderId = $response.orderId
```

**Linux/Mac/Git Bash:**
```bash
response=$(curl -s -X POST http://localhost:8080/api/v1/orders \
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
    "paymentReference": "pay_test_001"
  }')

echo "$response"
orderId=$(echo "$response" | jq -r '.orderId')
echo "Order ID: $orderId"
```

### Paso 2: Esperar el Procesamiento

El procesamiento es asíncrono. Espere 2-3 segundos:

```bash
# En cualquier sistema
sleep 3
```

O en PowerShell:
```powershell
Start-Sleep -Seconds 3
```

### Paso 3: Consultar el Estado de la Orden

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders/$orderId"
```

**Bash:**
```bash
curl http://localhost:8080/api/v1/orders/$orderId | jq '.'
```

Debería ver `"status": "CONFIRMED"` si todo funcionó correctamente.

## 🔍 Solución de Problemas

### Problema: "docker-compose: command not found"

**Solución:** Instale Docker Desktop, que incluye docker-compose.

### Problema: Los servicios no inician

**Diagnóstico:**
```bash
docker-compose logs
```

**Soluciones comunes:**

1. **Puerto ya en uso:**
   ```bash
   # Windows - Ver qué está usando el puerto 8080
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```
   
   Cierre la aplicación que usa el puerto o modifique el puerto en `docker-compose.yml`

2. **Falta de recursos:**
   - Abra Docker Desktop
   - Settings → Resources
   - Aumente memoria a mínimo 4GB
   - Aumente CPUs a mínimo 2

3. **Errores de conexión a base de datos:**
   ```bash
   # Reiniciar solo las bases de datos
   docker-compose restart order-db inventory-db
   
   # Esperar 10 segundos
   sleep 10
   
   # Reiniciar los servicios
   docker-compose restart order-service inventory-service
   ```

### Problema: La orden se queda en PENDING

**Diagnóstico:**
1. Verifique RabbitMQ: http://localhost:15672
2. Revise si hay mensajes en las colas
3. Verifique los logs:
   ```bash
   docker-compose logs inventory-service
   ```

**Solución:**
```bash
# Reiniciar el servicio de inventario
docker-compose restart inventory-service

# Esperar y reintentar
```

### Problema: "Connection refused" al hacer requests

**Solución:**
Los servicios pueden tardar 20-30 segundos en estar completamente listos después de `docker-compose up`.

```bash
# Ver el estado de salud
docker-compose ps

# Esperar a que todos muestren "healthy" o "Up"
```

### Problema: Error 500 en Order Service

**Diagnóstico:**
```bash
docker-compose logs order-service
```

**Soluciones:**
1. Verificar conexión a base de datos:
   ```bash
   docker-compose logs order-db
   ```

2. Reiniciar todo el stack:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## 🧹 Limpieza y Reinicio

### Detener los Servicios (Mantener Datos)

```bash
docker-compose stop
```

Para reiniciar:
```bash
docker-compose start
```

### Detener y Eliminar Contenedores (Mantener Datos)

```bash
docker-compose down
```

Para volver a iniciar:
```bash
docker-compose up -d
```

### Limpieza Completa (Eliminar TODO)

**⚠️ ADVERTENCIA:** Esto eliminará todos los datos en las bases de datos.

```bash
docker-compose down -v
```

Para empezar de nuevo:
```bash
docker-compose up -d --build
```

### Reconstruir las Imágenes

Si cambia el código fuente:

```bash
docker-compose down
docker-compose up -d --build
```

## 📊 Monitoreo

### Ver Uso de Recursos

```bash
docker stats
```

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo Order Service
docker-compose logs -f order-service

# Solo Inventory Service
docker-compose logs -f inventory-service

# Solo RabbitMQ
docker-compose logs -f rabbitmq
```

## 📝 Siguientes Pasos

Una vez que todo esté funcionando:

1. **Revise la documentación completa:**
   - `README.md` - Descripción general del proyecto
   - `TESTING.md` - Ejemplos de pruebas
   - `ARCHITECTURE.md` - Detalles de arquitectura

2. **Pruebe diferentes escenarios:**
   - Órdenes con stock suficiente
   - Órdenes con stock insuficiente
   - Múltiples órdenes simultáneas

3. **Explore RabbitMQ Management UI:**
   - Ver exchanges
   - Ver colas
   - Ver mensajes

4. **Revise el código fuente:**
   - Order Service: `order-service/src/main/java/`
   - Inventory Service: `inventory-service/src/`

## 🎓 Preguntas Frecuentes

**P: ¿Cuánto tiempo tarda en iniciarse todo?**
R: La primera vez: 5-10 minutos (descarga de imágenes). Siguientes veces: 30-60 segundos.

**P: ¿Puedo cambiar los puertos?**
R: Sí, edite `infrastructure/docker-compose.yml` en la sección `ports`.

**P: ¿Cómo agrego más productos?**
R: Conéctese a la base de datos de inventario y agregue registros en `products_stock`.

**P: ¿Los datos persisten al reiniciar?**
R: Sí, mientras use `docker-compose stop` o `docker-compose down` sin `-v`.

**P: ¿Puedo ejecutar sin Docker?**
R: Sí, pero necesitará instalar PostgreSQL, RabbitMQ, Java 17 y Node.js 20 localmente.

## 🆘 Soporte

Si encuentra problemas:

1. Revise esta guía completamente
2. Verifique los logs: `docker-compose logs`
3. Asegúrese de tener las versiones correctas de software
4. Reinicie Docker Desktop
5. Intente una limpieza completa: `docker-compose down -v` y vuelva a empezar

---

**¡Éxito con su proyecto!** 🚀
