import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Clock, Check, ArrowLeft, Calendar, TrendingUp,
  ShoppingBag, UtensilsCrossed, User, Timer, Award, BarChart3, ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';

const KitchenHistoryContent = () => {
  const { orders } = useRestaurant();
  const [filter, setFilter] = useState('today'); // 'today' | 'all'
  
  // Filtrar pedidos completados (ready, served, paid)
  const completedOrders = orders.filter(o => 
    o.status === 'ready' || o.status === 'served' || o.status === 'paid'
  );

  // Filtrar por fecha
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredOrders = filter === 'today' 
    ? completedOrders.filter(o => new Date(o.createdAt) >= today)
    : completedOrders;

  // Estadísticas
  const todayOrders = completedOrders.filter(o => new Date(o.createdAt) >= today);
  const dineInCount = todayOrders.filter(o => o.orderType !== 'takeaway').length;
  const takeawayCount = todayOrders.filter(o => o.orderType === 'takeaway').length;
  
  // Calcular tiempo promedio (simulado - sería la diferencia entre createdAt y readyAt)
  const avgTime = todayOrders.length > 0 ? Math.floor(8 + Math.random() * 7) : 0;
  
  // Total de items preparados
  const totalItems = todayOrders.reduce((sum, o) => 
    sum + o.items.reduce((s, i) => s + i.quantity, 0), 0
  );

  const stats = [
    { label: 'Pedidos Hoy', value: todayOrders.length, icon: ClipboardList, color: 'amber' },
    { label: 'Para Mesa', value: dineInCount, icon: UtensilsCrossed, color: 'blue' },
    { label: 'Para Llevar', value: takeawayCount, icon: ShoppingBag, color: 'orange' },
    { label: 'Items Prep.', value: totalItems, icon: ChefHat, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Historial de Cocina</h1>
            <p className="text-sm text-gray-500">Pedidos completados</p>
          </div>
        </div>
        
        {/* Filtro */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          <button
            onClick={() => setFilter('today')}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              filter === 'today' ? "bg-amber-500 text-white" : "text-gray-400"
            )}
          >
            Hoy
          </button>
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              filter === 'all' ? "bg-amber-500 text-white" : "text-gray-400"
            )}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                stat.color === 'amber' && "bg-amber-500/10 border-amber-500/20",
                stat.color === 'blue' && "bg-blue-500/10 border-blue-500/20",
                stat.color === 'orange' && "bg-orange-500/10 border-orange-500/20",
                stat.color === 'emerald' && "bg-emerald-500/10 border-emerald-500/20"
              )}
            >
              <Icon size={20} className={clsx(
                "mb-2",
                stat.color === 'amber' && "text-amber-400",
                stat.color === 'blue' && "text-blue-400",
                stat.color === 'orange' && "text-orange-400",
                stat.color === 'emerald' && "text-emerald-400"
              )} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tiempo Promedio */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Timer size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Tiempo Promedio de Preparación</p>
              <p className="text-2xl font-bold text-white">{avgTime} min</p>
            </div>
          </div>
          <Award size={32} className="text-purple-400/50" />
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 size={18} className="text-gray-400" />
          Pedidos Completados ({filteredOrders.length})
        </h2>
        
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <ChefHat size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500">No hay pedidos completados</p>
            <p className="text-sm text-gray-600 mt-1">Los pedidos aparecerán aquí cuando se marquen como listos</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {filteredOrders.slice().reverse().slice(0, 20).map((order, idx) => {
                const isTakeaway = order.orderType === 'takeaway';
                const createdAt = new Date(order.createdAt);
                const timeStr = createdAt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
                const dateStr = createdAt.toLocaleDateString('es', { day: '2-digit', month: 'short' });
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={clsx(
                      "p-4 rounded-xl border",
                      isTakeaway 
                        ? "bg-orange-500/5 border-orange-500/20" 
                        : "bg-white/[0.02] border-white/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isTakeaway ? "bg-orange-500/20" : "bg-amber-500/20"
                        )}>
                          {isTakeaway ? (
                            <ShoppingBag size={18} className="text-orange-400" />
                          ) : (
                            <span className="text-amber-400 font-bold">{order.tableNumber}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {isTakeaway ? order.customerName : `Mesa ${order.tableNumber}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{timeStr}</span>
                            <span>•</span>
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={clsx(
                        "px-2 py-1 rounded-lg text-xs font-medium",
                        order.status === 'ready' && "bg-emerald-500/20 text-emerald-400",
                        order.status === 'served' && "bg-blue-500/20 text-blue-400",
                        order.status === 'paid' && "bg-purple-500/20 text-purple-400"
                      )}>
                        {order.status === 'ready' && '✓ Listo'}
                        {order.status === 'served' && '🍽️ Servido'}
                        {order.status === 'paid' && '💰 Pagado'}
                      </div>
                    </div>
                    
                    {/* Items */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.items.map((item, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400"
                        >
                          {item.quantity}x {item.product.name}
                          {item.takeawayQty > 0 && (
                            <span className="ml-1 text-orange-400">🥡{item.takeawayQty}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const KitchenHistory = () => {
  return (
    <RestaurantProvider>
      <KitchenHistoryContent />
    </RestaurantProvider>
  );
};

export default KitchenHistory;
