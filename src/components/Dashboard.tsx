import React from 'react';
import { 
  Contract, 
  Invoice, 
  FiscalYear 
} from '../types';
import { 
  formatCurrency, 
  formatPercent, 
  getBudgetAlertLevel 
} from '../utils/formatters';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Layers, 
  ArrowUpRight, 
  Building2, 
  FileCheck2,
  Send
} from 'lucide-react';

interface DashboardProps {
  fiscalYear: FiscalYear;
  contracts: Contract[];
  invoices: Invoice[];
  onSelectContractForDossier: (contractId: string) => void;
  onOpenNewInvoiceForContract: (contractId: string) => void;
  onOpenNewContract: () => void;
  onOpenNewInvoice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  fiscalYear,
  contracts,
  invoices,
  onSelectContractForDossier,
  onOpenNewInvoiceForContract,
  onOpenNewContract,
  onOpenNewInvoice
}) => {
  // Filtrar contratos del año fiscal activo
  const yearContracts = contracts.filter(c => c.fiscalYear === fiscalYear);
  const contractIds = new Set(yearContracts.map(c => c.id));
  const yearInvoices = invoices.filter(i => contractIds.has(i.contractId));

  // Cálculos globales
  const totalAllocated = yearContracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  
  // Total facturado (aprobadas y pagadas; pendientes también computan compromiso)
  const totalSpent = yearInvoices
    .filter(i => i.status !== 'Rechazada')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const totalPaid = yearInvoices
    .filter(i => i.status === 'Pagada')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const totalPendingPayment = yearInvoices
    .filter(i => i.status === 'Pendiente' || i.status === 'Aprobada')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const remainingBalance = Math.max(0, totalAllocated - totalSpent);
  const globalPercentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Facturas pendientes de envío a finanzas
  const pendingFinanceInvoices = yearInvoices.filter(i => !i.sentToFinance && i.status !== 'Rechazada');

  // Cálculos individuales por contrato
  const contractStats = yearContracts.map(contract => {
    const cInvoices = yearInvoices.filter(i => i.contractId === contract.id && i.status !== 'Rechazada');
    const spent = cInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const balance = contract.totalAmount - spent;
    const percent = contract.totalAmount > 0 ? (spent / contract.totalAmount) * 100 : 0;
    return {
      contract,
      spent,
      balance,
      percent,
      invoicesCount: cInvoices.length,
      alert: getBudgetAlertLevel(percent)
    };
  });

  // Agrupación por partida presupuestaria
  const budgetLinesMap = new Map<string, { allocated: number; spent: number; contractsCount: number }>();
  yearContracts.forEach(c => {
    const current = budgetLinesMap.get(c.budgetLine) || { allocated: 0, spent: 0, contractsCount: 0 };
    const cSpent = yearInvoices
      .filter(i => i.contractId === c.id && i.status !== 'Rechazada')
      .reduce((s, inv) => s + (inv.amount || 0), 0);
    budgetLinesMap.set(c.budgetLine, {
      allocated: current.allocated + c.totalAmount,
      spent: current.spent + cSpent,
      contractsCount: current.contractsCount + 1
    });
  });

  const budgetLinesList = Array.from(budgetLinesMap.entries()).map(([line, data]) => ({
    line,
    ...data,
    balance: data.allocated - data.spent,
    percent: data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Año Fiscal: {fiscalYear}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Municipio Autónomo de Toa Baja
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Resumen General de Ejecución Presupuestaria
          </h2>
          <p className="text-sm text-slate-600">
            Control en vivo de cuantías, facturas procesadas y balances disponibles para el Dpto. de Desarrollo Económico, Turismo y Cultura.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewContract}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition border border-slate-300"
          >
            + Añadir Contrato
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow"
          >
            + Registrar Factura
          </button>
        </div>
      </div>

      {/* Tarjetas KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Presupuesto Total */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Presupuesto Contratado
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalAllocated)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {yearContracts.length} contratos vigentes
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </div>

        {/* Total Facturado / Gastado */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Facturado / Comprometido
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalSpent)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                {formatPercent(globalPercentUsed)} ejecutado
              </span>
              <span className="text-xs text-slate-500">
                {yearInvoices.length} facturas
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Balance Disponible */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Balance Libre Disponible
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600">
              {formatCurrency(remainingBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatPercent(100 - globalPercentUsed)} disponible para facturar
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Pendiente Finanzas / Pagos */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trámites de Finanzas
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalPendingPayment)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Send className="w-3 h-3 text-indigo-500" />
              <span>{pendingFinanceInvoices.length} facturas sin enviar a Finanzas</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </div>
      </div>

      {/* Banner de Estado Inicial / Sin Gastos */}
      {totalSpent === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold text-emerald-900">
              Presupuesto Disponible al 100% (Sin gastos registrados al momento):
            </span>
            <p className="text-emerald-800 mt-0.5">
              Todos los contratos para el año fiscal {fiscalYear} cuentan con la totalidad de sus fondos disponibles ({formatCurrency(totalAllocated)}). 
              Tan pronto la Administradora de Sistemas de Oficina ingrese las facturas, el sistema deducirá automáticamente los balances.
            </p>
          </div>
        </div>
      )}

      {/* Lista de Contratos y Monitoreo de Cuantías (1 a 1) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Monitoreo de Contratos Oficiales ({yearContracts.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en "Ver Expediente" en cualquier contrato para gestionar sus facturas de forma individual (1 a 1).
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {contractStats.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay contratos registrados para el año fiscal {fiscalYear}.
            </div>
          ) : (
            contractStats.map(({ contract, spent, balance, percent, invoicesCount, alert }) => (
              <div key={contract.id} className="p-5 hover:bg-slate-50/70 transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Detalle del Contrato */}
                  <div className="space-y-1 lg:w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {contract.contractNumber}
                      </span>
                      {contract.isCreditLine && (
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Línea de Crédito
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${alert.bgColor} ${alert.textColor} ${alert.borderColor}`}>
                        {alert.label}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 leading-snug">
                      {contract.contractor}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {contract.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">Partida:</span>
                      <span className="font-mono">{contract.budgetLine}</span>
                    </div>
                  </div>

                  {/* Números Financieros */}
                  <div className="grid grid-cols-3 gap-3 lg:w-1/3 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Cuantía Tope
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(contract.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Gastado
                      </span>
                      <span className="text-sm font-bold text-amber-600">
                        {formatCurrency(spent)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Disponible
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso y Acciones */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 lg:w-1/4">
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>{invoicesCount} facturas</span>
                        <span className="font-bold">{formatPercent(percent)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            percent >= 90
                              ? 'bg-red-500'
                              : percent >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        onClick={() => onOpenNewInvoiceForContract(contract.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
                      >
                        + Factura
                      </button>
                      <button
                        onClick={() => onSelectContractForDossier(contract.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition shadow-sm"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Ver Expediente</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desglose por Partida Presupuestaria */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Distribución por Partidas Presupuestarias Municipales</span>
          </h3>
          <span className="text-xs text-slate-500">
            {budgetLinesList.length} partidas activas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgetLinesList.map(item => (
            <div key={item.line} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded">
                  {item.line}
                </span>
                <span className="text-slate-500 font-medium">
                  {item.contractsCount} contratos
                </span>
              </div>

              <div className="space-y-1 my-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Asignado:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(item.allocated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ejecutado:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(item.spent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disponible:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(item.balance)}</span>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
