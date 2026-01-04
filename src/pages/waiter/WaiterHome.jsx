import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, Bell, Clock, Users, Receipt, 
  TrendingUp, AlertTriangle, ChevronRight, DollarSign
} from 'lucide-react';
import { clsx } from 'clsx';

const WaiterHomeContent = () => {
  const { user } = useAuth();
  const { 
    tables, 
    orders, 
    getActiveCallsCount, 
    getWaitingTime,
    getTableOrders,
    getTableTotal,
    getMyTables,
  } = useRestaurant();

  // Forzar re-render cada minuto para actualizar timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // MIS mesas (asignadas a mí)
  const myTables = user ? getMyTables(user.id) : [];
  const myOccupiedTables = myTables.filter(t => t.status === 'occupied');
  
  // Todas las mesas para estadísticas generales
  const allOccupied = tables.filter(t => t.status === 'occupied');
  const allReserved = tables.filter(t => t.status === 'reserved');
  const allFree = tables.filter(t => t.status === 'free');
  
  // Llamadas solo en MIS mesas
  const myCallsCount = myTables.filter(t => t.callRequest && t.callRequest.type).length;
  const myTablesWithCalls = myTables.filter(t => t.callRequest && t.callRequest.type);
  
  // Pedidos listos de MIS mesas
  const myReadyOrders = orders.filter(o => {
    if (o.status !== 'ready' || !o.tableId) return false;
    const table = tables.find(t => t.id === o.tableId);
    return table?.assignedWaiter?.id === user?.id;
  });

  // Estadísticas del día (mis mesas)
  const todayOrders = orders.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });
  const myTodayRevenue = todayOrders
    .filter(o => {
      if (o.status !== 'paid') return false;
      const table = tables.find(t => t.id === o.tableId);
      return table?.assignedWaiter?.id === user?.id;
    })
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.product.price * i.quantity, 0), 0);

  const stats = [
    { label: 'Mis Mesas', value: myOccupiedTables.length, icon: Users, color: 'amber' },
    { label: 'Mis Llamadas', value: myCallsCount, icon: Bell, color: 'red' },
    { label: 'Disponibles', value: allFree.length, icon: UtensilsCrossed, color: 'emerald' },
    { label: 'Mis Ingresos', value: `Bs. ${myTodayRevenue.toFixed(0)}`, icon: DollarSign, color: 'blue' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Mis Mesas</h1>
        <p className="text-sm text-gray-500">Hola, {user?.name}. Estas son tus mesas asignadas.</p>
      </div>

      {/* Alert: Llamadas en MIS mesas */}
      <AnimatePresence>
        {myCallsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/30 rounded-xl">
                  <Bell size={20} className="text-amber-400 animate-bounce" />
                </div>
                <div>
                  <p className="font-semibold text-amber-400">{myCallsCount} llamada{myCallsCount > 1 ? 's' : ''} en tus mesas</p>
                  <p className="text-sm text-amber-300/70">Clientes esperando atención</p>
                </div>
              </div>
              <Link 
                to="/order"
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Atender
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert: Pedidos Listos de MIS mesas */}
      <AnimatePresence>
        {myReadyOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/30 rounded-xl">
                  <Receipt size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-400">{myReadyOrders.length} pedido{myReadyOrders.length > 1 ? 's' : ''} listo{myReadyOrders.length > 1 ? 's' : ''}</p>
                  <p className="text-sm text-emerald-300/70">De tus mesas, listo para servir</p>
                </div>
              </div>
              <Link 
                to="/ready"
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Ver
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={clsx(
                "p-4 rounded-2xl border",
                stat.color === 'red' && "bg-red-500/10 border-red-500/20",
                stat.color === 'amber' && "bg-amber-500/10 border-amber-500/20",
                stat.color === 'emerald' && "bg-emerald-500/10 border-emerald-500/20",
                stat.color === 'blue' && "bg-blue-500/10 border-blue-500/20"
              )}
            >
              <Icon size={20} className={clsx(
                "mb-2",
                stat.color === 'red' && "text-red-400",
                stat.color === 'amber' && "text-amber-400",
                stat.color === 'emerald' && "text-emerald-400",
                stat.color === 'blue' && "text-blue-400"
              )} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Mesas con Llamadas (MIS mesas) */}
      {myTablesWithCalls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">🔔 Llamadas en Mis Mesas</h2>
          <div className="grid gap-2">
            {myTablesWithCalls.map(table => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-amber-400">{table.number}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Mesa {table.number}</p>
                    <p className="text-sm text-amber-400">
                      {table.callRequest?.type === 'order' ? '🔔 Quiere ordenar' : '💳 Pide la cuenta'}
                    </p>
                  </div>
                </div>
                <Link
                  to="/order"
                  className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30"
                >
                  <ChevronRight size={20} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* MIS Mesas Ocupadas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Mis Mesas Ocupadas</h2>
          <Link to="/order" className="text-sm text-amber-400 hover:text-amber-300">
            Tomar pedido →
          </Link>
        </div>
        
        {myOccupiedTables.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <Users size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500">No tienes mesas asignadas</p>
            <p className="text-sm text-gray-600 mt-1">Ve a "Tomar Pedido" para atender una mesa</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {myOccupiedTables.map(table => {
              const waitingTime = getWaitingTime(table);
              const tableOrders = getTableOrders(table.id);
              const tableTotal = getTableTotal(table.id);
              
              return (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-amber-400">{table.number}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Mesa {table.number}</p>
                      <div className="flex items-center gap-3 text-sm">
                        {waitingTime && (
                          <span className={clsx(
                            "flex items-center gap-1",
                            waitingTime.status === 'ok' && "text-emerald-400",
                            waitingTime.status === 'warning' && "text-amber-400",
                            waitingTime.status === 'critical' && "text-red-400"
                          )}>
                            <Clock size={12} />
                            {waitingTime.minutes}m
                          </span>
                        )}
                        {tableOrders.length > 0 && (
                          <span className="text-gray-500">{tableOrders.length} pedidos</span>
                        )}
                        {tableTotal > 0 && (
                          <span className="text-emerald-400">Bs. {tableTotal.toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/order"
                    className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action */}
      <Link
        to="/order"
        className="block p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-center"
      >
        <span className="text-lg font-bold text-white">Tomar Nuevo Pedido</span>
      </Link>
    </div>
  );
};

const WaiterHome = () => {
  return (
    <RestaurantProvider>
      <WaiterHomeContent />
    </RestaurantProvider>
  );
};

export default WaiterHome;
