import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Plus, Search, Edit2, Trash2, 
  ChefHat, UtensilsCrossed, Shield, UserCheck, X, Save
} from 'lucide-react';
import { clsx } from 'clsx';

// Datos de ejemplo
const initialUsers = [
  { id: 1, name: 'Carlos M.', email: 'carlos@gusto.com', role: 'waiter', status: 'active', phone: '555-1234' },
  { id: 2, name: 'María G.', email: 'maria@gusto.com', role: 'waiter', status: 'active', phone: '555-2345' },
  { id: 3, name: 'Juan P.', email: 'juan@gusto.com', role: 'kitchen', status: 'active', phone: '555-3456' },
  { id: 4, name: 'Ana L.', email: 'ana@gusto.com', role: 'admin', status: 'active', phone: '555-4567' },
  { id: 5, name: 'Pedro R.', email: 'pedro@gusto.com', role: 'waiter', status: 'inactive', phone: '555-5678' },
];

const roles = [
  { id: 'waiter', label: 'Mesero', icon: UtensilsCrossed, color: 'amber' },
  { id: 'kitchen', label: 'Cocina', icon: ChefHat, color: 'orange' },
  { id: 'admin', label: 'Administrador', icon: Shield, color: 'purple' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'waiter', phone: '', status: 'active' });

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                       u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'waiter', phone: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...formData, id: u.id } : u));
    } else {
      setUsers(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (userId) => {
    if (confirm('¿Eliminar este usuario?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const toggleStatus = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const getRoleInfo = (roleId) => roles.find(r => r.id === roleId) || roles[0];

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
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setFilterRole('all')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              filterRole === 'all' ? "bg-amber-500 text-white" : "text-gray-400"
            )}
          >
            Todos
          </button>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setFilterRole(role.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                filterRole === role.id ? "bg-amber-500 text-white" : "text-gray-400"
              )}
            >
              {role.label}
            </button>
          ))}
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
          <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</p>
          <p className="text-xs text-gray-500">Activos</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <UtensilsCrossed size={20} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'waiter').length}</p>
          <p className="text-xs text-gray-500">Meseros</p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <ChefHat size={20} className="text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'kitchen').length}</p>
          <p className="text-xs text-gray-500">Cocina</p>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredUsers.map((user, idx) => {
            const roleInfo = getRoleInfo(user.role);
            const Icon = roleInfo.icon;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: idx * 0.05 }}
                className={clsx(
                  "p-4 rounded-xl border flex items-center justify-between",
                  user.status === 'active' 
                    ? "bg-white/[0.02] border-white/5" 
                    : "bg-white/[0.01] border-white/5 opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    roleInfo.color === 'amber' && "bg-amber-500/20",
                    roleInfo.color === 'orange' && "bg-orange-500/20",
                    roleInfo.color === 'purple' && "bg-purple-500/20"
                  )}>
                    <Icon size={20} className={clsx(
                      roleInfo.color === 'amber' && "text-amber-400",
                      roleInfo.color === 'orange' && "text-orange-400",
                      roleInfo.color === 'purple' && "text-purple-400"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        roleInfo.color === 'amber' && "bg-amber-500/20 text-amber-400",
                        roleInfo.color === 'orange' && "bg-orange-500/20 text-orange-400",
                        roleInfo.color === 'purple' && "bg-purple-500/20 text-purple-400"
                      )}>
                        {roleInfo.label}
                      </span>
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-xs",
                        user.status === 'active' 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-gray-500/20 text-gray-400"
                      )}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className={clsx(
                      "p-2 rounded-lg transition-all",
                      user.status === 'active' 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-gray-500/20 text-gray-400"
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  <label className="text-sm text-gray-400">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Rol</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                        className={clsx(
                          "p-3 rounded-xl border flex flex-col items-center gap-1 transition-all",
                          formData.role === role.id 
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                            : "bg-white/5 border-white/10 text-gray-400"
                        )}
                      >
                        <role.icon size={18} />
                        <span className="text-xs">{role.label}</span>
                      </button>
                    ))}
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

export default AdminUsers;
