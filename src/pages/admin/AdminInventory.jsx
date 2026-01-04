import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, Plus, Search, Edit2, Trash2, 
  AlertTriangle, Clock, X, Save, Scale
} from 'lucide-react';
import { clsx } from 'clsx';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';

const categories = [
  { id: 'all', label: 'Todos', emoji: '📦' },
  { id: 'perecedero', label: 'Perecederos', emoji: '🥩' },
  { id: 'no_perecedero', label: 'No Perecederos', emoji: '📦' },
];

const AdminInventoryContent = () => {
  const { 
    ingredients, 
    setIngredients, 
    getLowStockIngredients, 
    getExpiringIngredients 
  } = useRestaurant();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', unit: 'kg', category: 'perecedero', 
    stock: '', minStock: '', expiryDate: '', costPerUnit: '' 
  });

  const lowStockItems = getLowStockIngredients();
  const expiringItems = getExpiringIngredients();

  const filteredIngredients = ingredients.filter(ing => {
    const matchSearch = ing.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || ing.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', unit: 'kg', category: 'perecedero', stock: '', minStock: '', expiryDate: '', costPerUnit: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.stock) return;
    
    const itemData = {
      ...formData,
      stock: parseFloat(formData.stock),
      minStock: parseFloat(formData.minStock) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
    };
    
    if (editingItem) {
      setIngredients(prev => prev.map(i => i.id === editingItem.id ? { ...itemData, id: i.id } : i));
    } else {
      setIngredients(prev => [...prev, { ...itemData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (itemId) => {
    if (confirm('¿Eliminar este ingrediente?')) {
      setIngredients(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const isLowStock = (ing) => ing.stock <= ing.minStock;
  const isExpiring = (ing) => {
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date(ing.expiryDate) <= in7Days;
  };
  const isExpired = (ing) => new Date(ing.expiryDate) < new Date();

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff;
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
            <h1 className="text-2xl font-bold text-white">Inventario</h1>
            <p className="text-sm text-gray-500">Control de ingredientes</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Nuevo Ingrediente</span>
        </motion.button>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lowStockItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={18} />
                <span className="font-semibold">Stock Bajo ({lowStockItems.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.slice(0, 5).map(ing => (
                  <span key={ing.id} className="px-2 py-1 rounded bg-red-500/20 text-xs text-red-400">
                    {ing.name}: {ing.stock} {ing.unit}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          
          {expiringItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock size={18} />
                <span className="font-semibold">Por Vencer ({expiringItems.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {expiringItems.slice(0, 5).map(ing => {
                  const days = getDaysUntilExpiry(ing.expiryDate);
                  return (
                    <span key={ing.id} className={clsx(
                      "px-2 py-1 rounded text-xs",
                      days <= 0 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {ing.name}: {days <= 0 ? 'VENCIDO' : `${days} días`}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ingrediente..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                filterCategory === cat.id ? "bg-amber-500 text-white" : "text-gray-400"
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <Package size={20} className="text-gray-400 mb-2" />
          <p className="text-2xl font-bold text-white">{ingredients.length}</p>
          <p className="text-xs text-gray-500">Total Ingredientes</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Scale size={20} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{ingredients.filter(i => i.stock > i.minStock).length}</p>
          <p className="text-xs text-gray-500">Stock OK</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={20} className="text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">{lowStockItems.length}</p>
          <p className="text-xs text-gray-500">Stock Bajo</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Clock size={20} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{expiringItems.length}</p>
          <p className="text-xs text-gray-500">Por Vencer</p>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredIngredients.map((ing, idx) => (
            <motion.div
              key={ing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: idx * 0.03 }}
              className={clsx(
                "p-4 rounded-xl border flex items-center justify-between",
                isExpired(ing) 
                  ? "bg-red-500/10 border-red-500/30" 
                  : isLowStock(ing)
                    ? "bg-orange-500/10 border-orange-500/30"
                    : isExpiring(ing)
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-white/[0.02] border-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                  ing.category === 'perecedero' ? "bg-red-500/20" : "bg-blue-500/20"
                )}>
                  {ing.category === 'perecedero' ? '🥩' : '📦'}
                </div>
                <div>
                  <p className="font-medium text-white">{ing.name}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={clsx(
                      "font-semibold",
                      isLowStock(ing) ? "text-red-400" : "text-emerald-400"
                    )}>
                      {ing.stock} {ing.unit}
                    </span>
                    <span className="text-gray-500">
                      (mín: {ing.minStock})
                    </span>
                    <span className="text-gray-500">
                      Bs. {ing.costPerUnit}/{ing.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isExpired(ing) && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/30 text-red-400 font-medium">
                        ⚠️ VENCIDO
                      </span>
                    )}
                    {!isExpired(ing) && isExpiring(ing) && (
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-500/30 text-amber-400">
                        ⏰ Vence en {getDaysUntilExpiry(ing.expiryDate)} días
                      </span>
                    )}
                    {isLowStock(ing) && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                        📉 Stock bajo
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(ing)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ing.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Stock Actual</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Stock Mínimo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Unidad</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="kg">Kilogramo (kg)</option>
                      <option value="lt">Litro (lt)</option>
                      <option value="unidad">Unidad</option>
                      <option value="paquete">Paquete</option>
                      <option value="botella">Botella</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Costo por Unidad</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Categoría</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, category: 'perecedero' }))}
                      className={clsx(
                        "p-3 rounded-xl border flex items-center gap-2 transition-all",
                        formData.category === 'perecedero' 
                          ? "bg-red-500/20 border-red-500/50 text-red-400" 
                          : "bg-white/5 border-white/10 text-gray-400"
                      )}
                    >
                      <span>🥩</span>
                      <span className="text-sm">Perecedero</span>
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, category: 'no_perecedero' }))}
                      className={clsx(
                        "p-3 rounded-xl border flex items-center gap-2 transition-all",
                        formData.category === 'no_perecedero' 
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                          : "bg-white/5 border-white/10 text-gray-400"
                      )}
                    >
                      <span>📦</span>
                      <span className="text-sm">No Perecedero</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminInventory = () => {
  return (
    <RestaurantProvider>
      <AdminInventoryContent />
    </RestaurantProvider>
  );
};

export default AdminInventory;
