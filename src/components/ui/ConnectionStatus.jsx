import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowPulse(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowPulse(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hide pulse after 3 seconds
    const timer = setTimeout(() => setShowPulse(false), 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [isOnline]);

  return (
    <motion.div 
      layout
      className={clsx(
        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-500 border backdrop-blur-sm",
        isOnline 
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
          : "bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10"
      )}
    >
      <div className="relative">
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: 2 }}
              className={clsx(
                "absolute inset-0 rounded-full",
                isOnline ? "bg-emerald-400" : "bg-red-400"
              )}
            />
          )}
        </AnimatePresence>
      </div>
      <span className="hidden sm:inline">{isOnline ? 'Conectado' : 'Sin conexión'}</span>
    </motion.div>
  );
};

export default ConnectionStatus;
