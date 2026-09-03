import React from 'react';
import { Contract, Invoice, FiscalYear } from '../types';
import { formatCurrency, formatDate, formatPercent, getBudgetAlertLevel, getStatusBadgeClass } from '../utils/formatters';
import { 
  Building2, 
  FileText, 
  PlusCircle, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  ArrowLeft,
  ChevronDown,
  Edit3,
  Trash2
} from 'lucide-react';

interface ContractDossierProps {
  contracts: Contract[];
  invoices: Invoice[];
  selectedContractId: string | null;
  onSelectContract: (id: string) => void;
  fiscalYear: FiscalYear;
  onOpenNewInvoiceForContract: (contractId: string) => void;
  onOpenEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onBackToDirectory: () => void;
}

export const ContractDossier: React.FC<ContractDossierProps> = ({
  contracts,
  invoices,
  selectedContractId,
  onSelectContract,
  fiscalYear,
  onOpenNewInvoiceForContract,
  onOpenEditInvoice,
  onDeleteInvoice,
  onBackToDirectory
}) => {
  const yearContracts = contracts.filter(c => c.fiscalYear === fiscalYear);
  
  // Si no hay contrato seleccionado, tomar el primero
  const currentContract = yearContracts.find(c => c.id === selectedContractId) || yearContracts[0];

  if (!currentContract) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No hay contratos registrados</h3>
        <p className="text-sm text-slate-500 mt-1">
          No hay contratos disponibles para el año fiscal {fiscalYear}.
        </p>
      </div>
    );
  }

  // Facturas de este contrato
  const contractInvoices = invoices.filter(i => i.contractId === currentContract.id);
  const validInvoices = contractInvoices.filter(i => i.status !== 'Rechazada');
  
  const spent = validInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const paid = validInvoices.filter(i => i.status === 'Pagada').reduce((sum, i) => sum + (i.amount || 0), 0);
  const balance = Math.max(0, currentContract.totalAmount - spent);
  const percent = currentContract.totalAmount > 0 ? (spent / currentContract.totalAmount) * 100 : 0;
  const alert = getBudgetAlertLevel(percent);

  // Imprimir expediente individual
  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Barra de Selección Rápida 1 a 1 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDirectory}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Lista</span>
          </button>

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Expediente:</span>
            <select
              value={currentContract.id}
              onChange={(e) => onSelectContract(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {yearContracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.contractNumber} — {c.contractor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Expediente</span>
          </button>

          <button
            onClick={() => onOpenNewInvoiceForContract(currentContract.id)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Factura para este Contrato</span>
          </button>
        </div>
      </div>

      {/* Ficha Oficial del Expediente (Visible e Imprimible) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 printable-card">
        {/* Encabezado Oficial Municipal para Impresión */}
        <div className="border-b border-slate-200 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Expediente Individual de Contrato (1 a 1)
                </span>
                <span className="text-xs text-slate-500">
                  Año Fiscal {currentContract.fiscalYear}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {currentContract.contractor}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {currentContract.description}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-xs text-slate-400 font-medium block">Número de Contrato</span>
              <span className="font-mono text-xl font-extrabold text-slate-900">
                {currentContract.contractNumber}
              </span>
              <span className="block text-xs font-semibold text-slate-500 mt-1">
                Partida: <span className="font-mono text-slate-700">{currentContract.budgetLine}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Departamento:</span>
              <span className="font-semibold text-slate-800">{currentContract.department || 'Desarrollo Económico, Turismo y Cultura'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tipo de Acuerdo:</span>
              <span className="font-semibold text-slate-800">
                {currentContract.isCreditLine ? 'Línea de Crédito' : 'Contrato Estándar'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha de Inicio:</span>
              <span className="font-semibold text-slate-800">{formatDate(currentContract.startDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Fecha de Vencimiento:</span>
              <span className="font-semibold text-slate-800">{formatDate(currentContract.endDate)}</span>
            </div>
          </div>
        </div>

        {/* Métricas Presupuestarias del Contrato Individual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Cuantía Tope Asignada
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(currentContract.totalAmount)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Límite máximo presupuestario
            </span>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Total Facturado
            </span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
              {formatCurrency(spent)}
            </span>
            <span className="text-[11px] text-amber-700 mt-0.5 block">
              {contractInvoices.length} facturas registradas
            </span>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Balance Disponible
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
              {formatCurrency(balance)}
            </span>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">
              Fondos libres para emitir facturas
            </span>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
              Ejecución Presupuestaria
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-indigo-900">
                {formatPercent(percent)}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${alert.bgColor} ${alert.textColor} ${alert.borderColor}`}>
                {alert.label}
              </span>
            </div>
            <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full ${percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, percent)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mensaje de 100% disponible si no hay gastos */}
        {spent === 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Fondos Intactos:</strong> Este contrato cuenta actualmente con el 100% de su presupuesto disponible ({formatCurrency(currentContract.totalAmount)}).
              No se han procesado facturas al momento.
            </div>
          </div>
        )}

        {/* Tabla de Facturas Exclusivas de este Contrato */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Historial de Facturas del Contrato ({contractInvoices.length})</span>
            </h3>
            <span className="text-xs text-slate-500">
              Total Pagado: <strong>{formatCurrency(paid)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Factura #</th>
                  <th className="py-2.5 px-4">Fecha Factura</th>
                  <th className="py-2.5 px-4">Concepto / Periodo</th>
                  <th className="py-2.5 px-4 text-right">Monto ($)</th>
                  <th className="py-2.5 px-4 text-center">Estado</th>
                  <th className="py-2.5 px-4">Envío a Finanzas</th>
                  <th className="py-2.5 px-4 text-center no-print">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No se han registrado facturas para este contrato.
                    </td>
                  </tr>
                ) : (
                  contractInvoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 font-medium leading-tight">
                          {invoice.concept}
                        </div>
                        {invoice.periodCovered && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            Periodo: {invoice.periodCovered}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {invoice.sentToFinance ? (
                          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium">
                            <Send className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Enviada: {formatDate(invoice.financeSentDate)}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pendiente de Envío
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditInvoice(invoice)}
                            title="Editar factura"
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
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
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloque de Firmas Oficiales para Impresión */}
        <div className="mt-12 pt-8 border-t border-slate-300 print-only hidden">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-slate-900 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-slate-900">Preparado por:</p>
              <p className="text-slate-800">Administradora de Sistemas de Oficina</p>
              <p className="text-slate-500">Dpto. Desarrollo Económico, Turismo y Cultura</p>
            </div>
            <div>
              <div className="border-b border-slate-900 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-slate-900">Aprobado por:</p>
              <p className="text-slate-800">Director(a) de Departamento</p>
              <p className="text-slate-500">Municipio Autónomo de Toa Baja</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
