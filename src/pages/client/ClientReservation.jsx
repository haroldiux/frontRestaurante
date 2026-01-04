import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, MapPin, CreditCard, Send, ChevronLeft, ChevronRight, 
  Upload, Check, X, Clock, Phone, MessageCircle, QrCode, Camera, Star
} from 'lucide-react';
import { clsx } from 'clsx';

const ZONES = [
  { id: 'salon', name: 'Salón Principal', icon: '🍽️', description: 'Ambiente clásico', capacity: '2-8 personas' },
  { id: 'terraza', name: 'Terraza', icon: '🌿', description: 'Al aire libre', capacity: '2-6 personas' },
  { id: 'vip', name: 'Sala VIP', icon: '⭐', description: 'Privado y exclusivo', capacity: '4-12 personas', premium: true },
];

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

const ClientReservation = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guests, setGuests] = useState(2);
  const [selectedZone, setSelectedZone] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, disabled: true });
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isPast = date < today;
      days.push({ 
        day: i, 
        date,
        disabled: isPast,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    return days;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-BO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateWhatsAppMessage = () => {
    const zone = ZONES.find(z => z.id === selectedZone);
    const message = `🍽️ *Nueva Reserva - GUSTO Restaurant*

📅 Fecha: ${formatDate(selectedDate)}
🕐 Hora: ${selectedTime}
👥 Personas: ${guests}
📍 Zona: ${zone?.name}

👤 Nombre: ${customerName}
📱 Teléfono: ${customerPhone}

💳 Comprobante de garantía adjunto

¡Esperamos su confirmación!`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppSubmit = () => {
    const message = generateWhatsAppMessage();
    // Número de WhatsApp del restaurante (ejemplo)
    const whatsappNumber = '59170000000';
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedDate && selectedTime;
      case 2: return selectedZone;
      case 3: return customerName && customerPhone;
      case 4: return paymentProof;
      default: return false;
    }
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reserva tu Mesa</h1>
        <p className="text-gray-500">Completa los pasos para reservar</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <React.Fragment key={s}>
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              step === s && "bg-amber-500 text-white shadow-lg shadow-amber-500/30",
              step > s && "bg-emerald-500 text-white",
              step < s && "bg-white/10 text-gray-500"
            )}>
              {step > s ? <Check size={18} /> : s}
            </div>
            {s < 5 && (
              <div className={clsx(
                "w-8 h-1 rounded-full transition-all",
                step > s ? "bg-emerald-500" : "bg-white/10"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Date & Time */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Fecha y Hora</h2>
                <p className="text-sm text-gray-500">Selecciona cuándo nos visitas</p>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-white font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 py-2">{day}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((item, idx) => (
                  <button
                    key={idx}
                    disabled={item.disabled || !item.day}
                    onClick={() => item.day && !item.disabled && setSelectedDate(item.date)}
                    className={clsx(
                      "aspect-square rounded-lg text-sm font-medium transition-all",
                      !item.day && "invisible",
                      item.disabled && "text-gray-700 cursor-not-allowed",
                      !item.disabled && item.day && "hover:bg-white/10 text-gray-300",
                      item.isToday && "ring-1 ring-amber-500/50",
                      selectedDate?.getTime() === item.date?.getTime() && "bg-amber-500 text-white hover:bg-amber-600"
                    )}
                  >
                    {item.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  Horarios disponibles
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={clsx(
                        "py-3 rounded-xl text-sm font-medium transition-all",
                        selectedTime === time
                          ? "bg-amber-500 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Guests & Zone */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Guests */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">¿Cuántas personas?</h2>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-12 h-12 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xl font-bold"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-white w-16 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(12, guests + 1))}
                  className="w-12 h-12 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Zone */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Elige tu zona</h2>
                </div>
              </div>

              <div className="space-y-3">
                {ZONES.map(zone => (
                  <motion.button
                    key={zone.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedZone(zone.id)}
                    className={clsx(
                      "w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4",
                      selectedZone === zone.id
                        ? "bg-amber-500/20 border-amber-500/50"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    )}
                  >
                    <span className="text-3xl">{zone.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{zone.name}</span>
                        {zone.premium && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                            <Star size={10} className="inline mr-1" />Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{zone.description} • {zone.capacity}</p>
                    </div>
                    <div className={clsx(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      selectedZone === zone.id
                        ? "border-amber-500 bg-amber-500"
                        : "border-gray-600"
                    )}>
                      {selectedZone === zone.id && <Check size={14} className="text-white" />}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                <Phone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tus Datos</h2>
                <p className="text-sm text-gray-500">Para confirmar tu reserva</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Número de WhatsApp</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+591 70000000"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Garantía de Reserva</h2>
                <p className="text-sm text-gray-500">Bs. 50 por persona (reembolsable)</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <p className="text-sm text-gray-400 mb-4">Escanea el QR para transferir</p>
              
              {/* QR Placeholder */}
              <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                  <QrCode size={80} className="text-white" />
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-white font-medium">Banco: BNB</p>
                <p className="text-gray-400">Cuenta: 1234567890</p>
                <p className="text-gray-400">Nombre: GUSTO Restaurant S.R.L.</p>
                <p className="text-amber-400 font-bold mt-2">Total: Bs. {guests * 50}</p>
              </div>
            </div>

            {/* Upload Proof */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Sube tu comprobante de pago</p>
              
              {paymentProof ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={paymentProof} alt="Comprobante" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setPaymentProof(null)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-sm flex items-center gap-1">
                    <Check size={14} />
                    Comprobante cargado
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-500/50 transition-colors text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Camera size={28} className="text-amber-400" />
                    </div>
                    <p className="text-gray-400 mb-1">Toca para subir imagen</p>
                    <p className="text-xs text-gray-600">Captura de pantalla o foto del comprobante</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Check size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Resumen de Reserva</h2>
                <p className="text-sm text-gray-500">Revisa los datos antes de enviar</p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-amber-400" />
                <div>
                  <p className="text-xs text-gray-500">Fecha y hora</p>
                  <p className="text-white font-medium">{formatDate(selectedDate)} • {selectedTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users size={18} className="text-amber-400" />
                <div>
                  <p className="text-xs text-gray-500">Personas</p>
                  <p className="text-white font-medium">{guests} personas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-amber-400" />
                <div>
                  <p className="text-xs text-gray-500">Zona</p>
                  <p className="text-white font-medium">{ZONES.find(z => z.id === selectedZone)?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-amber-400" />
                <div>
                  <p className="text-xs text-gray-500">Contacto</p>
                  <p className="text-white font-medium">{customerName} • {customerPhone}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-gray-400">Garantía pagada</span>
                <span className="text-emerald-400 font-bold">Bs. {guests * 50}</span>
              </div>
            </div>

            {/* WhatsApp Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppSubmit}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-500/25"
            >
              <MessageCircle size={24} />
              <span>Enviar por WhatsApp</span>
            </motion.button>

            <p className="text-center text-xs text-gray-500">
              Te contactaremos para confirmar tu reserva
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(step - 1)}
            className="flex-1 py-4 rounded-xl bg-white/5 text-gray-400 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={20} />
            Atrás
          </motion.button>
        )}
        
        {step < 5 && (
          <motion.button
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            className={clsx(
              "flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              canProceed()
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            )}
          >
            Siguiente
            <ChevronRight size={20} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ClientReservation;
