import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Plus, Search, Edit2, Trash2, 
  ChefHat, UtensilsCrossed, Shield, UserCheck, X, Save, Wallet, UserCircle2, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';
import { toast } from 'sonner';

// Configuración visual de roles (iconos y colores)
const roleConfig = {
  admin: { label: 'Administrador', icon: Shield, color: 'purple' },
  waiter: { label: 'Mesero', icon: UtensilsCrossed, color: 'amber' },
  kitchen: { label: 'Cocina', icon: ChefHat, color: 'orange' },
  cashier: { label: 'Caja', icon: Wallet, color: 'emerald' },
  client: { label: 'Cliente', icon: UserCircle2, color: 'blue' },
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol_id: '', estado: 'activo' });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    try {
        const [usersRes, rolesRes] = await Promise.all([
            api.get('/users'),
            api.get('/roles')
        ]);
        setUsers(usersRes.data);
        setRolesList(rolesRes.data);
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar usuarios");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) || 
                       u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || (u.rol && u.rol.id == filterRole); // Comparación laxa por si string/number
    return matchSearch && matchRole;
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
          nombre: user.nombre, 
          email: user.email, 
          password: '', // No llenar password al editar por seguridad
          rol_id: user.rol_id, 
          estado: user.estado 
      });
    } else {
      setEditingUser(null);
      // Default to first role (usually active) or explicit
      const defaultRole = rolesList.length > 0 ? rolesList[0].id : '';
      setFormData({ nombre: '', email: '', password: '', rol_id: defaultRole, estado: 'activo' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.email || !formData.rol_id) {
        toast.error("Complete los campos obligatorios");
        return;
    }
    if (!editingUser && !formData.password) {
        toast.error("La contraseña es obligatoria para nuevos usuarios");
        return;
    }

    setFormLoading(true);
    try {
        if (editingUser) {
            // Update
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password; // Don't send empty password

            const res = await api.put(`/users/${editingUser.id}`, dataToSend);
            setUsers(prev => prev.map(u => u.id === editingUser.id ? res.data : u));
            toast.success("Usuario actualizado");
        } else {
            // Create
            const res = await api.post('/users', formData);
            setUsers(prev => [...prev, res.data]);
            toast.success("Usuario creado exitosamente");
        }
        setShowModal(false);
    } catch (error) {
        console.error("Error saving user:", error);
        toast.error("Error al guardar usuario. Verifique el email.");
    } finally {
        setFormLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('¿Desactivar este usuario? (No podrá iniciar sesión)')) {
      try {
          const res = await api.patch(`/users/${userId}/toggle-status`); // O api.delete si usamos el destroy del controller
          // Como destroy hace soft delete manual:
          // await api.delete(`/users/${userId}`); 
          // Pero definimos toggleStatus route explicitamente
          setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
          toast.success("Estado del usuario actualizado");
      } catch (error) {
          console.error("Error deleting:", error);
          toast.error("Error al actualizar estado");
      }
    }
  };

  const toggleStatus = async (user) => {
    try {
        const res = await api.patch(`/users/${user.id}/toggle-status`);
        setUsers(prev => prev.map(u => u.id === user.id ? res.data : u));
        toast.success(`Usuario ${res.data.estado === 'activo' ? 'activado' : 'desactivado'}`);
    } catch (error) {
        console.error("Error toggling status:", error);
    }
  };

  const getRoleStyle = (roleName) => roleConfig[roleName] || roleConfig['waiter'];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Usuarios</h1>
            <p className="text-sm text-gray-500">Gestiona el personal del restaurante</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Nuevo Usuario</span>
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
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterRole('all')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              filterRole === 'all' ? "bg-amber-500 text-white" : "text-gray-400"
            )}
          >
            Todos
          </button>
          {rolesList.map(role => {
            const style = getRoleStyle(role.nombre);
            return (
              <button
                key={role.id}
                onClick={() => setFilterRole(role.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  filterRole === role.id ? "bg-amber-500 text-white" : "text-gray-400"
                )}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <Users size={20} className="text-gray-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-xs text-gray-500">Total Usuarios</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <UserCheck size={20} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.filter(u => u.estado === 'activo').length}</p>
          <p className="text-xs text-gray-500">Activos</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <UtensilsCrossed size={20} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.filter(u => u.rol && u.rol.nombre === 'waiter').length}</p>
          <p className="text-xs text-gray-500">Meseros</p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <ChefHat size={20} className="text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.filter(u => u.rol && u.rol.nombre === 'kitchen').length}</p>
          <p className="text-xs text-gray-500">Cocina</p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
          <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
      ) : (
        /* Users List */
        <div className="space-y-2">
            <AnimatePresence>
            {filteredUsers.map((user, idx) => {
                const roleName = user.rol ? user.rol.nombre : 'waiter';
                const roleStyle = getRoleStyle(roleName);
                const Icon = roleStyle.icon;
                
                return (
                <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    className={clsx(
                    "p-4 rounded-xl border flex items-center justify-between",
                    user.estado === 'activo' 
                        ? "bg-white/[0.02] border-white/5" 
                        : "bg-white/[0.01] border-white/5 opacity-60"
                    )}
                >
                    <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        `bg-${roleStyle.color}-500/20`
                    )}>
                        <Icon size={20} className={`text-${roleStyle.color}-400`} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{user.nombre}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                        <span className={clsx(
                            "px-2 py-0.5 rounded text-xs font-medium capitalize",
                            `bg-${roleStyle.color}-500/20 text-${roleStyle.color}-400`
                        )}>
                            {roleStyle.label}
                        </span>
                        <span className={clsx(
                            "px-2 py-0.5 rounded text-xs",
                            user.estado === 'activo' 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                            {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                        </div>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleStatus(user)}
                        title={user.estado === 'activo' ? "Desactivar" : "Activar"}
                        className={clsx(
                        "p-2 rounded-lg transition-all",
                        user.estado === 'activo' 
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        )}
                    >
                        <UserCheck size={16} />
                    </button>
                    <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                        <Trash2 size={16} />
                    </button>
                    </div>
                </motion.div>
                );
            })}
            </AnimatePresence>
            {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No se encontraron usuarios
                </div>
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
              className="bg-[#1a1a1f] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                      Contraseña {editingUser && <span className="text-xs text-gray-500">(Dejar en blanco para mantener actual)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Rol</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {rolesList.map(role => {
                        const style = getRoleStyle(role.nombre);
                        const Icon = style.icon;
                        return (
                        <button
                            key={role.id}
                            onClick={() => setFormData(prev => ({ ...prev, rol_id: role.id }))}
                            className={clsx(
                            "p-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                            formData.rol_id === role.id 
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                                : "bg-white/5 border-white/10 text-gray-400"
                            )}
                        >
                            <Icon size={18} />
                            <span className="text-xs capitalize">{style.label}</span>
                        </button>
                        );
                    })}
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

export default AdminUsers;
