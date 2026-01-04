import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RestaurantContext = createContext(null);

export const useRestaurant = () => useContext(RestaurantContext);

// Función para generar hora de reserva simulada (algunas ya pasadas para demo)
const generateReservationTime = (minutesFromNow) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesFromNow);
  return date.toISOString();
};

// Datos iniciales de mesas (3 reservadas, resto libres)
const initialTables = Array.from({ length: 16 }, (_, i) => {
  const isReserved = i === 3 || i === 7 || i === 11; // Mesas 4, 8, 12 reservadas
  
  return {
    id: i + 1,
    number: i + 1,
    status: isReserved ? 'reserved' : 'free',
    capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
    occupiedSince: null,
    assignedWaiter: null,
    callRequest: null,
    pendingPayment: null,
    reservation: isReserved ? {
      customerName: ['García', 'Rodríguez', 'López'][i % 3],
      partySize: [2, 4, 3][i % 3],
      time: generateReservationTime(i === 3 ? 15 : i === 7 ? 30 : 45),
      phone: '555-' + (1000 + i),
    } : null,
  };
});

// Datos iniciales de productos
const initialProducts = [
  // Entradas
  { id: 1, name: 'Nachos Supreme', category: 'entradas', price: 12.50, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200&h=200&fit=crop' },
  { id: 2, name: 'Ensalada César', category: 'entradas', price: 14.00, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200&h=200&fit=crop' },
  { id: 3, name: 'Sopa del Día', category: 'entradas', price: 8.50, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop' },
  { id: 4, name: 'Alitas BBQ', category: 'entradas', price: 15.00, image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=200&h=200&fit=crop' },
  
  // Platos Fuertes
  { id: 5, name: 'Filete Mignon', category: 'platos', price: 38.00, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop' },
  { id: 6, name: 'Salmón Grillado', category: 'platos', price: 32.00, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop' },
  { id: 7, name: 'Pasta Alfredo', category: 'platos', price: 22.00, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=200&h=200&fit=crop' },
  { id: 8, name: 'Pollo a la Parrilla', category: 'platos', price: 24.00, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&h=200&fit=crop' },
  { id: 9, name: 'Costillas BBQ', category: 'platos', price: 35.00, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop' },
  
  // Bebidas
  { id: 10, name: 'Limonada', category: 'bebidas', price: 5.00, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&h=200&fit=crop' },
  { id: 11, name: 'Coca-Cola', category: 'bebidas', price: 4.00, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop' },
  { id: 12, name: 'Cerveza Artesanal', category: 'bebidas', price: 8.00, image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&h=200&fit=crop' },
  { id: 13, name: 'Vino Tinto (Copa)', category: 'bebidas', price: 12.00, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop' },
  { id: 14, name: 'Agua Mineral', category: 'bebidas', price: 3.50, image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=200&h=200&fit=crop' },
  
  // Postres
  { id: 15, name: 'Cheesecake', category: 'postres', price: 10.00, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop' },
  { id: 16, name: 'Brownie con Helado', category: 'postres', price: 11.00, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop' },
  { id: 17, name: 'Flan Casero', category: 'postres', price: 8.00, image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=200&h=200&fit=crop' },
];

// Datos iniciales de ingredientes (inventario)
const initialIngredients = [
  // Carnes y proteínas (perecederos)
  { id: 1, name: 'Carne de Res', category: 'perecedero', unit: 'kg', stock: 15, minStock: 5, expiryDate: '2025-01-05', costPerUnit: 45 },
  { id: 2, name: 'Pollo', category: 'perecedero', unit: 'kg', stock: 12, minStock: 4, expiryDate: '2025-01-03', costPerUnit: 25 },
  { id: 3, name: 'Salmón', category: 'perecedero', unit: 'kg', stock: 5, minStock: 2, expiryDate: '2025-01-02', costPerUnit: 80 },
  { id: 4, name: 'Costillas Cerdo', category: 'perecedero', unit: 'kg', stock: 8, minStock: 3, expiryDate: '2025-01-04', costPerUnit: 35 },
  { id: 5, name: 'Alitas de Pollo', category: 'perecedero', unit: 'kg', stock: 6, minStock: 2, expiryDate: '2025-01-03', costPerUnit: 20 },
  
  // Lácteos (perecederos)
  { id: 6, name: 'Queso Cheddar', category: 'perecedero', unit: 'kg', stock: 3, minStock: 1, expiryDate: '2025-01-10', costPerUnit: 40 },
  { id: 7, name: 'Queso Parmesano', category: 'perecedero', unit: 'kg', stock: 2, minStock: 0.5, expiryDate: '2025-01-15', costPerUnit: 60 },
  { id: 8, name: 'Crema de Leche', category: 'perecedero', unit: 'lt', stock: 5, minStock: 2, expiryDate: '2025-01-08', costPerUnit: 15 },
  { id: 9, name: 'Mantequilla', category: 'perecedero', unit: 'kg', stock: 3, minStock: 1, expiryDate: '2025-01-12', costPerUnit: 25 },
  { id: 10, name: 'Huevos', category: 'perecedero', unit: 'unidad', stock: 60, minStock: 24, expiryDate: '2025-01-10', costPerUnit: 0.5 },
  
  // Vegetales (perecederos)
  { id: 11, name: 'Lechuga', category: 'perecedero', unit: 'unidad', stock: 15, minStock: 5, expiryDate: '2025-01-02', costPerUnit: 3 },
  { id: 12, name: 'Tomate', category: 'perecedero', unit: 'kg', stock: 8, minStock: 3, expiryDate: '2025-01-03', costPerUnit: 8 },
  { id: 13, name: 'Cebolla', category: 'perecedero', unit: 'kg', stock: 5, minStock: 2, expiryDate: '2025-01-10', costPerUnit: 5 },
  { id: 14, name: 'Limón', category: 'perecedero', unit: 'kg', stock: 4, minStock: 1, expiryDate: '2025-01-05', costPerUnit: 10 },
  
  // No perecederos
  { id: 15, name: 'Pasta Fettuccine', category: 'no_perecedero', unit: 'kg', stock: 10, minStock: 3, expiryDate: '2025-06-01', costPerUnit: 12 },
  { id: 16, name: 'Salsa BBQ', category: 'no_perecedero', unit: 'lt', stock: 8, minStock: 2, expiryDate: '2025-04-01', costPerUnit: 18 },
  { id: 17, name: 'Tortillas Nachos', category: 'no_perecedero', unit: 'paquete', stock: 20, minStock: 5, expiryDate: '2025-03-01', costPerUnit: 8 },
  { id: 18, name: 'Aceite de Oliva', category: 'no_perecedero', unit: 'lt', stock: 5, minStock: 2, expiryDate: '2025-12-01', costPerUnit: 30 },
  
  // Bebidas
  { id: 19, name: 'Coca-Cola (lata)', category: 'no_perecedero', unit: 'unidad', stock: 48, minStock: 24, expiryDate: '2025-08-01', costPerUnit: 2 },
  { id: 20, name: 'Cerveza Artesanal', category: 'no_perecedero', unit: 'unidad', stock: 36, minStock: 12, expiryDate: '2025-04-01', costPerUnit: 4 },
  { id: 21, name: 'Vino Tinto', category: 'no_perecedero', unit: 'botella', stock: 12, minStock: 4, expiryDate: '2027-01-01', costPerUnit: 45 },
  { id: 22, name: 'Agua Mineral', category: 'no_perecedero', unit: 'unidad', stock: 48, minStock: 24, expiryDate: '2025-12-01', costPerUnit: 1.5 },
];

// Recetas: ingredientes necesarios por producto (productId -> [{ingredientId, quantity}])
const productRecipes = {
  1: [{ ingredientId: 17, qty: 0.15 }, { ingredientId: 6, qty: 0.08 }, { ingredientId: 12, qty: 0.05 }], // Nachos
  2: [{ ingredientId: 11, qty: 1 }, { ingredientId: 7, qty: 0.03 }, { ingredientId: 8, qty: 0.02 }], // Ensalada César
  4: [{ ingredientId: 5, qty: 0.3 }, { ingredientId: 16, qty: 0.05 }], // Alitas BBQ
  5: [{ ingredientId: 1, qty: 0.25 }, { ingredientId: 9, qty: 0.02 }], // Filete Mignon
  6: [{ ingredientId: 3, qty: 0.2 }, { ingredientId: 14, qty: 0.05 }, { ingredientId: 18, qty: 0.02 }], // Salmón
  7: [{ ingredientId: 15, qty: 0.15 }, { ingredientId: 8, qty: 0.1 }, { ingredientId: 7, qty: 0.03 }], // Pasta Alfredo
  8: [{ ingredientId: 2, qty: 0.3 }, { ingredientId: 18, qty: 0.02 }], // Pollo a la Parrilla
  9: [{ ingredientId: 4, qty: 0.4 }, { ingredientId: 16, qty: 0.08 }], // Costillas BBQ
  10: [{ ingredientId: 14, qty: 0.1 }], // Limonada
  11: [{ ingredientId: 19, qty: 1 }], // Coca-Cola
  12: [{ ingredientId: 20, qty: 1 }], // Cerveza
  13: [{ ingredientId: 21, qty: 0.15 }], // Vino (copa)
  14: [{ ingredientId: 22, qty: 1 }], // Agua Mineral
  15: [{ ingredientId: 6, qty: 0.1 }, { ingredientId: 8, qty: 0.05 }, { ingredientId: 10, qty: 2 }], // Cheesecake
  16: [{ ingredientId: 10, qty: 2 }, { ingredientId: 9, qty: 0.05 }], // Brownie
  17: [{ ingredientId: 10, qty: 3 }, { ingredientId: 8, qty: 0.1 }], // Flan
};

const STORAGE_KEY = 'restaurant_data';
const RESERVATION_TIMEOUT_MINUTES = 30;

export const RestaurantProvider = ({ children }) => {
  const [tables, setTables] = useState([]);
  const [products] = useState(initialProducts);
  const [ingredients, setIngredients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expiredReservations, setExpiredReservations] = useState([]);
  
  // Nuevo: modo de pedido (mesa o para llevar)
  const [orderMode, setOrderMode] = useState('dine-in'); // 'dine-in' | 'takeaway'
  const [takeawayCustomer, setTakeawayCustomer] = useState({ name: '', phone: '' });

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTables(parsed.tables || initialTables);
      setOrders(parsed.orders || []);
      setIngredients(parsed.ingredients || initialIngredients);
    } else {
      setTables(initialTables);
      setIngredients(initialIngredients);
    }
    setIsLoading(false);
  }, []);

  // Sincronización entre pestañas en tiempo real
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.tables) setTables(parsed.tables);
          if (parsed.orders) setOrders(parsed.orders);
        } catch (err) {
          console.error('Error parsing storage data:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tables, orders, ingredients }));
    }
  }, [tables, orders, ingredients, isLoading]);

  // Verificar reservaciones expiradas cada minuto
  const checkExpiredReservations = useCallback(() => {
    const now = new Date();
    const expired = [];
    
    setTables(prev => prev.map(table => {
      if (table.status === 'reserved' && table.reservation) {
        const reservationTime = new Date(table.reservation.time);
        const minutesPassed = (now - reservationTime) / (1000 * 60);
        
        if (minutesPassed >= RESERVATION_TIMEOUT_MINUTES) {
          expired.push({
            tableNumber: table.number,
            customerName: table.reservation.customerName,
            reservationTime: table.reservation.time,
          });
          return { ...table, status: 'free', reservation: null };
        }
      }
      return table;
    }));
    
    if (expired.length > 0) {
      setExpiredReservations(prev => [...prev, ...expired]);
    }
  }, []);

  // Ejecutar verificación cada minuto
  useEffect(() => {
    if (!isLoading) {
      checkExpiredReservations();
      const interval = setInterval(checkExpiredReservations, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoading, checkExpiredReservations]);

  // Limpiar notificaciones de expiración
  const clearExpiredNotification = (index) => {
    setExpiredReservations(prev => prev.filter((_, i) => i !== index));
  };

  // Actualizar estado de mesa
  const updateTableStatus = (tableId, status, reservation = null) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status, reservation } : table
    ));
  };

  // Activar reserva (cliente llegó)
  const activateReservation = (table) => {
    if (table.status !== 'reserved') return;
    updateTableStatus(table.id, 'occupied', null);
    setSelectedTable({ ...table, status: 'occupied', reservation: null });
    setCart([]);
  };

  // Seleccionar mesa (y asignar mesero)
  const selectTable = (table, waiter = null) => {
    // Cambiar a modo mesa
    setOrderMode('dine-in');
    
    if (table.status === 'free') {
      // Ocupar mesa y asignar mesero
      setTables(prev => prev.map(t => 
        t.id === table.id 
          ? { 
              ...t, 
              status: 'occupied', 
              occupiedSince: new Date().toISOString(),
              assignedWaiter: waiter ? { id: waiter.id, name: waiter.name } : t.assignedWaiter,
            } 
          : t
      ));
      setSelectedTable({ ...table, status: 'occupied', assignedWaiter: waiter });
    } else {
      // Si ya está ocupada y no tiene mesero asignado, asignar este
      if (!table.assignedWaiter && waiter) {
        setTables(prev => prev.map(t => 
          t.id === table.id 
            ? { ...t, assignedWaiter: { id: waiter.id, name: waiter.name } } 
            : t
        ));
        setSelectedTable({ ...table, assignedWaiter: waiter });
      } else {
        setSelectedTable(table);
      }
    }
    setCart([]);
  };

  // Obtener mesas asignadas a un mesero
  const getMyTables = (waiterId) => {
    return tables.filter(t => t.assignedWaiter?.id === waiterId);
  };

  // Cancelar reserva
  const cancelReservation = (tableId) => {
    updateTableStatus(tableId, 'free', null);
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
      setCart([]);
    }
  };

  // Obtener tiempo restante de reserva
  const getReservationTimeInfo = (reservation) => {
    if (!reservation) return null;
    
    const now = new Date();
    const reservationTime = new Date(reservation.time);
    const diffMinutes = Math.round((reservationTime - now) / (1000 * 60));
    
    if (diffMinutes > 0) {
      return { status: 'upcoming', minutes: diffMinutes, text: `En ${diffMinutes} min` };
    } else if (diffMinutes > -RESERVATION_TIMEOUT_MINUTES) {
      return { status: 'waiting', minutes: Math.abs(diffMinutes), text: `Hace ${Math.abs(diffMinutes)} min` };
    } else {
      return { status: 'expired', minutes: Math.abs(diffMinutes), text: 'Expirada' };
    }
  };

  // Obtener pedidos de una mesa específica
  const getTableOrders = (tableId) => {
    return orders.filter(order => order.tableId === tableId && order.status !== 'paid');
  };

  // Calcular total acumulado de una mesa
  const getTableTotal = (tableId) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.reduce((total, order) => total + order.total, 0);
  };

  // Obtener pedidos para llevar pendientes
  const getTakeawayOrders = () => {
    return orders.filter(order => order.orderType === 'takeaway' && order.status !== 'paid' && order.status !== 'delivered');
  };

  // Obtener estadísticas de pedidos
  const getOrderStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
    const dineInOrders = todayOrders.filter(o => o.orderType === 'dine-in' || !o.orderType);
    const takeawayOrders = todayOrders.filter(o => o.orderType === 'takeaway');
    
    return {
      totalOrders: todayOrders.length,
      dineInCount: dineInOrders.length,
      takeawayCount: takeawayOrders.length,
      dineInRevenue: dineInOrders.reduce((sum, o) => sum + o.total, 0),
      takeawayRevenue: takeawayOrders.reduce((sum, o) => sum + o.total, 0),
      totalRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
      deliveredCount: todayOrders.filter(o => o.status === 'delivered' || o.status === 'paid').length,
      cancelledCount: todayOrders.filter(o => o.status === 'cancelled').length,
    };
  };

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '', takeawayQty: 0 }];
    });
  };

  // Actualizar cantidad en carrito
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
          // Ajustar takeawayQty si quantity baja
          const newTakeawayQty = Math.min(item.takeawayQty, quantity);
          return { ...item, quantity, takeawayQty: newTakeawayQty };
        }
        return item;
      }));
    }
  };

  // Actualizar notas de producto
  const updateCartNotes = (productId, notes) => {
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, notes } : item
    ));
  };

  // Incrementar cantidad "Para Llevar" de un item (solo en modo mesa)
  const incrementTakeaway = (productId) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.takeawayQty < item.quantity) {
        return { ...item, takeawayQty: item.takeawayQty + 1 };
      }
      return item;
    }));
  };

  // Decrementar cantidad "Para Llevar" de un item
  const decrementTakeaway = (productId) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.takeawayQty > 0) {
        return { ...item, takeawayQty: item.takeawayQty - 1 };
      }
      return item;
    }));
  };

  // Calcular total del carrito actual
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Enviar pedido a cocina (mesa)
  const sendOrderToKitchen = () => {
    if (orderMode === 'dine-in' && !selectedTable) return false;
    if (cart.length === 0) return false;

    const newOrder = {
      id: Date.now(),
      tableId: orderMode === 'dine-in' ? selectedTable?.id : null,
      tableNumber: orderMode === 'dine-in' ? selectedTable?.number : null,
      orderType: orderMode, // 'dine-in' | 'takeaway'
      customerName: orderMode === 'takeaway' ? takeawayCustomer.name : null,
      customerPhone: orderMode === 'takeaway' ? takeawayCustomer.phone : null,
      items: [...cart],
      total: getCartTotal(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    
    // Si es mesa y estaba reservada, cambiar a ocupada
    if (orderMode === 'dine-in' && selectedTable?.status === 'reserved') {
      updateTableStatus(selectedTable.id, 'occupied', null);
      setSelectedTable(prev => prev ? { ...prev, status: 'occupied', reservation: null } : null);
    }
    
    // Limpiar datos del cliente para llevar después de enviar
    if (orderMode === 'takeaway') {
      setTakeawayCustomer({ name: '', phone: '' });
    }
    
    return true;
  };

  // Actualizar estado de pedido (para cocina) - descuenta inventario cuando se marca como listo
  const updateOrderStatus = (orderId, status) => {
    // Si se marca como listo, descontar ingredientes del inventario
    if (status === 'ready') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Calcular ingredientes a descontar según recetas
        const ingredientDeductions = {};
        
        order.items.forEach(item => {
          const recipe = productRecipes[item.product.id];
          if (recipe) {
            recipe.forEach(r => {
              if (!ingredientDeductions[r.ingredientId]) {
                ingredientDeductions[r.ingredientId] = 0;
              }
              ingredientDeductions[r.ingredientId] += r.qty * item.quantity;
            });
          }
        });
        
        // Descontar del inventario
        setIngredients(prev => prev.map(ing => {
          if (ingredientDeductions[ing.id]) {
            return { ...ing, stock: Math.max(0, ing.stock - ingredientDeductions[ing.id]) };
          }
          return ing;
        }));
      }
    }
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, ...(status === 'ready' ? { readyAt: new Date().toISOString() } : {}) }
        : order
    ));
  };

  // Cobrar pedido para llevar
  const payTakeawayOrder = (orderId, paymentMethod = 'cash') => {
    setOrders(prev => prev.map(order => 
      order.id === orderId
        ? { ...order, status: 'paid', paidAt: new Date().toISOString(), paymentMethod }
        : order
    ));
  };

  // Cobrar mesa
  const payTable = (tableId, paymentMethod = 'cash') => {
    setOrders(prev => prev.map(order => 
      order.tableId === tableId && order.status !== 'paid'
        ? { ...order, status: 'paid', paidAt: new Date().toISOString(), paymentMethod }
        : order
    ));
    
    updateTableStatus(tableId, 'free', null);
    
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
      setCart([]);
    }
    
    return true;
  };

  // Liberar mesa
  const freeTable = (tableId) => {
    setOrders(prev => prev.filter(order => 
      order.tableId !== tableId || order.status === 'paid'
    ));
    
    updateTableStatus(tableId, 'free', null);
    
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
      setCart([]);
    }
  };

  // Cancelar pedido
  const cancelOrder = (orderId) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId
        ? { ...order, status: 'cancelled' }
        : order
    ));
  };

  // Deseleccionar mesa
  const deselectTable = () => {
    setSelectedTable(null);
    setCart([]);
  };

  // Cambiar modo de pedido
  const switchOrderMode = (mode) => {
    setOrderMode(mode);
    if (mode === 'takeaway') {
      setSelectedTable(null);
    }
    setCart([]);
  };

  // ===== SISTEMA DE LLAMADAS CLIENTE-MESERO =====

  // Obtener mesa por número (para vista cliente)
  const getTableByNumber = (tableNumber) => {
    return tables.find(t => t.number === parseInt(tableNumber));
  };

  // Cliente ocupa mesa vía QR
  const occupyTableByClient = (tableNumber) => {
    setTables(prev => prev.map(table => {
      if (table.number === parseInt(tableNumber) && table.status === 'free') {
        return {
          ...table,
          status: 'occupied',
          occupiedSince: new Date().toISOString(),
        };
      }
      return table;
    }));
  };

  // Cliente solicita mesero
  const requestWaiter = (tableNumber, type = 'order') => {
    setTables(prev => prev.map(table => {
      if (table.number === parseInt(tableNumber)) {
        return {
          ...table,
          callRequest: {
            type, // 'order' | 'bill'
            timestamp: new Date().toISOString(),
          },
        };
      }
      return table;
    }));
  };

  // Mesero atiende llamada
  const dismissCall = (tableId) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return { ...table, callRequest: null };
      }
      return table;
    }));
  };

  // Obtener tiempo de espera de una mesa
  const getWaitingTime = (table) => {
    if (!table?.occupiedSince) return null;
    const now = new Date();
    const since = new Date(table.occupiedSince);
    const diffMs = now - since;
    const minutes = Math.floor(diffMs / 60000);
    return {
      minutes,
      status: minutes < 15 ? 'ok' : minutes < 30 ? 'warning' : 'critical',
    };
  };

  // Contar llamadas activas
  const getActiveCallsCount = () => {
    return tables.filter(t => t.callRequest && t.callRequest.type).length;
  };

  // Iniciar pago QR (visible para cliente)
  const initiateQRPayment = (tableId, amount) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          pendingPayment: {
            amount,
            method: 'qr',
            timestamp: new Date().toISOString(),
          },
        };
      }
      return table;
    }));
  };

  // Confirmar pago (limpiar estado)
  const confirmPayment = (tableId) => {
    payTable(tableId);
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return { ...table, pendingPayment: null };
      }
      return table;
    }));
  };

  const value = {
    tables,
    products,
    orders,
    cart,
    selectedTable,
    isLoading,
    expiredReservations,
    orderMode,
    takeawayCustomer,
    RESERVATION_TIMEOUT_MINUTES,
    updateTableStatus,
    selectTable,
    deselectTable,
    activateReservation,
    cancelReservation,
    getReservationTimeInfo,
    getTableOrders,
    getTableTotal,
    getTakeawayOrders,
    getOrderStats,
    addToCart,
    updateCartQuantity,
    updateCartNotes,
    incrementTakeaway,
    decrementTakeaway,
    getCartTotal,
    sendOrderToKitchen,
    updateOrderStatus,
    payTable,
    payTakeawayOrder,
    freeTable,
    cancelOrder,
    setSelectedTable,
    clearExpiredNotification,
    switchOrderMode,
    setTakeawayCustomer,
    // Sistema de llamadas
    getTableByNumber,
    occupyTableByClient,
    requestWaiter,
    dismissCall,
    getWaitingTime,
    getActiveCallsCount,
    // Sistema de pago QR
    initiateQRPayment,
    confirmPayment,
    // Asignación de mesero
    getMyTables,
    // Inventario
    ingredients,
    setIngredients,
    productRecipes,
    // Alertas de inventario
    getLowStockIngredients: () => ingredients.filter(i => i.stock <= i.minStock),
    getExpiringIngredients: () => {
      const today = new Date();
      const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return ingredients.filter(i => {
        const expiry = new Date(i.expiryDate);
        return expiry <= in7Days;
      });
    },
  };

  return (
    <RestaurantContext.Provider value={value}>
      {!isLoading && children}
    </RestaurantContext.Provider>
  );
};
