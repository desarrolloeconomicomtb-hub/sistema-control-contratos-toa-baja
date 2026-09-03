import { Contract, Invoice, FiscalYear } from '../types';
import { INITIAL_CONTRACTS, INITIAL_INVOICES, INITIAL_FISCAL_YEAR, AVAILABLE_FISCAL_YEARS } from '../data/initialContracts';

const API_BASE = '/api';
const STORAGE_KEY_CONTRACTS = 'toa_baja_contratos_v1';
const STORAGE_KEY_INVOICES = 'toa_baja_facturas_v1';
const STORAGE_KEY_YEARS = 'toa_baja_anios_fiscales_v1';

export class DataService {
  private static isBackendAvailable: boolean | null = null;

  // Verificar si el servidor backend responde
  public static async checkBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/state`, { signal: controller.signal });
      clearTimeout(timeoutId);
      this.isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  // --- OBTENER ESTADO COMPLETO ---
  public static async getFullState(): Promise<{
    contracts: Contract[];
    invoices: Invoice[];
    fiscalYears: FiscalYear[];
    isLive: boolean;
  }> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE}/state`);
        const data = await res.json();
        if (data.success && data.data) {
          // Mantener copia local de respaldo
          localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(data.data.contracts));
          localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(data.data.invoices));
          localStorage.setItem(STORAGE_KEY_YEARS, JSON.stringify(data.data.fiscalYears));
          return {
            contracts: data.data.contracts,
            invoices: data.data.invoices,
            fiscalYears: data.data.fiscalYears,
            isLive: true
          };
        }
      } catch (err) {
        console.warn('Error fetching live backend, falling back to local cache', err);
      }
    }

    // Fallback local
    const savedContracts = localStorage.getItem(STORAGE_KEY_CONTRACTS);
    const savedInvoices = localStorage.getItem(STORAGE_KEY_INVOICES);
    const savedYears = localStorage.getItem(STORAGE_KEY_YEARS);

    const contracts: Contract[] = savedContracts ? JSON.parse(savedContracts) : INITIAL_CONTRACTS;
    const invoices: Invoice[] = savedInvoices ? JSON.parse(savedInvoices) : INITIAL_INVOICES;
    const fiscalYears: FiscalYear[] = savedYears ? JSON.parse(savedYears) : AVAILABLE_FISCAL_YEARS;

    return { contracts, invoices, fiscalYears, isLive: false };
  }

  // --- CONTRATOS ---
  public static async saveContract(contract: Contract): Promise<Contract> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        const isEdit = !contract.id.startsWith('new-') && contract.id !== '';
        const url = isEdit ? `${API_BASE}/contracts/${contract.id}` : `${API_BASE}/contracts`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contract)
        });
        const data = await res.json();
        if (data.success && data.contract) {
          return data.contract;
        }
      } catch (err) {
        console.warn('Error saving to backend, saving locally', err);
      }
    }

    // Fallback local
    const saved = localStorage.getItem(STORAGE_KEY_CONTRACTS);
    let list: Contract[] = saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
    const index = list.findIndex(c => c.id === contract.id);
    if (index >= 0) {
      list[index] = contract;
    } else {
      const newContract = { ...contract, id: contract.id || `contract-${Date.now()}` };
      list.push(newContract);
      contract = newContract;
    }
    localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(list));
    return contract;
  }

  public static async deleteContract(id: string): Promise<boolean> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE}/contracts/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (err) {
        console.warn('Backend delete failed, falling back locally', err);
      }
    }

    // Fallback local
    const saved = localStorage.getItem(STORAGE_KEY_CONTRACTS);
    if (saved) {
      let list: Contract[] = JSON.parse(saved);
      list = list.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(list));
    }
    return true;
  }

  // --- FACTURAS ---
  public static async saveInvoice(invoice: Invoice): Promise<Invoice> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        const isEdit = !invoice.id.startsWith('new-') && invoice.id !== '';
        const url = isEdit ? `${API_BASE}/invoices/${invoice.id}` : `${API_BASE}/invoices`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice)
        });
        const data = await res.json();
        if (data.success && data.invoice) {
          return data.invoice;
        }
      } catch (err) {
        console.warn('Backend invoice save failed, saving locally', err);
      }
    }

    // Fallback local
    const saved = localStorage.getItem(STORAGE_KEY_INVOICES);
    let list: Invoice[] = saved ? JSON.parse(saved) : INITIAL_INVOICES;
    const index = list.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      const newInvoice = { ...invoice, id: invoice.id || `inv-${Date.now()}` };
      list.push(newInvoice);
      invoice = newInvoice;
    }
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(list));
    return invoice;
  }

  public static async deleteInvoice(id: string): Promise<boolean> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (err) {
        console.warn('Backend invoice delete failed, deleting locally', err);
      }
    }

    // Fallback local
    const saved = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (saved) {
      let list: Invoice[] = JSON.parse(saved);
      list = list.filter(i => i.id !== id);
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(list));
    }
    return true;
  }

  // --- AÑOS FISCALES ---
  public static async addFiscalYear(year: string): Promise<string[]> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE}/fiscal-years`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fiscalYear: year })
        });
        const data = await res.json();
        if (data.success && data.fiscalYears) {
          return data.fiscalYears;
        }
      } catch (err) {
        console.warn('Failed to add fiscal year to backend', err);
      }
    }

    // Fallback local
    const saved = localStorage.getItem(STORAGE_KEY_YEARS);
    let list: string[] = saved ? JSON.parse(saved) : AVAILABLE_FISCAL_YEARS;
    if (!list.includes(year)) {
      list.push(year);
      localStorage.setItem(STORAGE_KEY_YEARS, JSON.stringify(list));
    }
    return list;
  }

  // --- RESTABLECER A ESTADO OFICIAL MUNICIPAL ---
  public static async resetToDefaults(): Promise<void> {
    const isLive = await this.checkBackend();
    if (isLive) {
      try {
        await fetch(`${API_BASE}/reset`, { method: 'POST' });
      } catch (err) {
        console.warn('Backend reset failed', err);
      }
    }
    localStorage.removeItem(STORAGE_KEY_CONTRACTS);
    localStorage.removeItem(STORAGE_KEY_INVOICES);
    localStorage.removeItem(STORAGE_KEY_YEARS);
  }
}
