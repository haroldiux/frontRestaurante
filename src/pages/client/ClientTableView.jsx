import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Bell, Check, ChefHat, Sparkles, QrCode, CreditCard } from 'lucide-react';
import { clsx } from 'clsx';

// Storage key igual que RestaurantContext
const STORAGE_KEY = 'restaurant_data';

const ClientTableView = () => {
  const { tableNumber } = useParams();
  const [table, setTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Cargar datos de la mesa
  useEffect(() => {
    const loadTable = () => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const foundTable = parsed.tables?.find(t => t.number === parseInt(tableNumber));
        setTable(foundTable || null);
      }
      setIsLoading(false);
    };

    loadTable();

    // Escuchar cambios en tiempo real
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) loadTable();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Polling cada 2s para detectar cambios (mismo tab)
    const interval = setInterval(loadTable, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [tableNumber]);

  // Auto-ocupar mesa al cargar si está libre
  useEffect(() => {
    if (table && table.status === 'free') {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const updatedTables = parsed.tables.map(t => {
          if (t.number === parseInt(tableNumber)) {
            return {
              ...t,
              status: 'occupied',
              occupiedSince: new Date().toISOString(),
            };
          }
          return t;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, tables: updatedTables }));
        setTable(prev => prev ? { ...prev, status: 'occupied', occupiedSince: new Date().toISOString() } : null);
      }
    }
  }, [table?.status, tableNumber]);

  const handleCallWaiter = (type) => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const updatedTables = parsed.tables.map(t => {
        if (t.number === parseInt(tableNumber)) {
          return {
            ...t,
            callRequest: {
              type,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return t;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, tables: updatedTables }));
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#080809] via-[#0c0c0f] to-[#0a0a0d] flex items-center justify-center">
        <div className="text-amber-500">Cargando...</div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#080809] via-[#0c0c0f] to-[#0a0a0d] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Mesa no encontrada</h1>
          <p className="text-gray-500">Esta mesa no existe en el sistema</p>
        </div>
      </div>
    );
  }

  const hasActiveCall = table.callRequest && table.callRequest.type;
  const hasPendingPayment = table.pendingPayment && table.pendingPayment.amount;

  // Si hay pago pendiente con QR, mostrar pantalla de pago
  if (hasPendingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#080809] via-[#0c0c0f] to-[#0a0a0d] text-white flex flex-col">
        {/* Header */}
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4"
          >
            <CreditCard size={16} className="text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Pago Pendiente</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Mesa {table.number}</h1>
            <p className="text-gray-500">Escanea el código QR para pagar</p>
          </motion.div>
        </div>

        {/* QR Payment Section */}
        <div className="flex-1 px-6 py-4 flex flex-col items-center justify-center gap-6">
          {/* Amount */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-gray-400 text-sm mb-1">Total a pagar</p>
            <p className="text-5xl font-bold text-white">Bs. {table.pendingPayment.amount.toFixed(2)}</p>
          </motion.div>

          {/* QR Code (simulated) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-3xl shadow-2xl"
          >
            <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* Simulated QR pattern */}
              <div className="absolute inset-4 grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "rounded-sm",
                      Math.random() > 0.5 ? "bg-gray-900" : "bg-transparent"
                    )}
                  />
                ))}
              </div>
              {/* Center logo */}
              <div className="absolute w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md z-10">
                <QrCode size={24} className="text-blue-500" />
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center max-w-xs"
          >
            <p className="text-gray-400 text-sm">
              Escanea con la app de tu banco para completar el pago
            </p>
          </motion.div>

          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-blue-400"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm">Esperando pago...</span>
          </motion.div>

          {/* Simulate Payment Button (for demo) */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Marcar pago como "pagado por cliente" - esperando confirmación de caja
              const savedData = localStorage.getItem(STORAGE_KEY);
              if (savedData) {
                const parsed = JSON.parse(savedData);
                const updatedTables = parsed.tables.map(t => {
                  if (t.number === parseInt(tableNumber)) {
                    return {
                      ...t,
                      pendingPayment: {
                        ...t.pendingPayment,
                        clientPaid: true,
                        paidAt: new Date().toISOString(),
                        method: 'qr'
                      }
                    };
                  }
                  return t;
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, tables: updatedTables }));
              }
            }}
            className={clsx(
              "px-6 py-3 rounded-xl font-semibold flex items-center gap-2",
              table.pendingPayment?.clientPaid 
                ? "bg-emerald-500 text-white cursor-default"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            )}
            disabled={table.pendingPayment?.clientPaid}
          >
            {table.pendingPayment?.clientPaid ? (
              <>
                <Check size={18} />
                Pago Enviado - Esperando Caja
              </>
            ) : (
              <>
                <QrCode size={18} />
                Simular Pago Completado
              </>
            )}
          </motion.button>

          {table.pendingPayment?.clientPaid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-400/70 text-center"
            >
              ✓ Tu pago fue enviado. El cajero lo confirmará en breve.
            </motion.p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-xs text-gray-600">Powered by Gusto POS</p>
        </div>
      </div>
    );
  }

  // Vista normal de la mesa
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080809] via-[#0c0c0f] to-[#0a0a0d] text-white flex flex-col">
      {/* Confirmation Toast */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-4 right-4 z-50"
          >
            <div className="bg-emerald-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl shadow-emerald-500/25">
              <div className="p-2 bg-white/20 rounded-full">
                <Check size={20} />
              </div>
              <div>
                <p className="font-semibold">¡Solicitud enviada!</p>
                <p className="text-sm text-emerald-100">El mesero viene en camino</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-4"
        >
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-amber-400 font-medium text-sm">Gusto Restaurant</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2">Mesa {table.number}</h1>
          <p className="text-gray-500">¡Bienvenido! ¿En qué podemos ayudarte?</p>
        </motion.div>
      </div>

      {/* Main Actions */}
      <div className="flex-1 px-6 py-4 flex flex-col gap-4">
        {/* Listo para ordenar */}
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCallWaiter('order')}
          disabled={hasActiveCall && table.callRequest?.type === 'order'}
          className={clsx(
            "relative flex-1 min-h-[140px] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all overflow-hidden",
            hasActiveCall && table.callRequest?.type === 'order'
              ? "bg-emerald-500/20 border-2 border-emerald-500"
              : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/25"
          )}
        >
          {hasActiveCall && table.callRequest?.type === 'order' ? (
            <>
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
              <Check size={48} className="text-emerald-400" />
              <span className="text-xl font-bold text-emerald-400">Mesero en camino</span>
              <span className="text-sm text-emerald-300">Ya recibimos tu solicitud</span>
            </>
          ) : (
            <>
              <Bell size={48} className="text-white" />
              <span className="text-2xl font-bold text-white">Listo para Ordenar</span>
              <span className="text-sm text-white/80">Llamar al mesero</span>
            </>
          )}
        </motion.button>

        {/* Pedir la cuenta */}
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCallWaiter('bill')}
          disabled={hasActiveCall && table.callRequest?.type === 'bill'}
          className={clsx(
            "relative min-h-[100px] rounded-3xl p-6 flex items-center justify-center gap-4 transition-all",
            hasActiveCall && table.callRequest?.type === 'bill'
              ? "bg-emerald-500/20 border-2 border-emerald-500"
              : "bg-white/[0.03] border-2 border-white/10 hover:border-white/20"
          )}
        >
          {hasActiveCall && table.callRequest?.type === 'bill' ? (
            <>
              <Check size={32} className="text-emerald-400" />
              <span className="text-lg font-bold text-emerald-400">Cuenta solicitada</span>
            </>
          ) : (
            <>
              <Receipt size={32} className="text-amber-400" />
              <span className="text-lg font-bold text-white">Pedir la Cuenta</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Status Info */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6"
      >
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <ChefHat size={18} className="text-amber-500" />
            <span>Disfruta tu experiencia en Gusto</span>
          </div>
        </div>

        {/* Footer branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">Powered by Gusto POS</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientTableView;
