import React, { useState } from 'react';
import { Contract, Invoice, FiscalYear, InvoiceStatus } from '../types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Download, 
  Send, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Filter,
  Check
} from 'lucide-react';

interface InvoiceRegistryProps {
  invoices: Invoice[];
  contracts: Contract[];
  fiscalYear: FiscalYear;
  onOpenNewInvoice: () => void;
  onOpenEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

export const InvoiceRegistry: React.FC<InvoiceRegistryProps> = ({
  invoices,
  contracts,
  fiscalYear,
  onOpenNewInvoice,
  onOpenEditInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFinance, setFilterFinance] = useState<string>('all');
  const [filterContract, setFilterContract] = useState<string>('all');

  // Filtrar por año fiscal
  const yearContracts = contracts.filter(c => c.fiscalYear === fiscalYear);
  const contractIds = new Set(yearContracts.map(c => c.id));
  const yearInvoices = invoices.filter(i => contractIds.has(i.contractId));

  // Mapa rápido de ID contrato a Contrato
  const contractsMap = new Map(contracts.map(c => [c.id, c]));

  // Filtrar facturas
  const filteredInvoices = yearInvoices.filter(invoice => {
    const contract = contractsMap.get(invoice.contractId);
    const contractorName = contract ? contract.contractor : (invoice.contractorName || '');

    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.concept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    let matchesFinance = true;
    if (filterFinance === 'sent') matchesFinance = invoice.sentToFinance;
    if (filterFinance === 'pending') matchesFinance = !invoice.sentToFinance;

    const matchesContract = filterContract === 'all' || invoice.contractId === filterContract;

    return matchesSearch && matchesStatus && matchesFinance && matchesContract;
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No hay facturas para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'Factura Núm',
      'Contratista',
      'Contrato Núm',
      'Partida',
      'Concepto',
      'Monto ($)',
      'Fecha Factura',
      'Periodo',
      'Estado',
      'Enviada a Finanzas',
      'Fecha Envío Finanzas'
    ];

    const rows = filteredInvoices.map(inv => {
      const contract = contractsMap.get(inv.contractId);
      return [
        `"${inv.invoiceNumber}"`,
        `"${contract?.contractor || inv.contractorName || ''}"`,
        `"${contract?.contractNumber || ''}"`,
        `"${contract?.budgetLine || ''}"`,
        `"${inv.concept.replace(/"/g, '""')}"`,
        inv.amount.toFixed(2),
        inv.invoiceDate,
        `"${inv.periodCovered || ''}"`,
        `"${inv.status}"`,
        inv.sentToFinance ? 'Sí' : 'No',
        inv.financeSentDate || ''
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registro_facturas_toa_baja_${fiscalYear}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredAmount = filteredInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalSentToFinance = filteredInvoices.filter(i => i.sentToFinance).length;

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Gestión de Facturación y Trámites de Finanzas</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Registro General de Facturas ({fiscalYear})
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Control de facturas radicadas, aprobación y seguimiento de envío a la Oficina de Finanzas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onOpenNewInvoice}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registrar Factura</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar factura o contratista..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <select
              value={filterContract}
              onChange={(e) => setFilterContract(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Todos los Contratos ({yearContracts.length})</option>
              {yearContracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.contractNumber} — {c.contractor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Pagada">Pagada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div>
            <select
              value={filterFinance}
              onChange={(e) => setFilterFinance(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Estado en Finanzas: Todos</option>
              <option value="sent">Enviadas a Finanzas</option>
              <option value="pending">Pendientes de Envío</option>
            </select>
          </div>
        </div>

        {/* Resumen de totales filtrados */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
          <span>Mostrando <strong>{filteredInvoices.length}</strong> facturas</span>
          <div className="flex items-center gap-4 font-medium">
            <span>Enviadas a Finanzas: <strong className="text-indigo-700">{totalSentToFinance}</strong></span>
            <span>Monto Total Filtrado: <strong className="text-slate-900">{formatCurrency(totalFilteredAmount)}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Factura #</th>
                <th className="py-3 px-4">Contratista / Contrato</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4 text-right">Monto ($)</th>
                <th className="py-3 px-4">Fecha Factura</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Envío a Finanzas</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No hay facturas que coincidan con la búsqueda o filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => {
                  const contract = contractsMap.get(invoice.contractId);
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 leading-tight">
                          {contract?.contractor || invoice.contractorName || '—'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {contract?.contractNumber} | {contract?.budgetLine}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="text-slate-800 text-xs font-medium leading-snug">
                          {invoice.concept}
                        </div>
                        {invoice.periodCovered && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Periodo: {invoice.periodCovered}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {formatDate(invoice.invoiceDate)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={invoice.status}
                          onChange={(e) => onUpdateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadgeClass(invoice.status)}`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Aprobada">Aprobada</option>
                          <option value="Pagada">Pagada</option>
                          <option value="Rechazada">Rechazada</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        {invoice.sentToFinance ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-medium">
                            <Send className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Enviada: {formatDate(invoice.financeSentDate)}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pendiente de Envío</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditInvoice(invoice)}
                            title="Editar factura"
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la factura ${invoice.invoiceNumber}?`)) {
                                onDeleteInvoice(invoice.id);
                              }
                            }}
                            title="Eliminar factura"
                            className="p-1 hover:bg-rose-100 rounded text-rose-600 transition"
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
