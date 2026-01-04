import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Bell, Calendar, ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'admin': return 'Panel de Administración';
      case 'waiter': return 'Portal de Meseros';
      case 'kitchen': return 'Pantalla de Cocina';
      case 'cashier': return 'Terminal de Caja';
      case 'client': return 'Bienvenido a Gusto';
      default: return 'Panel Principal';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const stats = [
    { 
      label: 'Ventas del día', 
      value: '$12,450', 
      change: '+12.5%', 
      positive: true,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      glow: 'shadow-emerald-500/20'
    },
    { 
      label: 'Pedidos activos', 
      value: '24', 
      change: '+3', 
      positive: true,
      icon: ShoppingBag,
      gradient: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20'
    },
    { 
      label: 'Clientes hoy', 
      value: '156', 
      change: '-5%', 
      positive: false,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/20'
    },
    { 
      label: 'Tiempo promedio', 
      value: '18min', 
      change: '-2min', 
      positive: true,
      icon: Clock,
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/20'
    },
  ];

  const recentOrders = [
    { id: '#2847', table: 'Mesa 5', status: 'En preparación', time: 'Hace 3 min', amount: '$45.00' },
    { id: '#2846', table: 'Mesa 12', status: 'Servido', time: 'Hace 8 min', amount: '$78.50' },
    { id: '#2845', table: 'Mesa 3', status: 'Pagado', time: 'Hace 15 min', amount: '$124.00' },
    { id: '#2844', table: 'Mesa 8', status: 'En preparación', time: 'Hace 18 min', amount: '$67.25' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'En preparación': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Servido': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Pagado': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <p className="text-gray-500 text-sm mb-1">{getGreeting()}</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-400">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-semibold">{user.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
          >
            <span>Nueva Orden</span>
            <ArrowUpRight size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`
              p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 
              hover:border-white/20 transition-all duration-300 group cursor-pointer
              hover:shadow-xl ${stat.glow}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow}`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <button className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div 
          variants={item}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Pedidos Recientes</h3>
              <p className="text-sm text-gray-500">Últimos pedidos del día</p>
            </div>
            <button className="text-sm text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold text-white">
                    {order.table.split(' ')[1]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{order.id}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-400">{order.table}</span>
                    </div>
                    <span className="text-xs text-gray-500">{order.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-white">{order.amount}</span>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions / Activity */}
        <motion.div 
          variants={item}
          className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Actividad</h3>
              <p className="text-sm text-gray-500">Resumen del día</p>
            </div>
            <Calendar size={18} className="text-gray-500" />
          </div>
          
          <div className="space-y-6">
            {/* Progress Ring Simulation */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="fill-none stroke-white/5 stroke-[8]"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="fill-none stroke-[8]"
                    style={{
                      stroke: 'url(#gradient)',
                    }}
                    initial={{ strokeDasharray: '0 377' }}
                    animate={{ strokeDasharray: '283 377' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">75%</span>
                  <span className="text-xs text-gray-500">Objetivo diario</span>
                </div>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Completados', value: '47', color: 'text-emerald-400' },
                { label: 'Pendientes', value: '12', color: 'text-amber-400' },
                { label: 'Cancelados', value: '3', color: 'text-red-400' },
                { label: 'En curso', value: '8', color: 'text-blue-400' },
              ].map((mini) => (
                <div key={mini.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className={`text-xl font-bold ${mini.color}`}>{mini.value}</span>
                  <p className="text-xs text-gray-500">{mini.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Note */}
      <motion.div 
        variants={item}
        className="text-center py-4"
      >
        <p className="text-xs text-gray-600">
          Rol actual: <span className="text-amber-500 font-medium capitalize">{user.role}</span> • 
          Última actualización: hace un momento
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
