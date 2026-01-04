import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BarChart3, TrendingUp, DollarSign, ShoppingBag,
  UtensilsCrossed, Calendar, Download, Clock, Users, Award
} from 'lucide-react';
import { clsx } from 'clsx';
import { RestaurantProvider, useRestaurant } from '../../context/RestaurantContext';

// Datos simulados para el reporte
const weeklyData = [
  { day: 'Lun', sales: 1250, orders: 28 },
  { day: 'Mar', sales: 1480, orders: 35 },
  { day: 'Mié', sales: 1320, orders: 31 },
  { day: 'Jue', sales: 1650, orders: 42 },
  { day: 'Vie', sales: 2100, orders: 55 },
  { day: 'Sáb', sales: 2450, orders: 68 },
  { day: 'Dom', sales: 1980, orders: 52 },
];

const topProducts = [
  { name: 'Filete Mignon', sales: 45, revenue: 2250 },
  { name: 'Alitas BBQ', sales: 38, revenue: 950 },
  { name: 'Ensalada César', sales: 32, revenue: 448 },
  { name: 'Nachos Supreme', sales: 28, revenue: 350 },
  { name: 'Limonada', sales: 52, revenue: 312 },
];

const AdminReportsContent = () => {
  const { orders } = useRestaurant();
  const [period, setPeriod] = useState('week');

  // Calcular estadísticas reales
  const todayOrders = orders.filter(o => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(o.createdAt) >= today;
  });

  const totalRevenue = weeklyData.reduce((s, d) => s + d.sales, 0);
  const totalOrders = weeklyData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const maxSales = Math.max(...weeklyData.map(d => d.sales));

  const stats = [
    { label: 'Ventas Totales', value: `Bs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald', change: '+12.5%' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingBag, color: 'blue', change: '+8.2%' },
    { label: 'Ticket Promedio', value: `Bs. ${avgOrderValue}`, icon: TrendingUp, color: 'amber', change: '+5.1%' },
    { label: 'Clientes Únicos', value: 156, icon: Users, color: 'purple', change: '+15.3%' },
  ];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Reportes</h1>
            <p className="text-sm text-gray-500">Análisis de ventas y rendimiento</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
            {['day', 'week', 'month'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  period === p ? "bg-amber-500 text-white" : "text-gray-400"
                )}
              >
                {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-medium flex items-center gap-2"
          >
            <Download size={16} />
            <span>Exportar</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={clsx(
                "p-4 rounded-2xl border",
                stat.color === 'emerald' && "bg-emerald-500/10 border-emerald-500/20",
                stat.color === 'blue' && "bg-blue-500/10 border-blue-500/20",
                stat.color === 'amber' && "bg-amber-500/10 border-amber-500/20",
                stat.color === 'purple' && "bg-purple-500/10 border-purple-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className={clsx(
                  stat.color === 'emerald' && "text-emerald-400",
                  stat.color === 'blue' && "text-blue-400",
                  stat.color === 'amber' && "text-amber-400",
                  stat.color === 'purple' && "text-purple-400"
                )} />
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-400" />
              Ventas por Día
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                Ventas
              </span>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((day, i) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.sales / maxSales) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Bs. {day.sales}
                  </div>
                </motion.div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-400" />
            Productos Top
          </h3>
          
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 && "bg-amber-500 text-white",
                  i === 1 && "bg-gray-400 text-white",
                  i === 2 && "bg-orange-600 text-white",
                  i > 2 && "bg-white/10 text-gray-400"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} vendidos</p>
                </div>
                <span className="text-sm font-medium text-amber-400">
                  Bs. {product.revenue}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by Type */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <UtensilsCrossed size={18} className="text-blue-400" />
            Pedidos por Tipo
          </h3>
          
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-3xl font-bold text-blue-400">68%</p>
              <p className="text-sm text-gray-400 mt-1">En Restaurante</p>
              <p className="text-xs text-gray-500">215 pedidos</p>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-3xl font-bold text-orange-400">32%</p>
              <p className="text-sm text-gray-400 mt-1">Para Llevar</p>
              <p className="text-xs text-gray-500">96 pedidos</p>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Clock size={18} className="text-purple-400" />
            Horas Pico
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { time: '12:00 - 14:00', label: 'Almuerzo', orders: 85, color: 'amber' },
              { time: '19:00 - 21:00', label: 'Cena', orders: 120, color: 'purple' },
              { time: '15:00 - 17:00', label: 'Merienda', orders: 45, color: 'blue' },
            ].map((peak, i) => (
              <div 
                key={peak.time}
                className={clsx(
                  "p-3 rounded-xl border text-center",
                  peak.color === 'amber' && "bg-amber-500/10 border-amber-500/20",
                  peak.color === 'purple' && "bg-purple-500/10 border-purple-500/20",
                  peak.color === 'blue' && "bg-blue-500/10 border-blue-500/20"
                )}
              >
                <p className={clsx(
                  "text-lg font-bold",
                  peak.color === 'amber' && "text-amber-400",
                  peak.color === 'purple' && "text-purple-400",
                  peak.color === 'blue' && "text-blue-400"
                )}>
                  {peak.orders}
                </p>
                <p className="text-xs text-white mt-1">{peak.label}</p>
                <p className="text-[10px] text-gray-500">{peak.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminReports = () => {
  return (
    <RestaurantProvider>
      <AdminReportsContent />
    </RestaurantProvider>
  );
};

export default AdminReports;
