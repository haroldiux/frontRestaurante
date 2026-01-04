import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, ChefHat, Utensils, Wallet, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  const roles = [
    { id: 'admin', label: 'Administrador', description: 'Control total del sistema', icon: ShieldCheck, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-purple-500/25' },
    { id: 'waiter', label: 'Mesero', description: 'Gestión de mesas y pedidos', icon: Utensils, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-orange-500/25' },
    { id: 'kitchen', label: 'Cocina', description: 'Preparación de comandas', icon: ChefHat, gradient: 'from-rose-500 to-red-600', glow: 'shadow-red-500/25' },
    { id: 'cashier', label: 'Caja', description: 'Cobros y cierres', icon: Wallet, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-green-500/25' },
    { id: 'client', label: 'Cliente', description: 'Menú digital interactivo', icon: UserCircle2, gradient: 'from-cyan-500 to-blue-600', glow: 'shadow-blue-500/25' },
  ];

  const handleLogin = async (role) => {
    setLoadingRole(role);
    setTimeout(() => {
      login(role);
      navigate('/');
    }, 1000);
  };

  // Floating particles for background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0d0d14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-600/20 to-orange-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/15 to-purple-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/10 to-blue-600/5 rounded-full blur-3xl"
        />
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 relative z-10"
      >
        {/* Left Side: Brand */}
        <div className="p-8 lg:p-14 flex flex-col justify-center relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Logo */}
            <div className="relative mb-8">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <Utensils size={40} className="text-white" />
              </motion.div>
              <motion.div 
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={12} className="text-white" />
              </motion.div>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight">
              GUSTO
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-md">
              Gestión inteligente para experiencias gastronómicas 
              <span className="text-amber-400 font-medium"> memorables</span>.
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 mb-8">
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '2.5k+', label: 'Usuarios' },
                { value: '15ms', label: 'Respuesta' },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-400">Sistema Operativo <span className="text-white font-medium">v2.0</span></span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Roles */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="p-8 lg:p-14 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Acceso Rápido</h2>
            <p className="text-gray-500">Selecciona tu perfil para continuar</p>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {roles.map((role, index) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredRole(role.id)}
                  onHoverEnd={() => setHoveredRole(null)}
                  onClick={() => handleLogin(role.id)}
                  disabled={loadingRole && loadingRole !== role.id}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl 
                    transition-all duration-500 group relative overflow-hidden
                    ${loadingRole === role.id ? 'ring-2 ring-white/20' : ''}
                    bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15
                    ${hoveredRole === role.id ? `shadow-xl ${role.glow}` : ''}
                  `}
                >
                  {/* Gradient overlay on hover */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${role.gradient} shadow-lg ${role.glow}`}>
                      <role.icon size={22} className="text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-base font-semibold text-white group-hover:text-white transition-colors">
                        {role.label}
                      </span>
                      <span className="block text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                        {role.description}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    {loadingRole === role.id ? (
                      <motion.div 
                        className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        animate={{ 
                          x: hoveredRole === role.id ? 0 : -5, 
                          opacity: hoveredRole === role.id ? 1 : 0 
                        }}
                        className={`p-2 rounded-lg bg-gradient-to-r ${role.gradient}`}
                      >
                        <ArrowRight size={14} className="text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 pt-6 border-t border-white/5 text-center"
          >
            <p className="text-xs text-gray-600">
              ¿Problemas para acceder? <a href="#" className="text-amber-500 hover:text-amber-400 transition-colors">Contacta soporte</a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
