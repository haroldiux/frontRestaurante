import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = location.pathname.split('/')[1] || 'Página';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
    >
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-3xl text-amber-400 border border-amber-500/20"
      >
        <Construction size={56} />
      </motion.div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white capitalize">{pageName}</h2>
        <p className="text-gray-400 max-w-md">
          Esta vista está en construcción. Estás visualizando el shell de la aplicación.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </motion.button>
    </motion.div>
  );
};

export default PlaceholderPage;
