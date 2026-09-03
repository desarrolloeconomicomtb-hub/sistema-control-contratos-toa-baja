import React, { useState, useEffect } from 'react';
import { Contract, Invoice, FiscalYear, InvoiceStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { X, Send, AlertTriangle, CheckCircle2, FileText, Calendar, DollarSign } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  contracts: Contract[];
  invoices: Invoice[];
  fiscalYear: FiscalYear;
  initialContractId?: string | null;
  invoiceToEdit?: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contracts,
  invoices,
  fiscalYear,
  initialContractId,
  invoiceToEdit
}) => {
  const yearContracts = contracts.filter(c => c.fiscalYear === fiscalYear);

  const [contractId, setContractId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>('');
  const [periodCovered, setPeriodCovered] = useState<string>('');
  const [status, setStatus] = useState<InvoiceStatus>('Pendiente');
  const [sentToFinance, setSentToFinance] = useState<boolean>(false);
  const [financeSentDate, setFinanceSentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (invoiceToEdit) {
      setContractId(invoiceToEdit.contractId);
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setConcept(invoiceToEdit.concept);
      setAmount(invoiceToEdit.amount.toString());
      setInvoiceDate(invoiceToEdit.invoiceDate);
      setPeriodCovered(invoiceToEdit.periodCovered || '');
      setStatus(invoiceToEdit.status);
      setSentToFinance(invoiceToEdit.sentToFinance || false);
      setFinanceSentDate(invoiceToEdit.financeSentDate || '');
      setNotes(invoiceToEdit.notes || '');
    } else {
      setContractId(initialContractId || (yearContracts[0]?.id || ''));
      setInvoiceNumber('');
      setConcept('');
      setAmount('');
      setInvoiceDate(todayStr);
      setPeriodCovered('');
      setStatus('Pendiente');
      setSentToFinance(false);
      setFinanceSentDate(todayStr);
      setNotes('');
    }
  }, [isOpen, invoiceToEdit, initialContractId, fiscalYear]);

  if (!isOpen) return null;

  // Contrato seleccionado y su balance
  const selectedContract = contracts.find(c => c.id === contractId);

  // Calcular balance disponible actual de ese contrato
  const existingSpent = invoices
    .filter(i => i.contractId === contractId && i.id !== invoiceToEdit?.id && i.status !== 'Rechazada')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const contractTotal = selectedContract?.totalAmount || 0;
  const currentAvailable = Math.max(0, contractTotal - existingSpent);

  const parsedAmount = parseFloat(amount) || 0;
  const newBalance = currentAvailable - parsedAmount;
  const isOverbudget = parsedAmount > currentAvailable;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) {
      alert('Por favor seleccione un contrato.');
      return;
    }
    if (!invoiceNumber.trim()) {
      alert('Por favor ingrese el número de factura.');
      return;
    }
    if (parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido mayor a $0.');
      return;
    }
    if (!concept.trim()) {
      alert('Por favor describa el concepto de la factura.');
      return;
    }

    const invoiceData: Invoice = {
      id: invoiceToEdit ? invoiceToEdit.id : `inv-${Date.now()}`,
      contractId,
      contractorName: selectedContract?.contractor || '',
      invoiceNumber: invoiceNumber.trim(),
      concept: concept.trim(),
      amount: parsedAmount,
      invoiceDate: invoiceDate || todayStr,
      periodCovered: periodCovered.trim() || undefined,
      status,
      sentToFinance,
      financeSentDate: sentToFinance ? (financeSentDate || todayStr) : undefined,
      notes: notes.trim() || undefined,
      createdAt: invoiceToEdit ? invoiceToEdit.createdAt : new Date().toISOString()
    };

    onSave(invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Encabezado del Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {invoiceToEdit ? 'Editar Factura' : 'Registrar Nueva Factura'}
              </h3>
              <p className="text-xs text-slate-400">
                Municipio Autónomo de Toa Baja — Dpto. Desarrollo Económico, Turismo y Cultura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selección de Contrato */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contrato Asociado *
            </label>
            <select
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              required
            >
              <option value="">Seleccione un contrato...</option>
              {yearContracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.contractNumber} — {c.contractor} ({formatCurrency(c.totalAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Tarjeta de Impacto Presupuestario en Tiempo Real */}
          {selectedContract && (
            <div className={`p-4 rounded-xl border text-xs transition ${
              isOverbudget 
                ? 'bg-red-50 border-red-300 text-red-900' 
                : 'bg-blue-50/70 border-blue-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between font-bold mb-2">
                <span>Impacto Presupuestario del Contrato:</span>
                <span className="font-mono">{selectedContract.budgetLine}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Disponible Actual</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(currentAvailable)}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Esta Factura</span>
                  <span className="font-bold text-amber-600 text-sm">
                    {formatCurrency(parsedAmount)}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Balance Resultante</span>
                  <span className={`font-bold text-sm ${isOverbudget ? 'text-rose-700 font-extrabold' : 'text-slate-900'}`}>
                    {formatCurrency(newBalance)}
                  </span>
                </div>
              </div>

              {isOverbudget && (
                <div className="mt-2 flex items-center gap-1.5 text-red-700 font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>¡Alerta! La factura supera el balance disponible del contrato por {formatCurrency(Math.abs(newBalance))}.</span>
                </div>
              )}
            </div>
          )}

          {/* Fila: Número de Factura y Monto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número de Factura *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="ej. FACT-2026-001 o 10452"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monto Facturado ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fila: Concepto / Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Concepto / Detalle del Servicio *
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="ej. Muestreo de calidad de aguas en balneario julio 2026"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Fila: Fecha de Factura y Periodo Facturado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Emisión de Factura *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Periodo Facturado (Opcional)
              </label>
              <input
                type="text"
                value={periodCovered}
                onChange={(e) => setPeriodCovered(e.target.value)}
                placeholder="ej. Julio 2026 o 1 al 15 de agosto"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Fila: Estado de la Factura */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Estado de la Factura
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-medium"
            >
              <option value="Pendiente">Pendiente de Aprobación</option>
              <option value="Aprobada">Aprobada para Pago</option>
              <option value="Pagada">Pagada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          {/* SECCIÓN CRÍTICA: TRÁMITE CON LA OFICINA DE FINANZAS */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Trámite con la Oficina de Finanzas
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sentToFinance}
                  onChange={(e) => {
                    setSentToFinance(e.target.checked);
                    if (e.target.checked && !financeSentDate) {
                      setFinanceSentDate(todayStr);
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-indigo-900">
                  ¿Factura enviada a Finanzas?
                </span>
              </label>
            </div>

            {sentToFinance && (
              <div className="pt-2 border-t border-indigo-200/60 flex items-center gap-3">
                <label className="text-xs font-semibold text-indigo-900 whitespace-nowrap">
                  Fecha en que se envía a la Oficina de Finanzas:
                </label>
                <input
                  type="date"
                  value={financeSentDate}
                  onChange={(e) => setFinanceSentDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg focus:outline-none font-semibold text-indigo-950"
                  required={sentToFinance}
                />
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md hover:shadow-blue-500/20"
            >
              {invoiceToEdit ? 'Guardar Cambios' : 'Registrar Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
