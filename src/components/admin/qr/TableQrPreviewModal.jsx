import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Download, ExternalLink, FileText, X } from 'lucide-react';

const TableQrPreviewModal = ({ open, table, previewUrl, onClose, onCopyUrl, onDownloadSvg, onDownloadPdf }) => {
  if (!open || !table) {
    return null;
  }

  const exportsDisabled = !table.isQrEnabled;

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
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111217] p-6 text-white"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-400 mb-1">Vista previa</p>
              <h2 className="text-2xl font-bold">Mesa {table.number}</h2>
              <p className="text-sm text-gray-500">{table.publicUrl}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_0.8fr] gap-6 items-center">
            <div className="rounded-3xl bg-white p-6 min-h-[360px] flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt={`QR de la mesa ${table.number}`} className="w-full max-w-[320px]" />
              ) : (
                <p className="text-slate-500">Cargando QR...</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                <p className="text-sm text-gray-400">Estado</p>
                <p className={`font-semibold ${table.isQrEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                  {table.isQrEnabled ? 'QR habilitado' : 'QR deshabilitado'}
                </p>
              </div>

              <button
                onClick={onCopyUrl}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Copiar URL pública
              </button>
              <button
                onClick={onDownloadSvg}
                disabled={exportsDisabled}
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Descargar SVG
              </button>
              <button
                onClick={onDownloadPdf}
                disabled={exportsDisabled}
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                Descargar PDF
              </button>
              <a
                href={table.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                Abrir URL pública
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TableQrPreviewModal;
