import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, DollarSign, CreditCard, QrCode, Clock, Check,
  Download, AlertTriangle, TrendingUp, Calculator, Lock, Unlock
} from 'lucide-react';
import { clsx } from 'clsx';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';

const CashierClosingContent = () => {
  const { orders, tables } = useRestaurant();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [closingData, setClosingData] = useState(null);

  // Pedidos de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(o => 
    new Date(o.createdAt) >= today
  );
  
  const paidOrders = todayOrders.filter(o => o.status === 'paid');
  const pendingOrders = todayOrders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  // Calcular totales
  const getOrderTotal = (order) => {
    return order.items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
  };

  const totalSales = paidOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  
  // Por método de pago
  const cashAmount = paidOrders
    .filter(o => o.paymentMethod === 'cash' || !o.paymentMethod)
    .reduce((sum, o) => sum + getOrderTotal(o), 0);
  const cardAmount = paidOrders
    .filter(o => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + getOrderTotal(o), 0);
  const qrAmount = paidOrders
    .filter(o => o.paymentMethod === 'qr')
    .reduce((sum, o) => sum + getOrderTotal(o), 0);

  // Por tipo
  const dineInOrders = paidOrders.filter(o => o.orderType !== 'takeaway');
  const takeawayOrders = paidOrders.filter(o => o.orderType === 'takeaway');
  const dineInTotal = dineInOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const takeawayTotal = takeawayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

  // Items más vendidos
  const itemCounts = {};
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.product.name]) {
        itemCounts[item.product.name] = { count: 0, revenue: 0 };
      }
      itemCounts[item.product.name].count += item.quantity;
      itemCounts[item.product.name].revenue += item.product.price * item.quantity;
    });
  });
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const handleCloseCash = () => {
    const data = {
      date: new Date().toISOString(),
      totalOrders: paidOrders.length,
      totalSales,
      cashAmount,
      cardAmount,
      qrAmount,
      dineInTotal,
      takeawayTotal,
    };
    setClosingData(data);
    setIsClosed(true);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Cierre de Caja</h1>
            <p className="text-sm text-gray-500">
              {today.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        
        {!isClosed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConfirm(true)}
            disabled={pendingOrders.length > 0}
            className={clsx(
              "px-4 py-2 rounded-xl font-medium flex items-center gap-2",
              pendingOrders.length > 0
                ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-orange-600 text-white"
            )}
          >
            <Lock size={18} />
            <span>Cerrar Caja</span>
          </motion.button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Check size={18} />
            <span className="font-medium">Caja Cerrada</span>
          </div>
        )}
      </div>

      {/* Pending Warning */}
      {pendingOrders.length > 0 && !isClosed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={18} />
            <span className="font-semibold">
              Hay {pendingOrders.length} pedidos pendientes de pago (Bs. {pendingAmount.toFixed(2)})
            </span>
          </div>
          <p className="text-sm text-amber-400/70 mt-1">
            Debes cobrar todos los pedidos antes de cerrar caja
          </p>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30"
        >
          <TrendingUp size={24} className="text-emerald-400 mb-2" />
          <p className="text-3xl font-bold text-white">Bs. {totalSales.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Ventas Totales</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <Calculator size={24} className="text-blue-400 mb-2" />
          <p className="text-3xl font-bold text-white">{paidOrders.length}</p>
          <p className="text-sm text-gray-400">Pedidos Cobrados</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <DollarSign size={24} className="text-amber-400 mb-2" />
          <p className="text-3xl font-bold text-white">
            Bs. {paidOrders.length > 0 ? (totalSales / paidOrders.length).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-400">Ticket Promedio</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <Clock size={24} className="text-purple-400 mb-2" />
          <p className="text-3xl font-bold text-white">{todayOrders.length}</p>
          <p className="text-sm text-gray-400">Pedidos Totales</p>
        </motion.div>
      </div>

      {/* Breakdown by Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <CreditCard size={18} className="text-blue-400" />
            Por Método de Pago
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <DollarSign size={18} className="text-emerald-400" />
                <span className="text-white">Efectivo</span>
              </div>
              <span className="font-bold text-emerald-400">Bs. {cashAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-blue-400" />
                <span className="text-white">Tarjeta</span>
              </div>
              <span className="font-bold text-blue-400">Bs. {cardAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10">
              <div className="flex items-center gap-3">
                <QrCode size={18} className="text-purple-400" />
                <span className="text-white">QR</span>
              </div>
              <span className="font-bold text-purple-400">Bs. {qrAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="font-semibold text-white">Por Tipo de Pedido</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">🍽️</span>
                <div>
                  <span className="text-white">En Restaurante</span>
                  <p className="text-xs text-gray-500">{dineInOrders.length} pedidos</p>
                </div>
              </div>
              <span className="font-bold text-amber-400">Bs. {dineInTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10">
              <div className="flex items-center gap-3">
                <span className="text-xl">🥡</span>
                <div>
                  <span className="text-white">Para Llevar</span>
                  <p className="text-xs text-gray-500">{takeawayOrders.length} pedidos</p>
                </div>
              </div>
              <span className="font-bold text-orange-400">Bs. {takeawayTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
        <h3 className="font-semibold text-white mb-4">Productos Más Vendidos</h3>
        
        {topItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
        ) : (
          <div className="space-y-2">
            {topItems.map(([name, data], i) => (
              <div key={name} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                <span className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 && "bg-amber-500 text-white",
                  i === 1 && "bg-gray-400 text-white",
                  i === 2 && "bg-orange-600 text-white",
                  i > 2 && "bg-white/10 text-gray-400"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{data.count} unidades</p>
                </div>
                <span className="text-amber-400 font-medium">Bs. {data.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Summary */}
      {isClosed && closingData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Check className="text-emerald-400" />
              Caja Cerrada Exitosamente
            </h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/20">
              <Download size={14} />
              Exportar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">Bs. {closingData.totalSales.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Total Ventas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{closingData.totalOrders}</p>
              <p className="text-xs text-gray-400">Pedidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">Bs. {closingData.cashAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Efectivo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">Bs. {(closingData.cardAmount + closingData.qrAmount).toFixed(2)}</p>
              <p className="text-xs text-gray-400">Digital</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <Lock size={40} className="mx-auto text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">¿Cerrar Caja?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Esta acción registrará el cierre del día con el total de Bs. {totalSales.toFixed(2)}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseCash}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CashierClosing = () => {
  return (
    <RestaurantProvider>
      <CashierClosingContent />
    </RestaurantProvider>
  );
};

export default CashierClosing;
