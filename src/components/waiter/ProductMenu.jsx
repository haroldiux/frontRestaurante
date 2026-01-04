import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';

const categories = [
  { id: 'entradas', label: 'Entradas', short: '🥗' },
  { id: 'platos', label: 'Platos', short: '🍖' },
  { id: 'bebidas', label: 'Bebidas', short: '🍹' },
  { id: 'postres', label: 'Postres', short: '🍰' },
];

const ProductMenu = () => {
  const { products, addToCart, cart, selectedTable, orderMode } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState('entradas');

  const filteredProducts = products.filter(p => p.category === activeCategory);

  const isInCart = (productId) => {
    return cart.some(item => item.product.id === productId);
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const canShowMenu = selectedTable || orderMode === 'takeaway';

  if (!canShowMenu) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center p-4 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👆</div>
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Selecciona una mesa</h3>
        <p className="text-xs sm:text-sm text-gray-500">Elige una mesa del mapa para comenzar</p>
      </div>
    );
  }

  const isTakeaway = orderMode === 'takeaway';

  return (
    <div className="space-y-3">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Menú</h2>
          {isTakeaway ? (
            <p className="text-xs text-orange-400 flex items-center gap-1">
              <ShoppingBag size={10} />
              Pedido Para Llevar
            </p>
          ) : (
            <p className="text-xs text-gray-500">Mesa {selectedTable?.number}</p>
          )}
        </div>
      </div>

      {/* Category Tabs - Responsivo */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              "flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all",
              activeCategory === cat.id
                ? isTakeaway
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            )}
          >
            <span className="text-base sm:text-lg">{cat.short}</span>
            <span className="truncate w-full text-center">{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Products Grid - Responsivo */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const inCart = isInCart(product.id);
            const quantity = getCartQuantity(product.id);
            
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -2 }}
                className={clsx(
                  "relative rounded-xl overflow-hidden bg-white/[0.03] border transition-all cursor-pointer group",
                  inCart 
                    ? isTakeaway
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : "border-amber-500/50 shadow-lg shadow-amber-500/10" 
                    : "border-white/10 hover:border-white/20"
                )}
                onClick={() => addToCart(product)}
              >
                {/* Image */}
                <div className="relative h-16 sm:h-20 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Add Button */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={clsx(
                      "absolute bottom-1 right-1 p-1 sm:p-1.5 rounded-full transition-all",
                      inCart
                        ? isTakeaway ? "bg-orange-500 text-white" : "bg-amber-500 text-white"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    )}
                  >
                    {inCart ? <Check size={10} className="sm:w-3 sm:h-3" /> : <Plus size={10} className="sm:w-3 sm:h-3" />}
                  </motion.div>

                  {/* Quantity Badge */}
                  {quantity > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={clsx(
                        "absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-white text-[8px] sm:text-[10px] font-bold flex items-center justify-center",
                        isTakeaway ? "bg-orange-500" : "bg-amber-500"
                      )}
                    >
                      {quantity}
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="p-1.5 sm:p-2">
                  <h4 className="text-[10px] sm:text-xs font-medium text-white truncate leading-tight">{product.name}</h4>
                  <p className={clsx(
                    "text-[10px] sm:text-xs font-bold",
                    isTakeaway ? "text-orange-400" : "text-amber-400"
                  )}>
                    Bs. {product.price.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProductMenu;
