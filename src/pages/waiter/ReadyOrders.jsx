import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Clock, Check, Bell, UtensilsCrossed, 
  ArrowLeft, Utensils, ShoppingBag
} from 'lucide-react';
import { clsx } from 'clsx';

const ReadyOrdersContent = () => {
  const { orders, tables, updateOrderStatus } = useRestaurant();
  
  // Forzar re-render cada 30s para actualizar tiempos
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Pedidos listos para servir (de mesas)
  const readyOrders = orders.filter(o => o.status === 'ready' && o.tableId);
  
  // Pedidos para llevar listos
  const readyTakeaway = orders.filter(o => o.status === 'ready' && o.orderType === 'takeaway');

  const handleMarkServed = (orderId) => {
    updateOrderStatus(orderId, 'served');
  };

  const getTimeSinceReady = (order) => {
    // Asumiendo que el timestamp de ready es cuando se marcó listo
    const now = new Date();
    const readyTime = new Date(order.updatedAt || order.createdAt);
    const diffMs = now - readyTime;
    const minutes = Math.floor(diffMs / 60000);
    return minutes;
  };

  const getTableNumber = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || '?';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Pedidos Listos</h1>
          <p className="text-sm text-gray-500">Listos para servir en mesa</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Utensils size={20} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{readyOrders.length}</p>
          <p className="text-xs text-gray-500">Para mesa</p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <ShoppingBag size={20} className="text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{readyTakeaway.length}</p>
          <p className="text-xs text-gray-500">Para llevar</p>
        </div>
      </div>

      {/* Ready Orders - Mesas */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Utensils size={18} className="text-emerald-400" />
          Pedidos en Mesa
        </h2>
        
        {readyOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <ChefHat size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500">No hay pedidos listos</p>
            <p className="text-sm text-gray-600 mt-1">Cuando cocina marque un pedido como listo, aparecerá aquí</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {readyOrders.map(order => {
                const timeSince = getTimeSinceReady(order);
                const isUrgent = timeSince > 5;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className={clsx(
                      "p-4 rounded-2xl border",
                      isUrgent 
                        ? "bg-red-500/10 border-red-500/30" 
                        : "bg-emerald-500/10 border-emerald-500/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-14 h-14 rounded-xl flex items-center justify-center",
                          isUrgent ? "bg-red-500/20" : "bg-emerald-500/20"
                        )}>
                          <span className={clsx(
                            "text-2xl font-bold",
                            isUrgent ? "text-red-400" : "text-emerald-400"
                          )}>
                            {getTableNumber(order.tableId)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Mesa {getTableNumber(order.tableId)}</p>
                          <div className={clsx(
                            "flex items-center gap-1 text-sm",
                            isUrgent ? "text-red-400" : "text-emerald-400"
                          )}>
                            <Clock size={12} />
                            <span>Listo hace {timeSince} min</span>
                            {isUrgent && <Bell size={12} className="animate-bounce ml-1" />}
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMarkServed(order.id)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
                      >
                        <Check size={16} />
                        <span>Servido</span>
                      </motion.button>
                    </div>
                    
                    {/* Items */}
                    <div className="space-y-1 border-t border-white/5 pt-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {item.quantity}x {item.product.name}
                          </span>
                          {item.notes && (
                            <span className="text-amber-400 text-xs">{item.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Ready Orders - Para Llevar */}
      {readyTakeaway.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-orange-400" />
            Para Llevar
          </h2>
          
          <div className="grid gap-3">
            {readyTakeaway.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <p className="text-sm text-orange-400">{order.customerPhone}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkServed(order.id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Entregado</span>
                  </motion.button>
                </div>
                
                {/* Items */}
                <div className="space-y-1 border-t border-white/5 pt-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {item.quantity}x {item.product.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {readyOrders.length === 0 && readyTakeaway.length === 0 && (
        <div className="text-center py-8">
          <Link
            to="/order"
            className="inline-block px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            Ir a Tomar Pedido
          </Link>
        </div>
      )}
    </div>
  );
};

const ReadyOrders = () => {
  return (
    <RestaurantProvider>
      <ReadyOrdersContent />
    </RestaurantProvider>
  );
};

export default ReadyOrders;
