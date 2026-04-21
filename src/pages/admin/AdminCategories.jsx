import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Search, Edit2, Trash2, 
  Tag, X, Save, CheckCircle, Smartphone, ToggleLeft, ToggleRight
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';
import { toast } from 'sonner';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ 
        nombre: '', tipo: 'menu', activo: true, icono: '🍽️' 
    });
    const [formLoading, setFormLoading] = useState(false);

    // Emoji picker suggestions
    const emojiIcons = ['🥗', '🍖', '🍹', '🍰', '🥩', '📦', '🍔', '🍕', '🌮', '🥣', '🍣', '🍱', '🍦', '🍩', '🍪', '🍫', '🍷', '🍺', '☕', '🍗', '🍞', '🧀', '🥚', '🥛'];

    const fetchData = async () => {
        try {
            const res = await api.get('/categories');
            // Filter to show ONLY menu categories as requested
            setCategories(res.data.filter(c => c.tipo === 'menu'));
        } catch (error) {
            console.error("Error loading categories:", error);
            toast.error("Error al cargar categorías");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ 
                nombre: item.nombre, 
                tipo: item.tipo, 
                activo: Boolean(item.activo),
                icono: item.icono || '🍽️'
            });
        } else {
            setEditingItem(null);
            setFormData({ 
                nombre: '', tipo: 'menu', activo: true, icono: '🍽️' 
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.nombre) return toast.error("El nombre es obligatorio");

        setFormLoading(true);
        try {
            if (editingItem) {
                const res = await api.put(`/categories/${editingItem.id}`, formData);
                setCategories(prev => prev.map(c => c.id === editingItem.id ? res.data : c));
                toast.success("Categoría actualizada");
            } else {
                const res = await api.post('/categories', formData);
                setCategories(prev => [...prev, res.data]);
                toast.success("Categoría creada");
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Error al guardar categoría");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar categoría? Si tiene productos asociados podría fallar.")) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success("Categoría eliminada");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar");
        }
    };

    const handleToggleStatus = async (cat) => {
        try {
            const newStatus = !cat.activo;
            const res = await api.put(`/categories/${cat.id}`, { ...cat, activo: newStatus });
            setCategories(prev => prev.map(c => c.id === cat.id ? res.data : c));
            toast.success(`Categoría ${newStatus ? 'activada' : 'desactivada'}`);
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar estado");
        }
    };

    const filteredCategories = categories.filter(c => 
        c.nombre.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Categorías</h1>
                        <p className="text-sm text-gray-500">Gestión de tipos de productos e inventario</p>
                    </div>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Nueva Categoría</span>
                </motion.button>
            </div>

            {/* List */}
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 mb-4"
                />
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {filteredCategories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-violet-500/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl bg-white/5 p-2 rounded-lg">{cat.icono || '🍽️'}</span>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{cat.nombre}</h3>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleToggleStatus(cat)}
                                    className={clsx(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                                        cat.activo 
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                                            : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                    )}
                                >
                                    {cat.activo ? <ToggleRight /> : <ToggleLeft />}
                                    {cat.activo ? 'Activo' : 'Inactivo'}
                                </button>
                                <button onClick={() => handleOpenModal(cat)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
                                    <Edit2 size={18} />
                                </button>
                                {cat.tipo !== 'inventario' && ( // Prevent deleting critical inventory cats easily if desired, or allow all
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-red-400">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1f] w-full max-w-md rounded-2xl border border-white/10 p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-white mb-4">
                                {editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Nombre</label>
                                    <input 
                                        type="text" 
                                        value={formData.nombre}
                                        onChange={e => setFormData(prev => ({...prev, nombre: e.target.value}))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                                        placeholder="Ej. Entradas"
                                    />
                                </div>
                                


                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Icono</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {emojiIcons.map(icon => (
                                            <button 
                                                key={icon}
                                                onClick={() => setFormData(prev => ({...prev, icono: icon}))}
                                                className={clsx(
                                                    "h-10 rounded-lg flex items-center justify-center text-xl transition-all",
                                                    formData.icono === icon 
                                                        ? "bg-violet-500 text-white ring-2 ring-violet-500 ring-offset-2 ring-offset-[#1a1a1f]" 
                                                        : "bg-white/5 text-white hover:bg-white/10"
                                                )}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 font-medium">Cancelar</button>
                                <button 
                                    onClick={handleSave} 
                                    disabled={formLoading}
                                    className="flex-1 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {formLoading ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategories;
