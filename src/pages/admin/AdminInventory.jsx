import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, Plus, Search, Edit2, Trash2, 
  AlertTriangle, Clock, X, Save, Scale, Loader2, Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';
import { toast } from 'sonner';

const categoryConfig = {
  perecedero: { label: 'Perecederos', emoji: '🥩' },
  no_perecedero: { label: 'No Perecederos', emoji: '📦' },
};

const EMOJI_LIST = [
  '🥩', '🍗', '🍖', '🥓', '🍔', '🌭', // Carnes
  '🥬', '🥦', '🥕', '🌽', '🥔', '🍅', '🍆', '🌶️', '🍄', '🧅', '🧄', // Verduras
  '🍎', '🍌', '🍇', '🍊', '🍋', '🍍', '🍓', '🍒', '🥑', // Frutas
  '🥚', '🧀', '🥛', '🧈', '🍞', '🥐', // Lacteos/Pan
  '🍚', '🍝', '🍜', '🍱', '🥣', // Platos/Granos
  '🧂', '🥫', '🍶', '🍾', '🍷', '🍺', '🍻', '🥃', '🥤', '🧃', '🧉', // Bebidas/Condimentos
  '🧊', '🍫', '🍬', '🍪', '📦', '🥡' // Otros
];

const AdminInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Backend Keys: nombre, categoria_id, unidad_medida, stock_actual, stock_minimo, costo_unitario, fecha_vencimiento, icono
  const [formData, setFormData] = useState({ 
    nombre: '', categoria_id: '', unidad_medida: 'kg', 
    stock_actual: '', stock_minimo: '', costo_unitario: '', fecha_vencimiento: '', icono: '' 
  });
  const [formLoading, setFormLoading] = useState(false);

  const formatQuantity = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '0' : num.toString();
  };

  const fetchData = async () => {
      try {
          const [ingRes, catRes] = await Promise.all([
              api.get('/ingredients'),
              api.get('/categories') // We will filter 'inventario' type locally
          ]);
          setIngredients(ingRes.data);
          // Filter categories for inventory only
          setCategories(catRes.data.filter(c => c.tipo === 'inventario'));
      } catch (error) {
          console.error("Error loading inventory:", error);
          toast.error("Error al cargar inventario");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  const getLowStockItems = () => ingredients.filter(i => parseFloat(i.stock_actual) <= parseFloat(i.stock_minimo));

  const getExpiringItems = () => {
      const today = new Date();
      const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return ingredients.filter(i => {
          if (!i.fecha_vencimiento || i.categoria?.nombre === 'no_perecedero') return false;
          const expiry = new Date(i.fecha_vencimiento);
          return expiry > today && expiry <= in7Days;
      });
  };
  
  const getExpiredItems = () => {
    return ingredients.filter(i => {
        if (!i.fecha_vencimiento || i.categoria?.nombre === 'no_perecedero') return false;
        return new Date(i.fecha_vencimiento) < new Date();
    });
  };

  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems();
  const expiredItems = getExpiredItems(); // Also good to showing expired ones separately maybe?

  const filteredIngredients = ingredients.filter(ing => {
    const catName = ing.categoria?.nombre || '';
    const matchSearch = ing.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || catName === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
          nombre: item.nombre, 
          categoria_id: item.categoria_id, 
          unidad_medida: item.unidad_medida, 
          stock_actual: item.stock_actual, 
          stock_minimo: item.stock_minimo, 
          costo_unitario: item.costo_unitario || '', 
          fecha_vencimiento: item.fecha_vencimiento || '',
          icono: item.icono || ''
      });
    } else {
      setEditingItem(null);
      // Default category
      const defaultCat = categories.find(c => c.nombre === 'perecedero')?.id || (categories[0]?.id || '');
      setFormData({ 
          nombre: '', categoria_id: defaultCat, unidad_medida: 'kg', 
          stock_actual: '', stock_minimo: '', costo_unitario: '', fecha_vencimiento: '', icono: '' 
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.stock_actual || !formData.categoria_id) {
        toast.error("Complete campos obligatorios");
        return;
    }
    
    setFormLoading(true);
    try {
        const payload = { 
            ...formData, 
            stock_actual: parseFloat(formData.stock_actual),
            stock_minimo: parseFloat(formData.stock_minimo),
            costo_unitario: parseFloat(formData.costo_unitario) || 0
        };
        
        if (editingItem) {
            const res = await api.put(`/ingredients/${editingItem.id}`, payload);
            setIngredients(prev => prev.map(i => i.id === editingItem.id ? res.data : i));
            toast.success("Ingrediente actualizado");
        } else {
            const res = await api.post('/ingredients', payload);
            setIngredients(prev => [...prev, res.data]);
            toast.success("Ingrediente creado");
        }
        setShowModal(false);
    } catch (error) {
        console.error("Error save:", error);
        toast.error("Error al guardar ingrediente");
    } finally {
        setFormLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (confirm('¿Eliminar este ingrediente permanentemente?')) {
        try {
            await api.delete(`/ingredients/${itemId}`);
            setIngredients(prev => prev.filter(i => i.id !== itemId));
            toast.success("Ingrediente eliminado");
        } catch (error) {
            console.error("Error delete:", error);
            toast.error("Error al eliminar");
        }
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isExpired = (ing) => {
      if (!ing.fecha_vencimiento) return false;
      return new Date(ing.fecha_vencimiento) < new Date();
  };

  const CategoryButton = ({ cat, selected, onClick }) => {
      const config = categoryConfig[cat.nombre] || { label: cat.nombre, emoji: '📦' };
      return (
        <button
            onClick={onClick}
            className={clsx(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
            selected ? "bg-amber-500 text-white" : "bg-white/5 text-gray-400"
            )}
        >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
        </button>
      )
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
      {(lowStockItems.length > 0 || expiringItems.length > 0 || expiredItems.length > 0) && (
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
                    {ing.nombre}: {ing.stock_actual} {ing.unidad_medida}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          
          {(expiringItems.length > 0 || expiredItems.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock size={18} />
                <span className="font-semibold">Vencimientos ({expiringItems.length + expiredItems.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {expiredItems.slice(0, 3).map(ing => (
                    <span key={ing.id} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 font-bold">
                        {ing.nombre}: VENCIDO
                    </span>
                ))}
                {expiringItems.slice(0, 3).map(ing => {
                  const days = getDaysUntilExpiry(ing.fecha_vencimiento);
                  return (
                    <span key={ing.id} className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">
                      {ing.nombre}: {days} días
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
                <CategoryButton 
                    key={cat.id} 
                    cat={cat} 
                    selected={filterCategory === cat.nombre} 
                    onClick={() => setFilterCategory(cat.nombre)} 
                />
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
          <p className="text-2xl font-bold text-white">{ingredients.filter(i => parseFloat(i.stock_actual) > parseFloat(i.stock_minimo)).length}</p>
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
      {loading ? (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : (
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
                  : parseFloat(ing.stock_actual) <= parseFloat(ing.stock_minimo)
                    ? "bg-orange-500/10 border-orange-500/30"
                    : (ing.fecha_vencimiento && getDaysUntilExpiry(ing.fecha_vencimiento) <= 7)
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-white/[0.02] border-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                  ing.categoria?.nombre === 'perecedero' ? "bg-red-500/20" : "bg-blue-500/20"
                )}>
                  {ing.icono ? ing.icono : (ing.categoria?.nombre === 'perecedero' ? '🥩' : '📦')}
                </div>
                <div>
                  <p className="font-medium text-white">{ing.nombre}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={clsx(
                      "font-semibold",
                      parseFloat(ing.stock_actual) <= parseFloat(ing.stock_minimo) ? "text-red-400" : "text-emerald-400"
                    )}>
                      {formatQuantity(ing.stock_actual)} {ing.unidad_medida}
                    </span>
                    <span className="text-gray-500">
                      (mín: {formatQuantity(ing.stock_minimo)})
                    </span>
                    <span className="text-gray-500">
                      Bs. {ing.costo_unitario}/{ing.unidad_medida}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isExpired(ing) && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/30 text-red-400 font-medium">
                        ⚠️ VENCIDO
                      </span>
                    )}
                    {!isExpired(ing) && ing.fecha_vencimiento && getDaysUntilExpiry(ing.fecha_vencimiento) <= 7 && (
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-500/30 text-amber-400">
                        ⏰ Vence en {getDaysUntilExpiry(ing.fecha_vencimiento)} días
                      </span>
                    )}
                    {parseFloat(ing.stock_actual) <= parseFloat(ing.stock_minimo) && (
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
        {!loading && filteredIngredients.length === 0 && (
            <div className="text-center py-12 text-gray-500">No se encontraron ingredientes</div>
        )}
      </div>
      )}

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
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Icono</label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10 max-h-32 overflow-y-auto">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setFormData(prev => ({ ...prev, icono: emoji }))}
                        className={clsx(
                          "w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors",
                          formData.icono === emoji 
                            ? "bg-amber-500 text-white" 
                            : "hover:bg-white/10 text-gray-400"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {/* Custom input fallback */}
                  <div className="mt-2">
                    <input 
                        type="text" 
                        placeholder="O escribe tu propio emoji..." 
                        value={formData.icono}
                        onChange={(e) => setFormData(prev => ({ ...prev, icono: e.target.value }))}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Stock Actual</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_actual: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Stock Mínimo</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_minimo: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Unidad</label>
                    <select
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData(prev => ({ ...prev, unidad_medida: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option className="bg-[#1a1a1f] text-white" value="kg">Kilogramo (kg)</option>
                      <option className="bg-[#1a1a1f] text-white" value="lt">Litro (lt)</option>
                      <option className="bg-[#1a1a1f] text-white" value="unidad">Unidad</option>
                      <option className="bg-[#1a1a1f] text-white" value="paquete">Paquete</option>
                      <option className="bg-[#1a1a1f] text-white" value="botella">Botella</option>
                      <option className="bg-[#1a1a1f] text-white" value="gr">Gramo (gr)</option>
                      <option className="bg-[#1a1a1f] text-white" value="ml">Mililitro (ml)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Costo por Unidad</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo_unitario}
                      onChange={(e) => setFormData(prev => ({ ...prev, costo_unitario: e.target.value }))}
                      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Categoría</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFormData(prev => ({ ...prev, categoria_id: cat.id }))}
                            className={clsx(
                                "p-3 rounded-xl border flex items-center gap-2 transition-all",
                                formData.categoria_id === cat.id 
                                ? clsx("bg-opacity-20 border-opacity-50", cat.nombre === 'perecedero' ? "bg-red-500 border-red-500 text-red-400" : "bg-blue-500 border-blue-500 text-blue-400")
                                : "bg-white/5 border-white/10 text-gray-400"
                            )}
                        >
                            <span>{cat.nombre === 'perecedero' ? '🥩' : '📦'}</span>
                            <span className="text-sm capitalize">{cat.nombre.replace('_', ' ')}</span>
                        </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Fecha de Vencimiento</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="date"
                        value={formData.fecha_vencimiento}
                        onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                        className="w-full mt-1 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
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
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="animate-spin" /> : <Save size={16} />}
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

export default AdminInventory;
