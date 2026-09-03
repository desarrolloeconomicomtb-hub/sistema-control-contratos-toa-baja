import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  FileCheck2, 
  LayoutDashboard, 
  PlusCircle, 
  Printer, 
  Calendar, 
  Radio, 
  HelpCircle,
  Database,
  Plus
} from 'lucide-react';
import { FiscalYear } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'contracts' | 'dossier' | 'invoices' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'contracts' | 'dossier' | 'invoices' | 'reports') => void;
  fiscalYears: FiscalYear[];
  selectedFiscalYear: FiscalYear;
  onSelectFiscalYear: (year: FiscalYear) => void;
  onAddNewFiscalYear: (year: string) => void;
  onOpenNewContract: () => void;
  onOpenNewInvoice: () => void;
  onOpenBackupModal: () => void;
  isLive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fiscalYears,
  selectedFiscalYear,
  onSelectFiscalYear,
  onAddNewFiscalYear,
  onOpenNewContract,
  onOpenNewInvoice,
  onOpenBackupModal,
  isLive
}) => {
  const [showAddYearInput, setShowAddYearInput] = useState(false);
  const [newYearString, setNewYearString] = useState('');

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (newYearString.trim()) {
      onAddNewFiscalYear(newYearString.trim());
      setNewYearString('');
      setShowAddYearInput(false);
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40">
      {/* Barra superior de identificación institucional */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-semibold text-slate-200 tracking-wide">
              MUNICIPIO AUTÓNOMO DE TOA BAJA
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              Departamento de Desarrollo Económico, Turismo y Cultura
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicador de Estado de Conexión en Vivo */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className={isLive ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {isLive ? 'Sincronización en Vivo (Multiusuario)' : 'Modo Almacenamiento Local'}
              </span>
            </div>

            <div className="text-slate-400">
              Operador: <span className="text-amber-300 font-medium">Administradora de Sistemas de Oficina</span>
            </div>

            <button
              onClick={onOpenBackupModal}
              title="Copia de Seguridad y Restauración"
              className="text-slate-400 hover:text-white flex items-center gap-1 text-xs bg-slate-800/80 hover:bg-slate-800 px-2 py-1 rounded transition border border-slate-700"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Respaldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra principal de navegación */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logotipo y Título de la App */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-md border border-blue-400/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight tracking-tight">
              Control de Contratos y Facturas
            </h1>
            <p className="text-xs text-slate-400">
              Monitoreo Presupuestario y Auditoría de Facturación
            </p>
          </div>
        </div>

        {/* Selector de Año Fiscal */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-sm">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-medium">Año Fiscal:</span>
          
          {!showAddYearInput ? (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedFiscalYear}
                onChange={(e) => onSelectFiscalYear(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-sm"
              >
                {fiscalYears.map((year) => (
                  <option key={year} value={year} className="bg-slate-900 text-white">
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAddYearInput(true)}
                title="Añadir nuevo Año Fiscal"
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddYear} className="flex items-center gap-1">
              <input
                type="text"
                value={newYearString}
                onChange={(e) => setNewYearString(e.target.value)}
                placeholder="ej. 2027-2028"
                className="w-24 bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-semibold rounded"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowAddYearInput(false)}
                className="px-1.5 py-0.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        {/* Botones de Acción Primaria */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewContract}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-slate-500 px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>+ Nuevo Contrato</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-blue-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>+ Registrar Factura</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación Secundaria */}
      <div className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Resumen Ejecutivo</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'contracts'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Directorio de Contratos</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'dossier'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Expediente Individual (1 a 1)</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Facturas & Oficina de Finanzas</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Informes Oficiales Imprimibles</span>
          </button>
        </div>
      </div>
    </header>
  );
};
