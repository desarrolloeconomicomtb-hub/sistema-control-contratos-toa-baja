import React, { useState, useEffect } from 'react';
import { Contract, FiscalYear } from '../types';
import { X, Building2, DollarSign, Calendar, Tag, ShieldCheck } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Contract) => void;
  fiscalYears: FiscalYear[];
  activeFiscalYear: FiscalYear;
  contractToEdit?: Contract | null;
}

const COMMON_BUDGET_LINES = [
  '01-19-27-27-00-00-94.11',
  '01-61-04-00-00-94.84',
  '02-04-04-00-00-94.51'
];

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fiscalYears,
  activeFiscalYear,
  contractToEdit
}) => {
  const [contractNumber, setContractNumber] = useState('');
  const [contractor, setContractor] = useState('');
  const [description, setDescription] = useState('');
  const [fiscalYear, setFiscalYear] = useState<FiscalYear>(activeFiscalYear);
  const [budgetLine, setBudgetLine] = useState('');
  const [customBudgetLine, setCustomBudgetLine] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreditLine, setIsCreditLine] = useState(false);
  const [department, setDepartment] = useState('Departamento de Desarrollo Económico, Turismo y Cultura');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (contractToEdit) {
      setContractNumber(contractToEdit.contractNumber);
      setContractor(contractToEdit.contractor);
      setDescription(contractToEdit.description);
      setFiscalYear(contractToEdit.fiscalYear);
      if (COMMON_BUDGET_LINES.includes(contractToEdit.budgetLine)) {
        setBudgetLine(contractToEdit.budgetLine);
        setCustomBudgetLine('');
      } else {
        setBudgetLine('custom');
        setCustomBudgetLine(contractToEdit.budgetLine);
      }
      setTotalAmount(contractToEdit.totalAmount.toString());
      setStartDate(contractToEdit.startDate);
      setEndDate(contractToEdit.endDate);
      setIsCreditLine(contractToEdit.isCreditLine || false);
      setDepartment(contractToEdit.department || 'Departamento de Desarrollo Económico, Turismo y Cultura');
      setNotes(contractToEdit.notes || '');
    } else {
      setContractNumber('');
      setContractor('');
      setDescription('');
      setFiscalYear(activeFiscalYear);
      setBudgetLine(COMMON_BUDGET_LINES[0]);
      setCustomBudgetLine('');
      setTotalAmount('');
      setStartDate('2026-07-01');
      setEndDate('2027-06-30');
      setIsCreditLine(false);
      setDepartment('Departamento de Desarrollo Económico, Turismo y Cultura');
      setNotes('');
    }
  }, [isOpen, contractToEdit, activeFiscalYear]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractNumber.trim()) {
      alert('Por favor ingrese el número de contrato.');
      return;
    }
    if (!contractor.trim()) {
      alert('Por favor ingrese el nombre del contratista o entidad.');
      return;
    }
    const finalBudgetLine = budgetLine === 'custom' ? customBudgetLine.trim() : budgetLine;
    if (!finalBudgetLine) {
      alert('Por favor seleccione o ingrese una partida presupuestaria.');
      return;
    }
    const parsedAmount = parseFloat(totalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese una cuantía presupuestaria válida mayor a $0.');
      return;
    }

    const contractData: Contract = {
      id: contractToEdit ? contractToEdit.id : `contract-${Date.now()}`,
      contractNumber: contractNumber.trim(),
      contractor: contractor.trim(),
      description: description.trim() || 'Servicios contratados',
      fiscalYear,
      budgetLine: finalBudgetLine,
      totalAmount: parsedAmount,
      startDate: startDate || '2026-07-01',
      endDate: endDate || '2027-06-30',
      isCreditLine,
      department,
      notes: notes.trim() || undefined,
      createdAt: contractToEdit ? contractToEdit.createdAt : new Date().toISOString()
    };

    onSave(contractData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {contractToEdit ? 'Editar Contrato' : 'Registrar Nuevo Contrato'}
              </h3>
              <p className="text-xs text-slate-400">
                Municipio Autónomo de Toa Baja — Asignación Presupuestaria
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
          {/* Fila: Número de Contrato y Año Fiscal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número de Contrato *
              </label>
              <input
                type="text"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="ej. 2027-000039 o 2026-000145"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Año Fiscal *
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                required
              >
                {fiscalYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre del Contratista */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre de la Entidad o Contratista *
            </label>
            <input
              type="text"
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              placeholder="ej. Iré Dance Company, Inc. o Environmental Quality Lab"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              required
            />
          </div>

          {/* Objeto / Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción / Objeto del Contrato
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ej. Programa Salsa Llanera y Talleres Comunitarios"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Fila: Cuantía y Partida Presupuestaria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cuantía Total Asignada ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Partida Presupuestaria *
              </label>
              <select
                value={budgetLine}
                onChange={(e) => setBudgetLine(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono text-xs"
              >
                {COMMON_BUDGET_LINES.map(line => (
                  <option key={line} value={line}>{line}</option>
                ))}
                <option value="custom">+ Otra partida (ingresar personalizada)</option>
              </select>

              {budgetLine === 'custom' && (
                <input
                  type="text"
                  value={customBudgetLine}
                  onChange={(e) => setCustomBudgetLine(e.target.value)}
                  placeholder="ej. 01-15-20-00-00-94.00"
                  className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                  required
                />
              )}
            </div>
          </div>

          {/* Fechas de Vigencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Inicio de Vigencia
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Terminación
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Opciones especiales: Línea de crédito */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Modalidad de Línea de Crédito
              </span>
              <span className="text-[11px] text-slate-500">
                Marcar si este contrato opera como línea de crédito abierta (ej. transportación)
              </span>
            </div>
            <input
              type="checkbox"
              checked={isCreditLine}
              onChange={(e) => setIsCreditLine(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
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
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md"
            >
              {contractToEdit ? 'Guardar Cambios' : 'Crear Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
