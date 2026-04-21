import React, { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Download, Eye, FileText, QrCode, XCircle } from 'lucide-react';
import api from '../../../services/api';

const TableQrCard = ({ table, selected, onToggleSelect, onPreview, onCopyUrl, onDownloadSvg, onDownloadPdf }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const exportsDisabled = !table.isQrEnabled;

  useEffect(() => {
    let objectUrl = '';

    const loadPreview = async () => {
      try {
        const response = await api.get(`/tables/${table.id}/qr.svg`, {
          responseType: 'blob',
        });
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error('Error loading QR preview:', error);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [table.id]);

  return (
    <div className={`rounded-3xl border p-5 transition-all ${selected ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-1">Mesa</p>
          <h3 className="text-2xl font-bold text-white">{table.number}</h3>
          <p className="text-sm text-gray-500 truncate max-w-[220px]">{table.publicUrl}</p>
        </div>
        <button
          onClick={() => onToggleSelect(table.id)}
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${selected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white/5 border-white/10 text-gray-400'}`}
        >
          {selected ? <CheckCircle2 size={18} /> : <QrCode size={18} />}
        </button>
      </div>

      <div className="rounded-3xl bg-white p-5 min-h-[240px] flex items-center justify-center mb-4">
        {previewUrl ? (
          <img src={previewUrl} alt={`QR mesa ${table.number}`} className="w-full max-w-[180px]" />
        ) : (
          <p className="text-slate-500">Cargando...</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className={`inline-flex items-center gap-2 ${table.isQrEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
          {table.isQrEnabled ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {table.isQrEnabled ? 'Habilitado' : 'Deshabilitado'}
        </span>
        <span className="text-gray-500 capitalize">{table.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onPreview(table, previewUrl)} className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm flex items-center justify-center gap-2">
          <Eye size={14} />
          Ver
        </button>
        <button onClick={() => onCopyUrl(table)} className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm flex items-center justify-center gap-2">
          <Copy size={14} />
          Copiar
        </button>
        <button
          onClick={() => onDownloadSvg(table)}
          disabled={exportsDisabled}
          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          SVG
        </button>
        <button
          onClick={() => onDownloadPdf(table)}
          disabled={exportsDisabled}
          className="px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={14} />
          PDF
        </button>
      </div>
    </div>
  );
};

export default TableQrCard;
