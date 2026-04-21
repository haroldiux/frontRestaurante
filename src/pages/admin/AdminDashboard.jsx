import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Utensils, Users, AlertTriangle, Package, 
  Clock, UserCheck, Plus, ToggleLeft, ToggleRight, Truck, XCircle,
  BarChart3, ShoppingCart, Wallet, Award, Eye, EyeOff, Star,
  AlertCircle, CheckCircle, RefreshCw, ShoppingBag, UtensilsCrossed
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRestaurant } from '../../context/RestaurantContext';
import api from '../../services/api';







const AdminContent = () => {
  const { orders, tables, products, ingredients, getOrderStats } = useRestaurant();
  const [customerStats, setCustomerStats] = useState({ sessions: 0, customerRate: 0, firstTime: 0, returning: 0 });
  const [customerReviews, setCustomerReviews] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);

  const stats = getOrderStats();

  const mapRoleToSpanish = (role) => {
    const roleMap = {
      'admin': 'Administrador',
      'waiter': 'Mesero',
      'kitchen': 'Cocina',
      'cashier': 'Cajero',
      'delivery': 'Delivery'
    };
    return roleMap[role] || role;
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard');
      const data = response.data;
      setCustomerStats(data.customerStats);
      setCustomerReviews(data.recentReviews);
      
      // Mapear roles del backend a nombres en español para mostrar
      const staffWithTranslatedRoles = data.staff.map(staff => ({
        ...staff,
        role: mapRoleToSpanish(staff.role)
      }));
      setStaffData(staffWithTranslatedRoles);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Inventario real
  const inventoryItems = ingredients.map(ing => ({
    id: ing.id,
    name: ing.name,
    stock: ing.stock,
    minStock: ing.minStock,
    unit: ing.unit,
    status: ing.stock <= ing.minStock * 0.3 ? 'critical' : ing.stock <= ing.minStock * 0.5 ? 'low' : 'ok'
  }));

  // Actividad reciente basada en pedidos
  const recentActivity = orders.slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map(order => {
      const time = new Date(order.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      let message = '';
      let user = order.customerName || 'Cliente';
      let type = 'order';
      if (order.status === 'paid') {
        message = `Mesa ${order.tableNumber} pagó su cuenta`;
        type = 'payment';
      } else if (order.status === 'ready') {
        message = `Pedido #${order.id} listo para servir`;
        type = 'delivery';
      } else {
        message = `Nuevo pedido ${order.orderType === 'takeaway' ? 'para llevar' : 'en mesa'} #${order.id}`;
        type = 'order';
      }
      return { time, message, user, type };
    });

  // Calcular ocupación real de mesas
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;
  const totalTables = tables.length;
  const occupancyRate = Math.round((occupiedTables / totalTables) * 100);

  // Calcular plato más vendido
  const productSales = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      const name = item.product?.name || 'Desconocido';
      productSales[name] = (productSales[name] || 0) + item.quantity;
    });
  });
  const topDish = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0] || ['Sin datos', 0];

  // Estado local para menú (demo)
  const [menu, setMenu] = useState(products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    available: true,
    sold: productSales[p.name] || 0
  })).slice(0, 5));

  const toggleMenuAvailability = (itemId) => {
    setMenu(prev => prev.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };



  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
          <p className="text-sm text-gray-500">Vista ejecutiva • {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="text-sm">{loading ? "Cargando..." : "Actualizar"}</span>
        </button>
      </div>

      {/* Top Stats - 4 Cards (DATOS REALES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <ShoppingBag size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500">Total Pedidos (hoy)</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
              <UtensilsCrossed size={10} />
              {stats.dineInCount} mesa
            </span>
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full flex items-center gap-1">
              <Truck size={10} />
              {stats.takeawayCount} llevar
            </span>
          </div>
        </motion.div>

        {/* Entregados/Completados */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.deliveredCount}</p>
              <p className="text-xs text-gray-500">Completados</p>
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-2">Pedidos entregados/pagados</p>
        </motion.div>

        {/* Cancelados */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/20">
              <XCircle size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.cancelledCount}</p>
              <p className="text-xs text-gray-500">Cancelados</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Pedidos cancelados hoy</p>
        </motion.div>

        {/* Total Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <DollarSign size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Bs. {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Ingresos del Día</p>
            </div>
          </div>
          <p className="text-xs text-amber-400 mt-2">Actualizado en tiempo real</p>
        </motion.div>
      </div>

      {/* Main Grid - 3 columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Column 1: Revenue + Customer Flow */}
        <div className="space-y-6">
          {/* Real Revenue Breakdown */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-sm text-gray-400 mb-2">Ingresos por Tipo (Hoy)</h3>
            <div className="flex gap-6 mb-4">
              <div>
                <p className="text-xl font-bold text-emerald-400">Bs. {stats.dineInRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><UtensilsCrossed size={10} /> En Restaurante</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-400">Bs. {stats.takeawayRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Truck size={10} /> Para Llevar</p>
              </div>
            </div>
            
            {/* Visual comparison bar */}
            <div className="h-4 rounded-full overflow-hidden bg-white/5 flex">
              {stats.totalRevenue > 0 && (
                <>
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${(stats.dineInRevenue / stats.totalRevenue) * 100}%` }}
                  />
                  <div 
                    className="bg-orange-500 h-full transition-all duration-500"
                    style={{ width: `${(stats.takeawayRevenue / stats.totalRevenue) * 100}%` }}
                  />
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-gray-400">
                  Restaurante ({stats.totalRevenue > 0 ? Math.round((stats.dineInRevenue / stats.totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-[10px] text-gray-400">
                  Para Llevar ({stats.totalRevenue > 0 ? Math.round((stats.takeawayRevenue / stats.totalRevenue) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>

          {/* Ocupación de Mesas */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-sm text-gray-400 mb-3">Estado del Salón</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-white">{occupancyRate}%</p>
                <p className="text-xs text-gray-500">Ocupación actual</p>
              </div>
              <div className="text-right">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg">
                    {occupiedTables} ocupadas
                  </span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg">
                    {reservedTables} reservas
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{tables.length - occupiedTables - reservedTables} libres de {totalTables}</p>
              </div>
            </div>
            
            {/* Mini table grid */}
            <div className="grid grid-cols-8 gap-1">
              {tables.map(table => (
                <div 
                  key={table.id}
                  className={clsx(
                    "aspect-square rounded text-[8px] font-bold flex items-center justify-center",
                    table.status === 'occupied' && "bg-amber-500/30 text-amber-400",
                    table.status === 'reserved' && "bg-yellow-500/30 text-yellow-400",
                    table.status === 'free' && "bg-white/5 text-gray-600"
                  )}
                >
                  {table.number}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Inventory + Menu */}
        <div className="space-y-6">
          {/* Plato más vendido */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Award size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Más Vendido Hoy</p>
                <p className="text-lg font-bold text-white">{topDish[0]}</p>
                <p className="text-xs text-amber-400">{topDish[1]} unidades vendidas</p>
              </div>
            </div>
          </div>

          {/* Inventario Crítico */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-red-400" />
                <h3 className="font-medium text-white text-sm">Inventario Crítico</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">
                {inventoryItems.filter(i => i.status === 'critical').length} alertas
              </span>
            </div>
            <div className="space-y-2">
              {inventoryItems.map(item => (
                <div 
                  key={item.id}
                  className={clsx(
                    "p-2 rounded-lg flex items-center justify-between",
                    item.status === 'critical' && "bg-red-500/10",
                    item.status === 'low' && "bg-amber-500/10",
                    item.status === 'ok' && "bg-emerald-500/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {item.status === 'critical' && <AlertCircle size={12} className="text-red-400" />}
                    {item.status === 'low' && <AlertTriangle size={12} className="text-amber-400" />}
                    {item.status === 'ok' && <CheckCircle size={12} className="text-emerald-400" />}
                    <span className="text-xs text-white">{item.name}</span>
                  </div>
                  <span className={clsx(
                    "text-xs font-bold",
                    item.status === 'critical' && "text-red-400",
                    item.status === 'low' && "text-amber-400",
                    item.status === 'ok' && "text-emerald-400"
                  )}>
                    {item.stock} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gestión de Menú */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-amber-400" />
                <h3 className="font-medium text-white text-sm">Gestión de Menú</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">
                {menu.filter(m => !m.available).length} agotados
              </span>
            </div>
            <div className="space-y-2">
              {menu.map(item => (
                <div 
                  key={item.id}
                  className={clsx(
                    "p-2 rounded-lg flex items-center justify-between",
                    item.available ? "bg-white/[0.02]" : "bg-red-500/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMenuAvailability(item.id)}
                      className={clsx(
                        "p-1 rounded transition-all",
                        item.available ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {item.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <span className={clsx(
                      "text-xs",
                      item.available ? "text-white" : "text-gray-500 line-through"
                    )}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{item.sold} vendidos</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Stats + Activity + Reviews */}
        <div className="space-y-6">
          {/* Sessions + Customer Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500">Sesiones</p>
              <p className="text-2xl font-bold text-white">{customerStats.sessions}</p>
              <div className="flex gap-1 mt-2">
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded">Live</span>
                <span className="px-1.5 py-0.5 bg-white/10 text-gray-400 text-[9px] rounded">4 visitantes</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500">Tasa de Clientes</p>
              <p className="text-2xl font-bold text-white">{customerStats.customerRate}%</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[9px] text-gray-500">{customerStats.firstTime}% Nuevos</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[9px] text-gray-500">{customerStats.returning}% Regresa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="font-medium text-white text-sm mb-3">Actividad Reciente</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-xs text-amber-400 font-mono w-10">{activity.time}</span>
                  <div className="flex-1">
                    <p className="text-xs text-white">{activity.message}</p>
                    <p className="text-[10px] text-gray-500">por {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="font-medium text-white text-sm mb-3">Reseñas Recientes</h3>
            <div className="space-y-3">
              {customerReviews.map((review, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white">{review.name}</p>
                      <p className="text-[10px] text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Staff */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">Personal Activo</h3>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-400 font-bold">{staffData.filter(s => s.status === 'working').length}</span>
              <span className="text-xs text-gray-500">activos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-400 font-bold">Bs. {staffData.reduce((a, s) => a + s.tips, 0).toLocaleString('es-BO')}</span>
              <span className="text-xs text-gray-500">propinas</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {staffData.map(person => (
            <div 
              key={person.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center group"
            >
              <div className={clsx(
                "w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-2",
                person.status === 'working' ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"
              )}>
                {person.name.charAt(0)}
              </div>
              <p className="text-sm text-white">{person.name}</p>
              <p className="text-[10px] text-gray-500">{person.role}</p>
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Pedidos:</span>
                  <span className="text-emerald-400 font-bold">{person.stats?.orders_today || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Ventas:</span>
                  <span className="text-amber-400 font-bold">Bs. {Number(person.stats?.sales_today || 0).toLocaleString('es-BO')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Propinas:</span>
                  <span className="text-purple-400 font-bold">Bs. {person.tips}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
