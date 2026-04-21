import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BarChart3, TrendingUp, DollarSign, ShoppingBag,
  UtensilsCrossed, Calendar, Download, Clock, Users, Award
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';

const AdminReportsContent = () => {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    stats: { revenue: 0, orders: 0, avg_ticket: 0, clients: 0 },
    changes: { revenue: 0, orders: 0, avg_ticket: 0, clients: 0 },
    chart: [],
    top_products: [],
    types: { mesa: 0, llevar: 0 },
    peaks: { lunch: 0, dinner: 0, snack: 0 }
  });
  const [customerData, setCustomerData] = useState({
    topCustomers: [],
    retention: { total_customers: 0, repeat_customers: 0, retention_rate: 0 }
  });

  // Fetch Logic
  React.useEffect(() => {
    const transformReportData = (data) => {
      const transformed = { ...data };
      // Convert avg_ticket string to number
      if (transformed.stats && typeof transformed.stats.avg_ticket === 'string') {
          transformed.stats.avg_ticket = parseFloat(transformed.stats.avg_ticket.replace(',', '.'));
      }
      // Convert revenue to number (already integer but ensure)
      if (transformed.stats && transformed.stats.revenue) {
          transformed.stats.revenue = Number(transformed.stats.revenue);
      }
      // Ensure changes are numbers
      if (transformed.changes && typeof transformed.changes === 'object') {
          Object.keys(transformed.changes).forEach(key => {
              if (typeof transformed.changes[key] === 'string') {
                  transformed.changes[key] = parseFloat(transformed.changes[key].replace(',', '.'));
              }
          });
      }
      // Convert chart sales
      if (transformed.chart && Array.isArray(transformed.chart)) {
          transformed.chart = transformed.chart.map(day => ({
              ...day,
              sales: typeof day.sales === 'string' ? parseFloat(day.sales.replace(',', '.')) : Number(day.sales)
          }));
      }
      // Convert top_products revenue
      if (transformed.top_products && Array.isArray(transformed.top_products)) {
          transformed.top_products = transformed.top_products.map(product => ({
              ...product,
              revenue: typeof product.revenue === 'string' ? parseFloat(product.revenue.replace(',', '.')) : Number(product.revenue)
          }));
      }
      return transformed;
    };

    const transformCustomerData = (topRes, retentionRes) => {
      return {
        topCustomers: topRes.data.map(customer => ({
          name: customer.customer_name || 'Cliente',
          orderCount: customer.order_count,
          totalSpent: parseFloat(String(customer.total_spent).replace(',', '.')),
          lastOrder: customer.last_order_at,
        })),
        retention: {
          total_customers: retentionRes.data.total_customers || 0,
          repeat_customers: retentionRes.data.repeat_customers || 0,
          retention_rate: parseFloat(String(retentionRes.data.retention_rate || 0).replace(',', '.')),
        }
      };
    };

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const [reportsRes, topCustomersRes, retentionRes] = await Promise.all([
                api.get(`/reports?period=${period}`),
                api.get(`/customers/top?period=${period}`),
                api.get('/customers/retention')
            ]);
            setData(transformReportData(reportsRes.data));
            setCustomerData(transformCustomerData(topCustomersRes, retentionRes));
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setError('No se pudieron cargar los reportes. Verifica el backend y vuelve a intentar.');
        } finally {
            setLoading(false);
        }
    };
    fetchReports();
  }, [period]);

  const stats = [
    { label: 'Ventas Totales', value: `Bs. ${Number(data.stats.revenue).toLocaleString('es-BO')}`, icon: DollarSign, color: 'emerald', change: `${data.changes?.revenue >= 0 ? '+' : ''}${(data.changes?.revenue ?? 0).toFixed(1)}%` },
    { label: 'Pedidos', value: data.stats.orders, icon: ShoppingBag, color: 'blue', change: `${data.changes?.orders >= 0 ? '+' : ''}${(data.changes?.orders ?? 0).toFixed(1)}%` },
    { label: 'Ticket Promedio', value: `Bs. ${Number(data.stats.avg_ticket).toLocaleString('es-BO', {minimumFractionDigits: 2})}`, icon: TrendingUp, color: 'amber', change: `${data.changes?.avg_ticket >= 0 ? '+' : ''}${(data.changes?.avg_ticket ?? 0).toFixed(1)}%` },
    { label: 'Clientes Únicos', value: data.stats.clients, icon: Users, color: 'purple', change: `${data.changes?.clients >= 0 ? '+' : ''}${(data.changes?.clients ?? 0).toFixed(1)}%` },
  ];

  if(loading) return <div className="p-8 text-center text-gray-400">Cargando reportes...</div>;

  const maxSales = Math.max(...(data.chart.map(d => d.sales) || [0]), 1);

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
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

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
            {data.chart.map((day, i) => (
              <div key={day.day} className="h-full flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full relative flex items-end group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.sales / maxSales) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg absolute bottom-0 left-0 right-0 mx-auto"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                         Bs. {Number(day.sales).toLocaleString('es-BO', {minimumFractionDigits: 2})}
                      </div>
                    </motion.div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{day.day}</span>
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
            {data.top_products.map((product, i) => (
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
                   Bs. {Number(product.revenue).toLocaleString('es-BO', {minimumFractionDigits: 2})}
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
              <p className="text-3xl font-bold text-blue-400">
                  {Math.round((data.types.mesa / (data.stats.orders || 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">En Restaurante</p>
              <p className="text-xs text-gray-500">{data.types.mesa} pedidos</p>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-3xl font-bold text-orange-400">
                 {Math.round((data.types.llevar / (data.stats.orders || 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">Para Llevar</p>
              <p className="text-xs text-gray-500">{data.types.llevar} pedidos</p>
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
              { time: '12:00 - 14:00', label: 'Almuerzo', orders: data.peaks.lunch, color: 'amber' },
              { time: '19:00 - 21:00', label: 'Cena', orders: data.peaks.dinner, color: 'purple' },
              { time: '15:00 - 17:00', label: 'Merienda', orders: data.peaks.snack, color: 'blue' },
             ].map((peak) => (
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

       {/* Customer Analytics Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
         {/* Top Customers */}
         <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
           <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
             <Users size={18} className="text-emerald-400" />
             Top Clientes
           </h3>
           
           <div className="space-y-3">
             {customerData.topCustomers.slice(0, 5).map((customer, i) => (
               <motion.div
                 key={customer.name + i}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="flex items-center gap-3"
               >
                 <span className={clsx(
                   "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                   i === 0 && "bg-emerald-500 text-white",
                   i === 1 && "bg-gray-400 text-white",
                   i === 2 && "bg-orange-600 text-white",
                   i > 2 && "bg-white/10 text-gray-400"
                 )}>
                   {i + 1}
                 </span>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-white truncate">{customer.name}</p>
                   <p className="text-xs text-gray-500">{customer.orderCount} pedidos</p>
                 </div>
                 <span className="text-sm font-medium text-emerald-400">
                   Bs. {Number(customer.totalSpent).toLocaleString('es-BO', {minimumFractionDigits: 2})}
                 </span>
               </motion.div>
             ))}
           </div>
         </div>

         {/* Customer Retention */}
         <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
           <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
             <TrendingUp size={18} className="text-purple-400" />
             Retención de Clientes
           </h3>
           
           <div className="space-y-6">
             <div className="text-center">
               <div className="text-4xl font-bold text-purple-400">
                 {customerData.retention.retention_rate.toFixed(1)}%
               </div>
               <p className="text-sm text-gray-500 mt-1">Tasa de retención</p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                 <p className="text-2xl font-bold text-emerald-400">
                   {customerData.retention.repeat_customers}
                 </p>
                 <p className="text-xs text-gray-400 mt-1">Clientes recurrentes</p>
               </div>
               <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                 <p className="text-2xl font-bold text-blue-400">
                   {customerData.retention.total_customers}
                 </p>
                 <p className="text-xs text-gray-400 mt-1">Total clientes</p>
               </div>
             </div>
             
             <div className="text-xs text-gray-500 text-center">
               {customerData.retention.total_customers > 0 ? (
                 <span>
                   {Math.round((customerData.retention.repeat_customers / customerData.retention.total_customers) * 100)}% de clientes han vuelto
                 </span>
               ) : 'No hay datos suficientes'}
             </div>
           </div>
         </div>
       </div>
     </div>
  );
};

export default AdminReportsContent;
