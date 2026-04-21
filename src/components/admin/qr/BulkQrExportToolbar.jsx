import React from 'react';
import { Download, FileArchive, FileText, RefreshCw } from 'lucide-react';

const BulkQrExportToolbar = ({
  selectedCount,
  enabledOnly,
  onToggleEnabledOnly,
  onExportZip,
  onExportPdf,
  onRefresh,
  isExporting,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-amber-400 mb-1">Exportación masiva</p>
        <h2 className="text-xl font-bold text-white">Mesas seleccionadas: {selectedCount}</h2>
        <p className="text-sm text-gray-500">Descarga QR escalables para impresión o administración.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRefresh}
          className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
        <button
          onClick={onToggleEnabledOnly}
          className={`px-4 py-3 rounded-2xl border flex items-center gap-2 ${enabledOnly ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-white'}`}
        >
          <Download size={16} />
          {enabledOnly ? 'Solo habilitadas' : 'Todas las mesas'}
        </button>
        <button
          onClick={onExportZip}
          disabled={selectedCount === 0 || isExporting}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <FileArchive size={16} />
          ZIP SVG
        </button>
        <button
          onClick={onExportPdf}
          disabled={selectedCount === 0 || isExporting}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <FileText size={16} />
          PDF paginado
        </button>
      </div>
    </div>
  );
};

export default BulkQrExportToolbar;
