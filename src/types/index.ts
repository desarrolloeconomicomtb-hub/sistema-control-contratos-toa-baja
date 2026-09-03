export type FiscalYear = string; // e.g. "2026-2027", "2027-2028"

export type InvoiceStatus = 'Pendiente' | 'Aprobada' | 'Pagada' | 'Rechazada';

export interface Contract {
  id: string;
  contractNumber: string;         // e.g. "2027-000039"
  contractor: string;             // e.g. "Iré Dance Company, Inc."
  description: string;            // e.g. "Programa Salsa Llanera"
  fiscalYear: FiscalYear;         // e.g. "2026-2027"
  budgetLine: string;             // e.g. "01-61-04-00-00-94.84"
  totalAmount: number;            // Cuantía total asignada ($)
  startDate: string;              // YYYY-MM-DD
  endDate: string;                // YYYY-MM-DD
  isCreditLine?: boolean;         // Indicador si es línea de crédito (e.g. Transporte)
  notes?: string;
  department?: string;            // "Departamento de Desarrollo Económico, Turismo y Cultura"
  createdAt: string;
}

export interface Invoice {
  id: string;
  contractId: string;             // ID del contrato asociado
  invoiceNumber: string;          // e.g. "FACT-2026-001"
  contractorName?: string;        // Nombre del contratista (cacheado)
  concept: string;                // Concepto / detalle del servicio o bien
  amount: number;                 // Monto facturado ($)
  invoiceDate: string;            // Fecha de emisión de la factura
  periodCovered?: string;         // Periodo facturado (ej. "Julio 2026")
  status: InvoiceStatus;          // Estado actual
  
  // Requisito especial: Fecha en que se envía a la Oficina de Finanzas
  sentToFinance: boolean;         // Si ya fue enviada o no
  financeSentDate?: string;       // YYYY-MM-DD en que se envió a Finanzas
  
  paymentReference?: string;      // Comprobante de pago o cheque (opcional)
  notes?: string;
  createdAt: string;
}

export interface BudgetSummary {
  fiscalYear: FiscalYear;
  totalAllocated: number;         // Presupuesto total contratado
  totalSpent: number;             // Total facturado (aprobadas + pagadas)
  totalPaid: number;              // Total efectivamente pagado
  totalPending: number;           // Total pendiente de pago
  remainingBalance: number;       // Balance restante disponible
  percentUsed: number;            // Porcentaje ejecutado (0-100%)
  contractsCount: number;
  invoicesCount: number;
}

export interface BudgetLineBreakdown {
  budgetLine: string;
  name?: string;
  totalAllocated: number;
  totalSpent: number;
  remainingBalance: number;
  contracts: Contract[];
}
