import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, CreditCard, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useRestaurant } from '../../context/RestaurantContext';

const TEST_CARDS = [
  { label: 'Aprobada', pan: '4111111111111111', outcome: 'success' },
  { label: 'Rechazada', pan: '4000000000000002', outcome: 'declined' },
  { label: 'Sin fondos', pan: '4000000000009995', outcome: 'insufficient_funds' },
  { label: 'Timeout', pan: '4000000000000127', outcome: 'timeout' },
];

const outcomeStyles = {
  success: {
    title: 'Pago aprobado',
    color: 'text-emerald-400',
    icon: CheckCircle2,
  },
  timeout: {
    title: 'Tiempo agotado',
    color: 'text-amber-400',
    icon: Clock3,
  },
  insufficient_funds: {
    title: 'Fondos insuficientes',
    color: 'text-orange-400',
    icon: AlertTriangle,
  },
  declined: {
    title: 'Pago rechazado',
    color: 'text-red-400',
    icon: AlertTriangle,
  },
};

const MockCardCheckoutModal = ({
  open,
  session,
  amount,
  scope = 'protected',
  title = 'Pago con tarjeta',
  onClose,
  onSuccess,
}) => {
  const { submitMockCheckout } = useRestaurant();
  const [form, setForm] = useState({
    cardholder_name: '',
    pan: TEST_CARDS[0].pan,
    expiry_month: '12',
    expiry_year: String(new Date().getFullYear() + 1),
    cvv: '123',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setResult(null);
      setError('');
      setIsSubmitting(false);
    }
  }, [open]);

  const activeCard = useMemo(
    () => TEST_CARDS.find((card) => card.pan === form.pan) || null,
    [form.pan],
  );

  const handleFillCard = (pan) => {
    setForm((previous) => ({ ...previous, pan }));
    setError('');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!session?.checkout_token) {
      setError('La sesión de pago ya no está disponible.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const response = await submitMockCheckout(
        {
          checkout_token: session.checkout_token,
          ...form,
        },
        scope,
      );
      setResult(response);

      if (response.outcome === 'success') {
        await onSuccess?.(response);
      }
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'No se pudo procesar el pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !session) {
    return null;
  }

  const outcome = result?.outcome ? outcomeStyles[result.outcome] || outcomeStyles.declined : null;
  const OutcomeIcon = outcome?.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111217] p-6 text-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-blue-400">Mock Gateway</p>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Total: <span className="text-white font-semibold">Bs. {Number(amount || 0).toFixed(2)}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {result ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
                {OutcomeIcon ? (
                  <OutcomeIcon size={56} className={clsx('mx-auto mb-4', outcome.color)} />
                ) : null}
                <p className={clsx('text-2xl font-bold', outcome?.color)}>{outcome?.title}</p>
                <p className="text-sm text-gray-400 mt-2">{result.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3">
                  <p className="text-gray-500">Tarjeta</p>
                  <p className="font-semibold capitalize">{result.gateway_attempt?.card_brand || 'test_card'} •••• {result.gateway_attempt?.card_last4}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3">
                  <p className="text-gray-500">Referencia</p>
                  <p className="font-semibold">{result.gateway_attempt?.gateway_reference || '-'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                {result.retryable ? (
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-semibold"
                  >
                    Reintentar
                  </button>
                ) : null}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {TEST_CARDS.map((card) => (
                  <button
                    key={card.pan}
                    onClick={() => handleFillCard(card.pan)}
                    className={clsx(
                      'p-3 rounded-2xl border text-left text-sm transition-all',
                      form.pan === card.pan
                        ? 'bg-blue-500/15 border-blue-500/40 text-white'
                        : 'bg-white/[0.03] border-white/10 text-gray-300',
                    )}
                  >
                    <p className="font-semibold">{card.label}</p>
                    <p className="text-xs text-gray-500">{card.pan}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-8">
                  <CreditCard size={24} className="text-blue-300" />
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {activeCard?.outcome || 'custom'}
                  </span>
                </div>
                <p className="text-2xl tracking-[0.28em] font-semibold mb-5">{form.pan.replace(/(.{4})/g, '$1 ').trim()}</p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Titular</p>
                    <p className="font-medium">{form.cardholder_name || 'CLIENTE DEMO'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Exp</p>
                    <p className="font-medium">{form.expiry_month}/{form.expiry_year.slice(-2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={form.cardholder_name}
                  onChange={(event) => setForm((previous) => ({ ...previous, cardholder_name: event.target.value }))}
                  placeholder="Nombre del titular"
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                />
                <input
                  type="text"
                  value={form.pan}
                  onChange={(event) => setForm((previous) => ({ ...previous, pan: event.target.value.replace(/\D/g, '').slice(0, 19) }))}
                  placeholder="Número de tarjeta"
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={form.expiry_month}
                    onChange={(event) => setForm((previous) => ({ ...previous, expiry_month: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                    placeholder="MM"
                    className="rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                  />
                  <input
                    type="text"
                    value={form.expiry_year}
                    onChange={(event) => setForm((previous) => ({ ...previous, expiry_year: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="YYYY"
                    className="rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                  />
                  <input
                    type="password"
                    value={form.cvv}
                    onChange={(event) => setForm((previous) => ({ ...previous, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="CVV"
                    className="rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !form.cardholder_name || !form.pan || !form.expiry_month || !form.expiry_year || !form.cvv}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                  {isSubmitting ? 'Procesando...' : 'Autorizar y capturar'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MockCardCheckoutModal;
