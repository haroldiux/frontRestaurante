import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, UtensilsCrossed, Plus, Search, Edit2, Trash2, 
  ToggleLeft, ToggleRight, X, Save, DollarSign, Tag
} from 'lucide-react';
import { clsx } from 'clsx';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';

const categories = [
  { id: 'entradas', label: 'Entradas', emoji: '🥗' },
  { id: 'platos', label: 'Platos', emoji: '🍖' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🍹' },
  { id: 'postres', label: 'Postres', emoji: '🍰' },
];

const AdminMenuContent = () => {
  const { products } = useRestaurant();
  const [menuItems, setMenuItems] = useState(products);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', price: '', category: 'entradas', 
    description: '', available: true, image: '' 
  });

  const filteredItems = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item, available: item.available !== false });
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: '', category: 'entradas', description: '', available: true, image: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;
    
    const itemData = {
      ...formData,
      price: parseFloat(formData.price),
      image: formData.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop`
    };
    
    if (editingItem) {
      setMenuItems(prev => prev.map(i => i.id === editingItem.id ? { ...itemData, id: i.id } : i));
    } else {
      setMenuItems(prev => [...prev, { ...itemData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (itemId) => {
    if (confirm('¿Eliminar este producto?')) {
      setMenuItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const toggleAvailability = (itemId) => {
    setMenuItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, available: !i.available } : i
    ));
  };

  const getCategoryInfo = (catId) => categories.find(c => c.id === catId) || categories[0];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Menú</h1>
            <p className="text-sm text-gray-500">Gestiona los productos del menú</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Nuevo Producto</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              filterCategory === 'all' ? "bg-amber-500 text-white" : "text-gray-400"
            )}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1",
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
          <UtensilsCrossed size={20} className="text-gray-400 mb-2" />
          <p className="text-2xl font-bold text-white">{menuItems.length}</p>
          <p className="text-xs text-gray-500">Total Productos</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <ToggleRight size={20} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{menuItems.filter(i => i.available !== false).length}</p>
          <p className="text-xs text-gray-500">Disponibles</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <ToggleLeft size={20} className="text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">{menuItems.filter(i => i.available === false).length}</p>
          <p className="text-xs text-gray-500">No Disponibles</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <DollarSign size={20} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">Bs. {Math.round(menuItems.reduce((s, i) => s + i.price, 0) / menuItems.length || 0)}</p>
          <p className="text-xs text-gray-500">Precio Promedio</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredItems.map((item, idx) => {
            const catInfo = getCategoryInfo(item.category);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className={clsx(
                  "rounded-xl border overflow-hidden",
                  item.available !== false 
                    ? "bg-white/[0.02] border-white/5" 
                    : "bg-white/[0.01] border-white/5 opacity-60"
                )}
              >
                <div className="relative h-32">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-xs text-white">
                      {catInfo.emoji} {catInfo.label}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={clsx(
                        "p-1.5 rounded-lg transition-all",
                        item.available !== false 
                          ? "bg-emerald-500/80 text-white" 
                          : "bg-red-500/80 text-white"
                      )}
                    >
                      {item.available !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-white truncate">{item.name}</h3>
                  <p className="text-lg font-bold text-amber-400">Bs. {item.price.toFixed(2)}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1"
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="py-2 px-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
                  {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
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
                <div>
                  <label className="text-sm text-gray-400">Precio (Bs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Categoría</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                        className={clsx(
                          "p-3 rounded-xl border flex items-center gap-2 transition-all",
                          formData.category === cat.id 
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                            : "bg-white/5 border-white/10 text-gray-400"
                        )}
                      >
                        <span>{cat.emoji}</span>
                        <span className="text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">URL de Imagen (opcional)</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
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

const AdminMenu = () => {
  return (
    <RestaurantProvider>
      <AdminMenuContent />
    </RestaurantProvider>
  );
};

export default AdminMenu;
