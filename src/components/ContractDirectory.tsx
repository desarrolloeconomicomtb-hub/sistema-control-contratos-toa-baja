import React, { useState } from 'react';
import { Contract, Invoice, FiscalYear } from '../types';
import { formatCurrency, formatDate, formatPercent, getBudgetAlertLevel } from '../utils/formatters';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  FileCheck2, 
  Calendar, 
  Filter,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';

interface ContractDirectoryProps {
  contracts: Contract[];
  invoices: Invoice[];
  fiscalYear: FiscalYear;
  onSelectContractForDossier: (contractId: string) => void;
  onOpenEditContract: (contract: Contract) => void;
  onOpenNewContract: () => void;
  onDeleteContract: (contractId: string) => void;
}

export const ContractDirectory: React.FC<ContractDirectoryProps> = ({
  contracts,
  invoices,
  fiscalYear,
  onSelectContractForDossier,
  onOpenEditContract,
  onOpenNewContract,
  onDeleteContract
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'standard'>('all');

  // Filtrar contratos del año fiscal activo
  const yearContracts = contracts.filter(c => c.fiscalYear === fiscalYear);

  const filteredContracts = yearContracts.filter(c => {
    const matchesSearch = 
      c.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.budgetLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'credit') return matchesSearch && c.isCreditLine;
    if (filterType === 'standard') return matchesSearch && !c.isCreditLine;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado y Barra de Búsqueda */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Directorio Oficial de Contratos Municipales</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Contratos Vigentes ({fiscalYear})
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Catálogo de contratos y líneas de crédito asignados al Departamento.
            </p>
          </div>

          <button
            onClick={onOpenNewContract}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Añadir Nuevo Contrato</span>
          </button>
        </div>

        {/* Filtros y Buscador */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por contratista, número de contrato o partida presupuestaria..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({yearContracts.length})
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                filterType === 'credit'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Líneas de Crédito
            </button>
            <button
              onClick={() => setFilterType('standard')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition ${
                filterType === 'standard'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Estándar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Contratos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Contrato / Núm.</th>
                <th className="py-3.5 px-4">Contratista & Descripción</th>
                <th className="py-3.5 px-4">Partida Presupuestaria</th>
                <th className="py-3.5 px-4 text-right">Cuantía Asignada</th>
                <th className="py-3.5 px-4 text-right">Gastado</th>
                <th className="py-3.5 px-4 text-right">Disponible</th>
                <th className="py-3.5 px-4 text-center">Ejecución</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron contratos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredContracts.map(contract => {
                  const cInvoices = invoices.filter(i => i.contractId === contract.id && i.status !== 'Rechazada');
                  const spent = cInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
                  const balance = contract.totalAmount - spent;
                  const percent = contract.totalAmount > 0 ? (spent / contract.totalAmount) * 100 : 0;
                  const alert = getBudgetAlertLevel(percent);

                  return (
                    <tr key={contract.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 block w-fit">
                          {contract.contractNumber}
                        </span>
                        {contract.isCreditLine && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-1 inline-block">
                            Línea de Crédito
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="font-bold text-slate-900 leading-tight">
                          {contract.contractor}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {contract.description}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Vigencia: {formatDate(contract.startDate)} al {formatDate(contract.endDate)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {contract.budgetLine}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-top text-right font-semibold text-slate-900">
                        {formatCurrency(contract.totalAmount)}
                      </td>

                      <td className="py-4 px-4 align-top text-right font-semibold text-amber-600">
                        {formatCurrency(spent)}
                      </td>

                      <td className="py-4 px-4 align-top text-right font-bold text-emerald-600">
                        {formatCurrency(balance)}
                      </td>

                      <td className="py-4 px-4 align-top text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-bold ${alert.textColor}`}>
                            {formatPercent(percent)}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${
                                percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectContractForDossier(contract.id)}
                            title="Ver expediente individual (1 a 1)"
                            className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                          >
                            <FileCheck2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditContract(contract)}
                            title="Editar contrato"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Está seguro de eliminar el contrato ${contract.contractNumber} (${contract.contractor})? Esta acción no se puede deshacer.`)) {
                                onDeleteContract(contract.id);
                              }
                            }}
                            title="Eliminar contrato"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
