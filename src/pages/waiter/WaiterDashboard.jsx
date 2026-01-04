import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';
import TableMap from '../../components/waiter/TableMap';
import ProductMenu from '../../components/waiter/ProductMenu';
import OrderCart from '../../components/waiter/OrderCart';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ShoppingBag, ShoppingCart, X, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

const WaiterDashboardContent = () => {
  const { orderMode, switchOrderMode, cart, selectedTable, getCartTotal, getTableTotal, getTableOrders } = useRestaurant();
  const [showCart, setShowCart] = useState(false);
  const [activeSection, setActiveSection] = useState('tables'); // 'tables' | 'menu' para móvil
  
  const total = getCartTotal();
  const tableOrders = selectedTable ? getTableOrders(selectedTable.id) : [];
  const tableTotal = selectedTable ? getTableTotal(selectedTable.id) : 0;
  const hasItems = cart.length > 0 || tableOrders.length > 0;
  const isTakeaway = orderMode === 'takeaway';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Mode Toggle - Siempre visible, sticky */}
      <div className="flex items-center justify-center py-2 px-2 bg-[#080809]/80 backdrop-blur-sm sticky top-0 z-20 shrink-0">
        <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex gap-1 w-full max-w-sm">
          <button
            onClick={() => switchOrderMode('dine-in')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              orderMode === 'dine-in'
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <UtensilsCrossed size={14} />
            <span>En Mesa</span>
          </button>
          <button
            onClick={() => switchOrderMode('takeaway')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              orderMode === 'takeaway'
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ShoppingBag size={14} />
            <span>Llevar</span>
          </button>
        </div>
      </div>

      {/* Mobile Section Tabs (solo si es dine-in) */}
      {!isTakeaway && (
        <div className="lg:hidden flex gap-1 px-2 py-1 shrink-0">
          <button
            onClick={() => setActiveSection('tables')}
            className={clsx(
              "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
              activeSection === 'tables'
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-white/5 text-gray-400 border border-transparent"
            )}
          >
            Mesas
          </button>
          <button
            onClick={() => setActiveSection('menu')}
            className={clsx(
              "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
              activeSection === 'menu'
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-white/5 text-gray-400 border border-transparent"
            )}
          >
            Menú {selectedTable && `(Mesa ${selectedTable.number})`}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-4 overflow-hidden px-2 pb-20 lg:pb-2">
        
        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:contents">
          {/* Left: Table Map */}
          {!isTakeaway && (
            <div className="w-[300px] shrink-0 overflow-y-auto">
              <TableMap />
            </div>
          )}

          {/* Middle: Product Menu */}
          <div className={clsx(
            "flex-1 overflow-y-auto",
            isTakeaway && "max-w-4xl mx-auto"
          )}>
            <ProductMenu />
          </div>

          {/* Right: Order Cart */}
          <div className="w-[300px] shrink-0">
            <div className="h-full bg-white/[0.02] border border-white/10 rounded-2xl p-3 overflow-hidden">
              <OrderCart />
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="lg:hidden flex-1 overflow-hidden">
          {isTakeaway ? (
            // Takeaway: solo menú
            <div className="h-full overflow-y-auto pb-4">
              <ProductMenu />
            </div>
          ) : activeSection === 'tables' ? (
            // Mesas
            <div className="h-full overflow-y-auto pb-4">
              <TableMap />
            </div>
          ) : (
            // Menú
            <div className="h-full overflow-y-auto pb-4">
              <ProductMenu />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Cart Button / Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <AnimatePresence>
          {showCart ? (
            // Cart Expanded
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-[#0d0d12] border-t border-white/10 rounded-t-2xl max-h-[70vh] flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/5">
                <h3 className="text-white font-semibold">
                  {isTakeaway ? 'Pedido Para Llevar' : `Mesa ${selectedTable?.number || '-'}`}
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto p-3">
                <OrderCart />
              </div>
            </motion.div>
          ) : (
            // Cart Collapsed Button
            (hasItems || selectedTable || isTakeaway) && (
              <motion.button
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                onClick={() => setShowCart(true)}
                className={clsx(
                  "w-full p-4 flex items-center justify-between",
                  "bg-gradient-to-r shadow-2xl",
                  isTakeaway 
                    ? "from-orange-500 to-red-600" 
                    : "from-amber-500 to-orange-600"
                )}
              >
                <div className="flex items-center gap-3 text-white">
                  {isTakeaway ? <ShoppingBag size={20} /> : <ShoppingCart size={20} />}
                  <span className="font-medium">
                    {cart.length > 0 
                      ? `${cart.length} producto${cart.length > 1 ? 's' : ''}`
                      : selectedTable 
                        ? `Mesa ${selectedTable.number}`
                        : 'Ver carrito'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="font-bold text-lg">Bs. {(total + tableTotal).toFixed(2)}</span>
                  <ChevronUp size={20} />
                </div>
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const WaiterDashboard = () => {
  return (
    <RestaurantProvider>
      <WaiterDashboardContent />
    </RestaurantProvider>
  );
};

export default WaiterDashboard;
