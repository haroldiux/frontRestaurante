# 🍽️ Sistema de Gestión de Restaurante - Documentación Técnica

## Índice

1. [Visión General](#visión-general)
2. [Roles y Usuarios](#roles-y-usuarios)
3. [Módulos del Sistema](#módulos-del-sistema)
4. [Flujos de Trabajo](#flujos-de-trabajo)
5. [Modelos de Datos](#modelos-de-datos)
6. [API Endpoints Sugeridos](#api-endpoints-sugeridos)

---

## Visión General

Sistema completo de gestión para restaurantes con múltiples roles:

- **Frontend**: React + Vite + TailwindCSS
- **Estado**: Context API + localStorage (simula persistencia)
- **Tiempo Real**: Sincronización entre pestañas vía `storage` events

### Características Principales

- Gestión de mesas y pedidos en tiempo real
- Sistema de comandas para cocina (KDS)
- Caja con múltiples métodos de pago
- Inventario con control automático de stock
- Pago QR desde vista del cliente

---

## Roles y Usuarios

| Rol       | Acceso        | Descripción                                                    |
| --------- | ------------- | -------------------------------------------------------------- |
| `admin`   | Total         | Dashboard, usuarios, menú, inventario, reportes, configuración |
| `waiter`  | Mesas/Pedidos | Mapa de mesas, toma de pedidos, pedidos listos                 |
| `kitchen` | Cocina        | KDS con comandas, historial de pedidos                         |
| `cashier` | Caja          | Cobros, cierre de caja                                         |
| `client`  | Público       | Vista QR de mesa, pago digital                                 |

### Autenticación

```javascript
// Usuarios demo (frontend)
const users = {
  admin: { role: "admin", name: "Administrador" },
  mesero: { role: "waiter", name: "Carlos M.", id: "waiter-1" },
  cocina: { role: "kitchen", name: "Chef Pedro" },
  cashier: { role: "cashier", name: "Cajero" },
};
```

---

## Módulos del Sistema

### 1. Módulo Mesero (`/waiter`)

#### 1.1 Mapa de Mesas (`WaiterHome.jsx`)

- Grid de 16 mesas con estados visuales
- Estados: `free`, `occupied`, `reserved`
- Indicadores especiales:
  - 🔔 Llamada de cliente (pulsante amarillo)
  - 🍽️ Pedido listo (pulsante verde)
- Asignación automática de mesero a mesa

#### 1.2 Toma de Pedidos (`WaiterDashboard.jsx`)

- Menú con categorías: Entradas, Platos, Bebidas, Postres
- Carrito con cantidades, notas especiales
- Selector de items para llevar (🥡 por item)
- Modos: `dine-in` (mesa) | `takeaway` (para llevar)

#### 1.3 Pedidos Listos (`ReadyOrders.jsx`)

- Lista de pedidos con status `ready`
- Acción "Marcar Servido" → `status: 'served'`

### 2. Módulo Cocina (`/kitchen`)

#### 2.1 KDS - Kitchen Display System (`KitchenDashboard.jsx`)

- Comandas en tiempo real por orden de llegada
- Timer visual por pedido (tiempo desde creación)
- Icono diferenciador: 🍽️ Mesa | 🥡 Para Llevar
- Estados: `pending` → `preparing` → `ready`
- Descuento automático de inventario al marcar "Listo"

#### 2.2 Historial (`KitchenHistory.jsx`)

- Pedidos completados del día
- Estadísticas: total, por tipo, items preparados

### 3. Módulo Caja (`/cashier`)

#### 3.1 Dashboard de Caja (`CashierDashboard.jsx`)

- Lista de pedidos pendientes de cobro
- Métodos de pago: Efectivo, Tarjeta, QR
- Alertas de pago QR:
  - 🟣 "Esperando Pago QR" (cliente aún no paga)
  - 🟢 "Cliente Pagó - Confirmar" (cliente ya pagó, espera confirmación)

#### 3.2 Cierre de Caja (`CashierClosing.jsx`)

- Resumen de ventas del día
- Desglose por método de pago
- Desglose por tipo (mesa/llevar)
- Productos más vendidos
- Bloqueo si hay pedidos pendientes

### 4. Módulo Admin (`/admin`)

#### 4.1 Dashboard (`AdminDashboard.jsx`)

- KPIs: Ventas, pedidos, ticket promedio
- Actividad reciente
- Estado del personal

#### 4.2 Usuarios (`AdminUsers.jsx`)

- CRUD completo de usuarios
- Filtro por rol
- Toggle activo/inactivo

#### 4.3 Menú (`AdminMenu.jsx`)

- CRUD de productos
- Categorías: entradas, platos, bebidas, postres
- Toggle disponibilidad
- Imagen y precio

#### 4.4 Inventario (`AdminInventory.jsx`)

- CRUD de ingredientes
- Categorías: `perecedero` | `no_perecedero`
- Campos: stock, minStock, unit, expiryDate, costPerUnit
- Alertas automáticas:
  - 🔴 Stock bajo (stock ≤ minStock)
  - 🟡 Por vencer (≤ 7 días)
  - 🔴 Vencido

#### 4.5 Reportes (`AdminReports.jsx`)

- Gráfico de ventas por día
- Productos más vendidos
- Pedidos por tipo
- Horas pico

#### 4.6 Configuración (`AdminSettings.jsx`)

- Datos del restaurante
- Horarios de atención
- Notificaciones
- Métodos de pago e impuestos

### 5. Módulo Cliente (`/table/:tableNumber`)

#### Vista Pública (sin login)

- Acceso via QR con número de mesa
- Auto-ocupación de mesa al escanear
- Botones de acción:
  - 🔔 Llamar mesero
  - 📋 Pedir cuenta
- Vista de pago QR cuando hay pendingPayment
- Botón "Simular Pago Completado" → notifica a caja

---

## Flujos de Trabajo

### Flujo 1: Pedido en Mesa

```
1. Cliente escanea QR → Mesa se ocupa automáticamente
2. Mesero ve mesa ocupada → Selecciona → Toma pedido
3. Pedido se envía → Aparece en Cocina (KDS)
4. Cocina prepara → Marca "Listo" → Inventario se descuenta
5. Mesero ve alerta verde → Entrega → Marca "Servido"
6. Cliente solicita cuenta → Mesero inicia pago QR
7. Cliente paga → Caja confirma → Mesa se libera
```

### Flujo 2: Pedido Para Llevar

```
1. Mesero activa modo "Para Llevar"
2. Ingresa nombre y teléfono del cliente
3. Toma pedido (puede mezclar items mesa + llevar)
4. Cocina ve icono 🥡 en cada item para llevar
5. Cocina marca "Listo"
6. Caja cobra al cliente → Pedido completado
```

### Flujo 3: Pago con QR

```
1. Cliente solicita cuenta (desde su vista o mesero)
2. Sistema genera QR con monto
3. Cliente ve QR → Click "Simular Pago"
4. Caja ve alerta verde "Cliente Pagó - Confirmar"
5. Cajero confirma → Mesa se libera
```

### Flujo 4: Llamada de Cliente

```
1. Cliente desde su vista click "🔔 Llamar Mesero"
2. Mesero ve mesa pulsando amarillo
3. Mesero atiende → Click en mesa → Alerta desaparece
```

---

## Modelos de Datos

### Mesa (Table)

```javascript
{
  id: number,
  number: number,
  status: 'free' | 'occupied' | 'reserved',
  capacity: number,
  occupiedSince: ISO8601 | null,
  assignedWaiter: string | null,
  callRequest: {
    type: 'attention' | 'bill',
    timestamp: ISO8601
  } | null,
  pendingPayment: {
    amount: number,
    clientPaid: boolean,
    paidAt: ISO8601 | null,
    method: 'qr' | 'cash' | 'card'
  } | null,
  reservation: {
    customerName: string,
    partySize: number,
    time: ISO8601,
    phone: string
  } | null
}
```

### Pedido (Order)

```javascript
{
  id: number,
  tableId: number | null,
  tableNumber: number | null,
  orderType: 'dine-in' | 'takeaway',
  customerName: string, // solo takeaway
  customerPhone: string, // solo takeaway
  items: [
    {
      product: Product,
      quantity: number,
      notes: string,
      forTakeaway: boolean // si es para llevar desde mesa
    }
  ],
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled',
  createdAt: ISO8601,
  readyAt: ISO8601 | null,
  paidAt: ISO8601 | null,
  paymentMethod: 'cash' | 'card' | 'qr' | null
}
```

### Producto (Product)

```javascript
{
  id: number,
  name: string,
  category: 'entradas' | 'platos' | 'bebidas' | 'postres',
  price: number,
  image: string (URL),
  available: boolean,
  description: string
}
```

### Ingrediente (Ingredient)

```javascript
{
  id: number,
  name: string,
  category: 'perecedero' | 'no_perecedero',
  unit: 'kg' | 'lt' | 'unidad' | 'paquete' | 'botella',
  stock: number,
  minStock: number,
  expiryDate: 'YYYY-MM-DD',
  costPerUnit: number
}
```

### Receta (ProductRecipe)

```javascript
// Mapeo: productId -> ingredientes requeridos
{
  [productId]: [
    { ingredientId: number, qty: number }
  ]
}

// Ejemplo: Nachos Supreme (id: 1)
1: [
  { ingredientId: 17, qty: 0.15 }, // Tortillas Nachos
  { ingredientId: 6, qty: 0.08 },  // Queso Cheddar
  { ingredientId: 12, qty: 0.05 }  // Tomate
]
```

### Usuario (User)

```javascript
{
  id: string,
  name: string,
  email: string,
  role: 'admin' | 'waiter' | 'kitchen' | 'cashier',
  phone: string,
  status: 'active' | 'inactive'
}
```

---

## API Endpoints Sugeridos

### Autenticación

```
POST /api/auth/login        → { username, password }
POST /api/auth/logout       → {}
GET  /api/auth/me           → User
```

### Mesas

```
GET    /api/tables                    → Table[]
GET    /api/tables/:id                → Table
PATCH  /api/tables/:id/status         → { status }
PATCH  /api/tables/:id/call           → { type } | null
PATCH  /api/tables/:id/assign         → { waiterId }
POST   /api/tables/:id/payment        → { amount }
PATCH  /api/tables/:id/confirm-payment → {}
```

### Pedidos

```
GET    /api/orders                    → Order[]
GET    /api/orders?status=pending     → Order[] (filtro)
GET    /api/orders?tableId=5          → Order[] (filtro)
POST   /api/orders                    → { tableId?, items, orderType, customer? }
PATCH  /api/orders/:id/status         → { status }
PATCH  /api/orders/:id/pay            → { paymentMethod }
DELETE /api/orders/:id                → {} (cancelar)
```

### Productos

```
GET    /api/products                  → Product[]
GET    /api/products?category=platos  → Product[] (filtro)
POST   /api/products                  → Product
PUT    /api/products/:id              → Product
DELETE /api/products/:id              → {}
PATCH  /api/products/:id/availability → { available: boolean }
```

### Inventario

```
GET    /api/ingredients               → Ingredient[]
GET    /api/ingredients/alerts        → { lowStock: [], expiring: [] }
POST   /api/ingredients               → Ingredient
PUT    /api/ingredients/:id           → Ingredient
DELETE /api/ingredients/:id           → {}
PATCH  /api/ingredients/:id/stock     → { quantity: number, operation: 'add' | 'subtract' }
```

### Recetas

```
GET    /api/recipes/:productId        → RecipeItem[]
PUT    /api/recipes/:productId        → RecipeItem[]
```

### Usuarios (Admin)

```
GET    /api/users                     → User[]
POST   /api/users                     → User
PUT    /api/users/:id                 → User
DELETE /api/users/:id                 → {}
PATCH  /api/users/:id/status          → { status }
```

### Reportes (Admin)

```
GET /api/reports/sales?period=day|week|month  → { total, byMethod, byType }
GET /api/reports/products/top                  → { name, count, revenue }[]
GET /api/reports/peak-hours                    → { time, orders }[]
```

### WebSocket Events (Tiempo Real)

```
// Servidor → Cliente
table.updated      → { tableId, data }
order.created      → { order }
order.updated      → { orderId, status }
call.requested     → { tableId, type }
payment.confirmed  → { tableId }

// Cliente → Servidor
order.status.update  → { orderId, status }
call.dismiss         → { tableId }
```

---

## Notas para Backend

### Descuento Automático de Inventario

Cuando un pedido cambia a `status: 'ready'`:

1. Obtener recetas de cada producto en `order.items`
2. Calcular total de ingredientes: `qty * item.quantity`
3. Descontar de `ingredients.stock`
4. Nunca permitir stock negativo (Math.max(0, ...))

### Sincronización en Tiempo Real

El frontend espera actualizaciones inmediatas para:

- Cambios de estado de mesas
- Nuevos pedidos (cocina)
- Llamadas de clientes (mesero)
- Confirmación de pagos (caja)

### Validaciones Importantes

- No permitir cierre de caja si hay pedidos `status !== 'paid'`
- No permitir asignar mesero si mesa ya tiene uno
- Verificar stock antes de aceptar pedido (opcional)
- Validar fechas de vencimiento en inventario

---

## Contacto

Documentación generada para el equipo de desarrollo backend.
Repositorio: https://github.com/haroldiux/frontRestaurante
