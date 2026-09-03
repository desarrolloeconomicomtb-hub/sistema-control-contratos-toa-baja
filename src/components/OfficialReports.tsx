import React from 'react';
import { Contract, Invoice, FiscalYear } from '../types';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';
import { Printer, Download, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface OfficialReportsProps {
  contracts: Contract[];
  invoices: Invoice[];
  fiscalYear: FiscalYear;
}

export const OfficialReports: React.FC<OfficialReportsProps> = ({
  contracts,
  invoices,
  fiscalYear
}) => {
  const yearContracts = contracts.filter(c => c.fiscalYear === fiscalYear);
  const contractIds = new Set(yearContracts.map(c => c.id));
  const yearInvoices = invoices.filter(i => contractIds.has(i.contractId));

  const totalAllocated = yearContracts.reduce((s, c) => s + (c.totalAmount || 0), 0);
  const totalSpent = yearInvoices
    .filter(i => i.status !== 'Rechazada')
    .reduce((s, i) => s + (i.amount || 0), 0);
  const totalPaid = yearInvoices
    .filter(i => i.status === 'Pagada')
    .reduce((s, i) => s + (i.amount || 0), 0);
  const remainingBalance = Math.max(0, totalAllocated - totalSpent);
  const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Desglose por Partidas
  const budgetLinesMap = new Map<string, { allocated: number; spent: number }>();
  yearContracts.forEach(c => {
    const cur = budgetLinesMap.get(c.budgetLine) || { allocated: 0, spent: 0 };
    const cSpent = yearInvoices
      .filter(i => i.contractId === c.id && i.status !== 'Rechazada')
      .reduce((s, inv) => s + (inv.amount || 0), 0);
    budgetLinesMap.set(c.budgetLine, {
      allocated: cur.allocated + c.totalAmount,
      spent: cur.spent + cSpent
    });
  });

  const currentDate = new Date().toLocaleDateString('es-PR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Botonera Superior (No visible al imprimir) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between no-print">
        <div>
          <h3 className="font-bold text-slate-800 text-base">
            Informe Oficial Institucional
          </h3>
          <p className="text-xs text-slate-500">
            Formato listo para impresión oficial o exportación a PDF (Ctrl + P).
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Informe Oficial (PDF)</span>
        </button>
      </div>

      {/* DOCUMENTO OFICIAL FORMAL (Optimizado para papel o PDF) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 printable-card text-slate-900">
        {/* Encabezado Oficial Municipal */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
          <p className="text-xs tracking-widest font-semibold text-slate-600 uppercase">
            Estado Libre Asociado de Puerto Rico
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 mt-1 uppercase">
            Municipio Autónomo de Toa Baja
          </h1>
          <h2 className="text-sm md:text-base font-bold text-blue-900 mt-1">
            Departamento de Desarrollo Económico, Turismo y Cultura
          </h2>
          <div className="inline-block mt-3 bg-slate-100 border border-slate-300 px-4 py-1 rounded-full text-xs font-bold text-slate-800 uppercase tracking-wide">
            Informe de Ejecución Presupuestaria de Contratos — Año Fiscal {fiscalYear}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Fecha de Emisión: <strong>{currentDate}</strong>
          </p>
        </div>

        {/* Resumen Ejecutivo Consolidado */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded mb-3">
            I. Resumen Ejecutivo Presupuestario
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Presupuesto Asignado</span>
              <span className="text-lg font-extrabold text-slate-900 block mt-1">
                {formatCurrency(totalAllocated)}
              </span>
              <span className="text-[10px] text-slate-500">{yearContracts.length} contratos vigentes</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Facturado</span>
              <span className="text-lg font-extrabold text-amber-700 block mt-1">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-[10px] text-slate-500">{yearInvoices.length} facturas registradas</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Pagado</span>
              <span className="text-lg font-extrabold text-blue-800 block mt-1">
                {formatCurrency(totalPaid)}
              </span>
              <span className="text-[10px] text-slate-500">Desembolsos confirmados</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Balance Disponible</span>
              <span className="text-lg font-extrabold text-emerald-700 block mt-1">
                {formatCurrency(remainingBalance)}
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold">{formatPercent(100 - percentUsed)} disponible</span>
            </div>
          </div>
        </div>

        {/* Tabla II: Desglose por Partidas Presupuestarias */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded mb-3">
            II. Desglose por Partidas Presupuestarias Municipales
          </h3>
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300">Partida Presupuestaria</th>
                <th className="p-2.5 text-right border-r border-slate-300">Cuantía Asignada</th>
                <th className="p-2.5 text-right border-r border-slate-300">Total Facturado</th>
                <th className="p-2.5 text-right border-r border-slate-300">Balance Disponible</th>
                <th className="p-2.5 text-center">% Ejecución</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(budgetLinesMap.entries()).map(([line, data]) => {
                const bal = data.allocated - data.spent;
                const pct = data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0;
                return (
                  <tr key={line} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-semibold border-r border-slate-300">{line}</td>
                    <td className="p-2 text-right border-r border-slate-300 font-medium">{formatCurrency(data.allocated)}</td>
                    <td className="p-2 text-right border-r border-slate-300 text-amber-800 font-medium">{formatCurrency(data.spent)}</td>
                    <td className="p-2 text-right border-r border-slate-300 text-emerald-800 font-bold">{formatCurrency(bal)}</td>
                    <td className="p-2 text-center font-bold">{formatPercent(pct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tabla III: Desglose Oficial de Contratos */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded mb-3">
            III. Detalle de Contratos y Acuerdos Vigentes
          </h3>
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300">Núm. Contrato</th>
                <th className="p-2.5 border-r border-slate-300">Entidad / Contratista</th>
                <th className="p-2.5 border-r border-slate-300">Partida</th>
                <th className="p-2.5 text-right border-r border-slate-300">Cuantía Asignada</th>
                <th className="p-2.5 text-right border-r border-slate-300">Gastado</th>
                <th className="p-2.5 text-right border-r border-slate-300">Disponible</th>
                <th className="p-2.5 text-center">% Ejec.</th>
              </tr>
            </thead>
            <tbody>
              {yearContracts.map(c => {
                const cSpent = yearInvoices
                  .filter(i => i.contractId === c.id && i.status !== 'Rechazada')
                  .reduce((s, inv) => s + (inv.amount || 0), 0);
                const cBal = c.totalAmount - cSpent;
                const cPct = c.totalAmount > 0 ? (cSpent / c.totalAmount) * 100 : 0;
                return (
                  <tr key={c.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border-r border-slate-300">{c.contractNumber}</td>
                    <td className="p-2 border-r border-slate-300">
                      <div className="font-bold text-slate-900">{c.contractor}</div>
                      <div className="text-[10px] text-slate-500">{c.description}</div>
                    </td>
                    <td className="p-2 font-mono text-[11px] border-r border-slate-300">{c.budgetLine}</td>
                    <td className="p-2 text-right border-r border-slate-300 font-semibold">{formatCurrency(c.totalAmount)}</td>
                    <td className="p-2 text-right border-r border-slate-300 text-amber-800 font-medium">{formatCurrency(cSpent)}</td>
                    <td className="p-2 text-right border-r border-slate-300 text-emerald-800 font-bold">{formatCurrency(cBal)}</td>
                    <td className="p-2 text-center font-bold">{formatPercent(cPct)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-950 border-t-2 border-slate-400">
                <td colSpan={3} className="p-2.5 text-right border-r border-slate-300 uppercase">Totales Oficiales:</td>
                <td className="p-2.5 text-right border-r border-slate-300">{formatCurrency(totalAllocated)}</td>
                <td className="p-2.5 text-right border-r border-slate-300 text-amber-800">{formatCurrency(totalSpent)}</td>
                <td className="p-2.5 text-right border-r border-slate-300 text-emerald-800">{formatCurrency(remainingBalance)}</td>
                <td className="p-2.5 text-center">{formatPercent(percentUsed)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tabla IV: Facturas y Trámite con Finanzas */}
        {yearInvoices.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded mb-3">
              IV. Registro de Facturas y Estado de Envío a la Oficina de Finanzas
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Factura #</th>
                  <th className="p-2 border-r border-slate-300">Contratista</th>
                  <th className="p-2 border-r border-slate-300">Concepto</th>
                  <th className="p-2 text-right border-r border-slate-300">Monto</th>
                  <th className="p-2 border-r border-slate-300">Fecha Factura</th>
                  <th className="p-2 text-center border-r border-slate-300">Estado</th>
                  <th className="p-2">Fecha Envío a Finanzas</th>
                </tr>
              </thead>
              <tbody>
                {yearInvoices.map(inv => {
                  const contract = contracts.find(c => c.id === inv.contractId);
                  return (
                    <tr key={inv.id} className="border-b border-slate-200">
                      <td className="p-2 font-mono font-bold border-r border-slate-300">{inv.invoiceNumber}</td>
                      <td className="p-2 border-r border-slate-300 font-medium">{contract?.contractor || inv.contractorName}</td>
                      <td className="p-2 border-r border-slate-300">{inv.concept}</td>
                      <td className="p-2 text-right border-r border-slate-300 font-bold">{formatCurrency(inv.amount)}</td>
                      <td className="p-2 border-r border-slate-300">{formatDate(inv.invoiceDate)}</td>
                      <td className="p-2 text-center border-r border-slate-300 font-semibold">{inv.status}</td>
                      <td className="p-2">
                        {inv.sentToFinance ? formatDate(inv.financeSentDate) : 'Pendiente de envío'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Certificación y Bloque Oficial de Firmas */}
        <div className="mt-16 pt-8 border-t-2 border-slate-400">
          <p className="text-[11px] text-slate-600 text-center italic mb-10">
            Certifico que la información de contratos, montos facturados y fechas de envío a la Oficina de Finanzas aquí consignada es fiel y exacta conforme a los registros y comprobantes radicados en el Departamento de Desarrollo Económico, Turismo y Cultura.
          </p>

          <div className="grid grid-cols-2 gap-16 text-center text-xs">
            <div>
              <div className="border-b-2 border-slate-900 w-4/5 mx-auto mb-2"></div>
              <p className="font-extrabold text-slate-950 uppercase tracking-wide">
                Preparado y Certificado por:
              </p>
              <p className="font-bold text-slate-900 mt-1">
                Administradora de Sistemas de Oficina
              </p>
              <p className="text-slate-600 text-[11px]">
                Departamento de Desarrollo Económico, Turismo y Cultura
              </p>
              <p className="text-slate-500 text-[10px]">
                Municipio Autónomo de Toa Baja
              </p>
            </div>

            <div>
              <div className="border-b-2 border-slate-900 w-4/5 mx-auto mb-2"></div>
              <p className="font-extrabold text-slate-950 uppercase tracking-wide">
                Revisado y Aprobado por:
              </p>
              <p className="font-bold text-slate-900 mt-1">
                Director(a) de Departamento
              </p>
              <p className="text-slate-600 text-[11px]">
                Departamento de Desarrollo Económico, Turismo y Cultura
              </p>
              <p className="text-slate-500 text-[10px]">
                Municipio Autónomo de Toa Baja
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
