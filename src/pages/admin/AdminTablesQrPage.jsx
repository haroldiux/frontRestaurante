import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { useRestaurant } from '../../context/RestaurantContext';
import BulkQrExportToolbar from '../../components/admin/qr/BulkQrExportToolbar';
import TableQrCard from '../../components/admin/qr/TableQrCard';
import TableQrPreviewModal from '../../components/admin/qr/TableQrPreviewModal';

const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

const AdminTablesQrPage = () => {
  const { tables, refreshProtectedData } = useRestaurant();
  const [query, setQuery] = useState('');
  const [enabledOnly, setEnabledOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewTable, setPreviewTable] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesQuery = String(table.number).includes(query.trim());
      const matchesEnabled = enabledOnly ? table.isQrEnabled : true;
      const matchesStatus = statusFilter === 'all' ? true : table.status === statusFilter;
      return matchesQuery && matchesEnabled && matchesStatus;
    });
  }, [tables, query, enabledOnly, statusFilter]);

  const selectedCount = selectedIds.length;

  const handleToggleSelect = (tableId) => {
    setSelectedIds((previous) =>
      previous.includes(tableId) ? previous.filter((id) => id !== tableId) : [...previous, tableId],
    );
  };

  const handleSelectAllVisible = () => {
    setSelectedIds(filteredTables.map((table) => table.id));
  };

  const handleClearSelection = () => setSelectedIds([]);

  const handleCopyUrl = async (table) => {
    try {
      await navigator.clipboard.writeText(table.publicUrl);
      toast.success(`URL de la mesa ${table.number} copiada`);
    } catch {
      toast.error('No se pudo copiar la URL');
    }
  };

  const downloadTableFile = async (table, format) => {
    try {
      const response = await api.get(`/tables/${table.id}/qr.${format}`, {
        responseType: 'blob',
      });
      downloadBlob(response.data, `mesa-${table.number}.${format === 'svg' ? 'svg' : 'pdf'}`);
    } catch (error) {
      console.error('Error downloading QR file:', error);
      toast.error('No se pudo descargar el archivo');
    }
  };

  const handleBulkExport = async (format) => {
    try {
      setIsExporting(true);
      const response = await api.post(
        '/tables/qr/bulk-export',
        {
          format,
          table_ids: selectedIds,
          enabled_only: enabledOnly,
        },
        {
          responseType: 'blob',
        },
      );

      downloadBlob(response.data, format === 'zip_svg' ? 'mesas-qr.zip' : 'mesas-qr.pdf');
      toast.success('Exportación completada');
    } catch (error) {
      console.error('Error exporting QR bundle:', error);
      toast.error('No se pudo exportar la selección');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Mesas & QR</h1>
            <p className="text-sm text-gray-500">Visualiza, descarga y exporta los QR del local.</p>
          </div>
        </div>
      </div>

      <BulkQrExportToolbar
        selectedCount={selectedCount}
        enabledOnly={enabledOnly}
        onToggleEnabledOnly={() => setEnabledOnly((previous) => !previous)}
        onExportZip={() => handleBulkExport('zip_svg')}
        onExportPdf={() => handleBulkExport('pdf')}
        onRefresh={refreshProtectedData}
        isExporting={isExporting}
      />

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar mesa por número..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="free">Libres</option>
            <option value="occupied">Ocupadas</option>
            <option value="reserved">Reservadas</option>
          </select>
          <button onClick={handleSelectAllVisible} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white">
            Seleccionar visibles
          </button>
          <button onClick={handleClearSelection} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white">
            Limpiar selección
          </button>
        </div>

        <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-4">
          {filteredTables.map((table) => (
            <TableQrCard
              key={table.id}
              table={table}
              selected={selectedIds.includes(table.id)}
              onToggleSelect={handleToggleSelect}
              onPreview={(selectedTable, currentPreviewUrl) => {
                setPreviewTable(selectedTable);
                setPreviewUrl(currentPreviewUrl);
              }}
              onCopyUrl={handleCopyUrl}
              onDownloadSvg={(selectedTable) => downloadTableFile(selectedTable, 'svg')}
              onDownloadPdf={(selectedTable) => downloadTableFile(selectedTable, 'pdf')}
            />
          ))}
        </div>
      </div>

      <TableQrPreviewModal
        open={Boolean(previewTable)}
        table={previewTable}
        previewUrl={previewUrl}
        onClose={() => {
          setPreviewTable(null);
          setPreviewUrl('');
        }}
        onCopyUrl={() => previewTable && handleCopyUrl(previewTable)}
        onDownloadSvg={() => previewTable && downloadTableFile(previewTable, 'svg')}
        onDownloadPdf={() => previewTable && downloadTableFile(previewTable, 'pdf')}
      />
    </div>
  );
};

export default AdminTablesQrPage;
