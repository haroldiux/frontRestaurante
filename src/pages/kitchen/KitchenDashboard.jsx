import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChefHat, Check, AlertTriangle, Volume2, VolumeX, Utensils, User, 
  ShoppingBag, UtensilsCrossed, Phone
} from 'lucide-react';
import { clsx } from 'clsx';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';

const KitchenContent = () => {
  const { orders, updateOrderStatus } = useRestaurant();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const prevOrdersCount = useRef(0);

  // Filtrar pedidos de cocina (pending y preparing, no pagados)
  const kitchenOrders = orders.filter(o => 
    (o.status === 'pending' || o.status === 'preparing') && o.status !== 'paid'
  );
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Sonido de notificación cuando llega pedido nuevo
  useEffect(() => {
    if (kitchenOrders.length > prevOrdersCount.current && soundEnabled && prevOrdersCount.current > 0) {
      playNotification();
    }
    prevOrdersCount.current = kitchenOrders.length;
  }, [kitchenOrders.length, soundEnabled]);

  const playNotification = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 200);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Calcular tiempo transcurrido
  const getElapsedTime = (createdAt) => {
    const created = new Date(createdAt);
    const diff = Math.floor((currentTime - created) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return { minutes, seconds, formatted: `${minutes}:${seconds.toString().padStart(2, '0')}` };
  };

  // Obtener color según tiempo
  const getTimeColor = (minutes) => {
    if (minutes < 10) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (minutes < 20) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', pulse: true };
  };

  // Iniciar preparación
  const startPreparation = (orderId) => {
    updateOrderStatus(orderId, 'preparing');
  };

  // Marcar como listo
  const markAsReady = (orderId) => {
    updateOrderStatus(orderId, 'ready');
  };

  const pendingOrders = kitchenOrders.filter(o => o.status === 'pending');
  const preparingOrders = kitchenOrders.filter(o => o.status === 'preparing');
  
  // Separar por tipo
  const dineInPending = pendingOrders.filter(o => o.orderType !== 'takeaway');
  const takeawayPending = pendingOrders.filter(o => o.orderType === 'takeaway');

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <ChefHat size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cocina</h1>
            <p className="text-sm text-gray-500">Kitchen Display System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle sonido */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={clsx(
              "p-3 rounded-xl transition-all",
              soundEnabled 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-white/5 text-gray-500 border border-white/10"
            )}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </motion.button>

          {/* Stats */}
          <div className="flex gap-2">
            <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center gap-2">
              <UtensilsCrossed size={14} className="text-amber-400" />
              <span className="text-amber-400 font-bold">{dineInPending.length}</span>
              <span className="text-amber-400/70 text-sm">mesas</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center gap-2">
              <ShoppingBag size={14} className="text-orange-400" />
              <span className="text-orange-400 font-bold">{takeawayPending.length}</span>
              <span className="text-orange-400/70 text-sm">llevar</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <span className="text-blue-400 font-bold">{preparingOrders.length}</span>
              <span className="text-blue-400/70 text-sm ml-1">preparando</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold">{readyOrders.length}</span>
              <span className="text-emerald-400/70 text-sm ml-1">listos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {kitchenOrders.map((order) => {
            const elapsed = getElapsedTime(order.createdAt);
            const timeColor = getTimeColor(elapsed.minutes);
            const isTakeaway = order.orderType === 'takeaway';
            
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className={clsx(
                  "rounded-2xl border overflow-hidden",
                  order.status === 'preparing' 
                    ? "bg-blue-500/10 border-blue-500/30" 
                    : isTakeaway
                      ? "bg-orange-500/5 border-orange-500/20"
                      : "bg-white/[0.03] border-white/10"
                )}
              >
                {/* Header */}
                <div className={clsx(
                  "p-4 border-b",
                  order.status === 'preparing' ? "border-blue-500/20" : "border-white/5"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Order Type Badge */}
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center",
                        isTakeaway 
                          ? "bg-orange-500/20" 
                          : order.status === 'preparing'
                            ? "bg-blue-500/20"
                            : "bg-amber-500/20"
                      )}>
                        {isTakeaway ? (
                          <>
                            <ShoppingBag size={18} className="text-orange-400" />
                            <span className="text-[8px] text-orange-400 font-bold mt-0.5">LLEVAR</span>
                          </>
                        ) : (
                          <>
                            <span className={clsx(
                              "text-lg font-bold",
                              order.status === 'preparing' ? "text-blue-400" : "text-amber-400"
                            )}>
                              {order.tableNumber}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div>
                        {isTakeaway ? (
                          <>
                            <p className="text-white font-semibold">Para Llevar</p>
                            <div className="flex items-center gap-1 text-xs text-orange-400">
                              <User size={10} />
                              <span>{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone size={10} />
                              <span>{order.customerPhone}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-white font-semibold">Mesa {order.tableNumber}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <UtensilsCrossed size={10} />
                              <span>En restaurante</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className={clsx(
                      "px-3 py-2 rounded-xl flex items-center gap-2 border",
                      timeColor.bg, timeColor.border,
                      timeColor.pulse && "animate-pulse"
                    )}>
                      <Clock size={14} className={timeColor.text} />
                      <span className={clsx("font-mono font-bold", timeColor.text)}>
                        {elapsed.formatted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2">
                  {order.items.map((item, idx) => {
                    const takeawayQty = item.takeawayQty || 0;
                    const dineInQty = item.quantity - takeawayQty;
                    const hasMixed = takeawayQty > 0 && dineInQty > 0;
                    
                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">{item.quantity}x</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{item.product.name}</p>
                          
                          {/* Desglose Mesa/Llevar */}
                          {takeawayQty > 0 && (
                            <div className="flex items-center gap-2 mt-0.5 text-xs">
                              {dineInQty > 0 && (
                                <span className="text-gray-400">🍽️ {dineInQty}</span>
                              )}
                              <span className="text-orange-400 font-medium px-1.5 py-0.5 bg-orange-500/20 rounded">
                                🥡 {takeawayQty} llevar
                              </span>
                            </div>
                          )}
                          
                          {item.notes && (
                            <p className="text-xs text-amber-400/70 flex items-center gap-1 mt-0.5">
                              <AlertTriangle size={10} />
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="p-4 pt-0">
                  {order.status === 'pending' ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startPreparation(order.id)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <Utensils size={18} />
                      <span>Empezar Preparación</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => markAsReady(order.id)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                    >
                      <Check size={18} />
                      <span>Marcar como Listo</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {kitchenOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Todo listo!</h3>
            <p className="text-gray-500">No hay pedidos pendientes</p>
          </motion.div>
        )}
      </div>

      {/* Ready Orders Section */}
      {readyOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Check size={20} />
            Pedidos Listos ({readyOrders.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {readyOrders.slice(0, 8).map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={clsx(
                  "shrink-0 px-4 py-3 rounded-xl flex items-center gap-2",
                  order.orderType === 'takeaway'
                    ? "bg-orange-500/20 border border-orange-500/30"
                    : "bg-emerald-500/20 border border-emerald-500/30"
                )}
              >
                {order.orderType === 'takeaway' ? (
                  <>
                    <ShoppingBag size={16} className="text-orange-400" />
                    <span className="text-orange-400 font-bold">{order.customerName}</span>
                  </>
                ) : (
                  <>
                    <UtensilsCrossed size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Mesa {order.tableNumber}</span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const KitchenDashboard = () => {
  return (
    <RestaurantProvider>
      <KitchenContent />
    </RestaurantProvider>
  );
};

export default KitchenDashboard;
