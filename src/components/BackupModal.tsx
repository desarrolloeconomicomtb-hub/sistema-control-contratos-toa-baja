import React, { useRef } from 'react';
import { X, Database, Download, Upload, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DataService } from '../services/api';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  isLive: boolean;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  isLive
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Descargar copia de respaldo en formato JSON
  const handleDownloadBackup = async () => {
    try {
      const state = await DataService.getFullState();
      const backupData = {
        exportedAt: new Date().toISOString(),
        entity: 'Municipio Autónomo de Toa Baja',
        department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
        fiscalYears: state.fiscalYears,
        contracts: state.contracts,
        invoices: state.invoices
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_contratos_toa_baja_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error generando copia de respaldo: ' + err);
    }
  };

  // Restaurar desde un archivo JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.contracts || !Array.isArray(parsed.contracts)) {
          alert('El archivo no contiene un formato de respaldo válido de contratos.');
          return;
        }

        if (confirm(`¿Desea restaurar ${parsed.contracts.length} contratos y ${parsed.invoices?.length || 0} facturas? Esto reemplazará los datos actuales.`)) {
          localStorage.setItem('toa_baja_contratos_v1', JSON.stringify(parsed.contracts));
          localStorage.setItem('toa_baja_facturas_v1', JSON.stringify(parsed.invoices || []));
          if (parsed.fiscalYears) {
            localStorage.setItem('toa_baja_anios_fiscales_v1', JSON.stringify(parsed.fiscalYears));
          }

          // Si el backend está activo, enviarlo también
          if (isLive) {
            try {
              await fetch('/api/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed)
              });
            } catch (backendErr) {
              console.warn('Backend restore failed', backendErr);
            }
          }

          alert('Respaldo restaurado exitosamente.');
          onDataRestored();
          onClose();
        }
      } catch (err) {
        alert('Error al procesar el archivo: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // Restablecer a valores de fábrica
  const handleReset = async () => {
    if (confirm('¿Está seguro de restablecer el sistema a los valores oficiales de Toa Baja (6 contratos iniciales, $0 gastos)? Se borrarán las facturas ingresadas.')) {
      await DataService.resetToDefaults();
      alert('Sistema restablecido con éxito.');
      onDataRestored();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Copia de Seguridad y Respaldos</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <p className="text-slate-600 text-xs leading-relaxed">
            Puedes descargar un archivo con todos los contratos, facturas y fechas de envío a Finanzas para guardarlo en tu computadora o pasarlo a otra secretaria.
          </p>

          <div className="space-y-3 pt-2">
            {/* Botón Descargar Respaldo */}
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Descargar Copia de Respaldo (.json)</span>
                  <span className="text-[11px] text-slate-500">Guarda una copia completa de seguridad</span>
                </div>
              </div>
            </button>

            {/* Botón Cargar Respaldo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Restaurar Copia desde Archivo</span>
                  <span className="text-[11px] text-slate-500">Carga contratos y facturas previamente guardados</span>
                </div>
              </div>
            </button>

            {/* Restablecer Valores Iniciales */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-between p-3.5 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-200 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-rose-900 block">Restablecer a Valores Oficiales</span>
                  <span className="text-[11px] text-rose-600">6 contratos base de Toa Baja, $0 gastos</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
