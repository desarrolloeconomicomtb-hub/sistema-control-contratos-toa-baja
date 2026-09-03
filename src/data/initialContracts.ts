import { Contract, Invoice } from '../types';

export const INITIAL_FISCAL_YEAR = '2026-2027';

export const AVAILABLE_FISCAL_YEARS = [
  '2026-2027',
  '2027-2028',
  '2025-2026'
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'contract-1',
    contractNumber: '2026-000112',
    contractor: 'Environmental Quality Lab',
    description: 'Servicios de Monitoreo Ambiental y Calidad de Aguas',
    fiscalYear: '2026-2027',
    budgetLine: '01-19-27-27-00-00-94.11',
    totalAmount: 35000.00,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCreditLine: false,
    department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
    notes: 'Monitoreo periódico según requerimientos regulatorios.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'contract-2',
    contractNumber: '2026-000145',
    contractor: 'Fast Pass Promotion',
    description: 'Servicios de Publicidad, Medios y Promoción Turística/Cultural',
    fiscalYear: '2026-2027',
    budgetLine: '01-19-27-27-00-00-94.11',
    totalAmount: 50000.00,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCreditLine: false,
    department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
    notes: 'Campañas de difusión turística y eventos del Municipio.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'contract-3',
    contractNumber: '2026-000189',
    contractor: 'Transporte Sonell / Transportes Sánchez',
    description: 'Línea de Crédito para Transportación Colectiva y Logística Municipal',
    fiscalYear: '2026-2027',
    budgetLine: '01-19-27-27-00-00-94.11',
    totalAmount: 65000.00,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCreditLine: true,
    department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
    notes: 'Línea de crédito para viajes y traslados de actividades culturales.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'contract-4',
    contractNumber: '2027-000039',
    contractor: 'Iré Dance Company, Inc.',
    description: 'Programa Salsa Llanera y Talleres de Danza Tradicional',
    fiscalYear: '2026-2027',
    budgetLine: '01-61-04-00-00-94.84',
    totalAmount: 45000.00,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCreditLine: false,
    department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
    notes: 'Impartición de clases comunitarias y eventos culturales.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'contract-5',
    contractNumber: '2026-000204',
    contractor: 'American Lifeguard Association (A.L.A. PR)',
    description: 'Capacitación, Certificación y Seguridad Acuática en Zonas Turísticas',
    fiscalYear: '2026-2027',
    budgetLine: '02-04-04-00-00-94.51',
    totalAmount: 120214.00,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCreditLine: false,
    department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
    notes: 'Certificaciones y protocolos de salvavidas para balnearios y costas.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'contract-6',
    contractNumber: '2026-000215',
    contractor: 'Orquesta Filarmónica de Bayamón',
    description: 'Conciertos Sinfónicos Comunitarios y Festivales de Temporada',
    fiscalYear: '2026-2027',
    budgetLine: '01-61-04-00-00-94.84',
    totalAmount: 185000.00,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCreditLine: false,
    department: 'Departamento de Desarrollo Económico, Turismo y Cultura',
    notes: 'Temporada de presentaciones sinfónicas al aire libre y teatros.',
    createdAt: '2026-07-01T08:00:00.000Z'
  }
];

// Al momento no ha habido gastos: lista de facturas inicial vacía
export const INITIAL_INVOICES: Invoice[] = [];
