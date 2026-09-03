import React, { useState, useEffect, useCallback } from 'react';
import { Contract, Invoice, FiscalYear, InvoiceStatus } from './types';
import { DataService } from './services/api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ContractDirectory } from './components/ContractDirectory';
import { ContractDossier } from './components/ContractDossier';
import { InvoiceRegistry } from './components/InvoiceRegistry';
import { OfficialReports } from './components/OfficialReports';
import { InvoiceModal } from './components/InvoiceModal';
import { ContractModal } from './components/ContractModal';
import { BackupModal } from './components/BackupModal';

export function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(['2026-2027']);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<FiscalYear>('2026-2027');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Navegación
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'dossier' | 'invoices' | 'reports'>('dashboard');
  const [selectedContractIdForDossier, setSelectedContractIdForDossier] = useState<string | null>(null);

  // Modales
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [initialContractIdForInvoice, setInitialContractIdForInvoice] = useState<string | null>(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Cargar estado inicial y sincronizar
  const loadState = useCallback(async () => {
    try {
      const state = await DataService.getFullState();
      setContracts(state.contracts);
      setInvoices(state.invoices);
      setFiscalYears(state.fiscalYears);
      setIsLive(state.isLive);
      if (!state.fiscalYears.includes(selectedFiscalYear) && state.fiscalYears.length > 0) {
        setSelectedFiscalYear(state.fiscalYears[0]);
      }
    } catch (err) {
      console.error('Error loading state:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFiscalYear]);

  useEffect(() => {
    loadState();

    // Sondeo de sincronización en tiempo real (cada 4 segundos)
    const interval = setInterval(() => {
      loadState();
    }, 4000);

    return () => clearInterval(interval);
  }, [loadState]);

  // --- ACCIONES DE CONTRATOS ---
  const handleSaveContract = async (contractData: Contract) => {
    const saved = await DataService.saveContract(contractData);
    setContracts(prev => {
      const index = prev.findIndex(c => c.id === saved.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [...prev, saved];
    });
    if (saved.fiscalYear && !fiscalYears.includes(saved.fiscalYear)) {
      setFiscalYears(prev => [...prev, saved.fiscalYear]);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    await DataService.deleteContract(contractId);
    setContracts(prev => prev.filter(c => c.id !== contractId));
    setInvoices(prev => prev.filter(i => i.contractId !== contractId));
  };

  // --- ACCIONES DE FACTURAS ---
  const handleSaveInvoice = async (invoiceData: Invoice) => {
    const saved = await DataService.saveInvoice(invoiceData);
    setInvoices(prev => {
      const index = prev.findIndex(i => i.id === saved.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    await DataService.deleteInvoice(invoiceId);
    setInvoices(prev => prev.filter(i => i.id !== invoiceId));
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: InvoiceStatus) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      const updated = { ...invoice, status };
      await handleSaveInvoice(updated);
    }
  };

  // --- GESTIÓN DE AÑOS FISCALES ---
  const handleAddNewFiscalYear = async (newYear: string) => {
    const updated = await DataService.addFiscalYear(newYear);
    setFiscalYears(updated);
    setSelectedFiscalYear(newYear);
  };

  // --- NAVEGACIÓN Y APERTURA DE MODALES ---
  const handleSelectContractForDossier = (contractId: string) => {
    setSelectedContractIdForDossier(contractId);
    setActiveTab('dossier');
  };

  const handleOpenNewInvoiceForContract = (contractId: string) => {
    setInitialContractIdForInvoice(contractId);
    setInvoiceToEdit(null);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenGeneralNewInvoice = () => {
    setInitialContractIdForInvoice(null);
    setInvoiceToEdit(null);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenNewContract = () => {
    setContractToEdit(null);
    setIsContractModalOpen(true);
  };

  const handleOpenEditContract = (contract: Contract) => {
    setContractToEdit(contract);
    setIsContractModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">Cargando Sistema de Control de Contratos...</h2>
        <p className="text-sm text-slate-400 mt-1">Municipio Autónomo de Toa Baja</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Barra de Navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fiscalYears={fiscalYears}
        selectedFiscalYear={selectedFiscalYear}
        onSelectFiscalYear={setSelectedFiscalYear}
        onAddNewFiscalYear={handleAddNewFiscalYear}
        onOpenNewContract={handleOpenNewContract}
        onOpenNewInvoice={handleOpenGeneralNewInvoice}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        isLive={isLive}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            fiscalYear={selectedFiscalYear}
            contracts={contracts}
            invoices={invoices}
            onSelectContractForDossier={handleSelectContractForDossier}
            onOpenNewInvoiceForContract={handleOpenNewInvoiceForContract}
            onOpenNewContract={handleOpenNewContract}
            onOpenNewInvoice={handleOpenGeneralNewInvoice}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractDirectory
            contracts={contracts}
            invoices={invoices}
            fiscalYear={selectedFiscalYear}
            onSelectContractForDossier={handleSelectContractForDossier}
            onOpenEditContract={handleOpenEditContract}
            onOpenNewContract={handleOpenNewContract}
            onDeleteContract={handleDeleteContract}
          />
        )}

        {activeTab === 'dossier' && (
          <ContractDossier
            contracts={contracts}
            invoices={invoices}
            selectedContractId={selectedContractIdForDossier}
            onSelectContract={setSelectedContractIdForDossier}
            fiscalYear={selectedFiscalYear}
            onOpenNewInvoiceForContract={handleOpenNewInvoiceForContract}
            onOpenEditInvoice={handleOpenEditInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onBackToDirectory={() => setActiveTab('contracts')}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceRegistry
            invoices={invoices}
            contracts={contracts}
            fiscalYear={selectedFiscalYear}
            onOpenNewInvoice={handleOpenGeneralNewInvoice}
            onOpenEditInvoice={handleOpenEditInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          />
        )}

        {activeTab === 'reports' && (
          <OfficialReports
            contracts={contracts}
            invoices={invoices}
            fiscalYear={selectedFiscalYear}
          />
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Municipio Autónomo de Toa Baja</strong> — Departamento de Desarrollo Económico, Turismo y Cultura
          </div>
          <div>
            Preparado para: <span className="text-amber-400 font-semibold">Administradora de Sistemas de Oficina</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        contracts={contracts}
        invoices={invoices}
        fiscalYear={selectedFiscalYear}
        initialContractId={initialContractIdForInvoice}
        invoiceToEdit={invoiceToEdit}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSave={handleSaveContract}
        fiscalYears={fiscalYears}
        activeFiscalYear={selectedFiscalYear}
        contractToEdit={contractToEdit}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={loadState}
        isLive={isLive}
      />
    </div>
  );
}

export default App;
