import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Asegurar que exista el directorio de datos
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Datos iniciales de contratos de Toa Baja (2026-2027)
const defaultData = {
  fiscalYears: ['2026-2027', '2027-2028', '2025-2026'],
  activeFiscalYear: '2026-2027',
  contracts: [
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    }
  ],
  invoices: [],
  lastModified: new Date().toISOString()
};

function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database:', err);
    return defaultData;
  }
}

function writeDatabase(data) {
  try {
    data.lastModified = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

// Inicializar DB si no existe
readDatabase();

// --- RUTAS API ---

// 1. Obtener todo el estado
app.get('/api/state', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    data: db
  });
});

// 2. Contratos
app.get('/api/contracts', (req, res) => {
  const db = readDatabase();
  const { fiscalYear } = req.query;
  let result = db.contracts || [];
  if (fiscalYear) {
    result = result.filter(c => c.fiscalYear === fiscalYear);
  }
  res.json({ success: true, contracts: result });
});

app.post('/api/contracts', (req, res) => {
  const db = readDatabase();
  const newContract = {
    ...req.body,
    id: req.body.id || `contract-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.contracts.push(newContract);
  
  // Agregar año fiscal si es nuevo
  if (newContract.fiscalYear && !db.fiscalYears.includes(newContract.fiscalYear)) {
    db.fiscalYears.push(newContract.fiscalYear);
  }

  writeDatabase(db);
  res.status(201).json({ success: true, contract: newContract });
});

app.put('/api/contracts/:id', (req, res) => {
  const db = readDatabase();
  const index = db.contracts.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Contrato no encontrado' });
  }
  db.contracts[index] = { ...db.contracts[index], ...req.body };
  writeDatabase(db);
  res.json({ success: true, contract: db.contracts[index] });
});

app.delete('/api/contracts/:id', (req, res) => {
  const db = readDatabase();
  db.contracts = db.contracts.filter(c => c.id !== req.params.id);
  // También eliminar facturas asociadas a este contrato
  db.invoices = db.invoices.filter(i => i.contractId !== req.params.id);
  writeDatabase(db);
  res.json({ success: true, message: 'Contrato y facturas eliminados' });
});

// 3. Facturas
app.get('/api/invoices', (req, res) => {
  const db = readDatabase();
  const { contractId, fiscalYear } = req.query;
  let result = db.invoices || [];
  
  if (contractId) {
    result = result.filter(i => i.contractId === contractId);
  } else if (fiscalYear) {
    // Filtrar facturas que pertenecen a contratos de ese año fiscal
    const validContractIds = new Set(
      db.contracts.filter(c => c.fiscalYear === fiscalYear).map(c => c.id)
    );
    result = result.filter(i => validContractIds.has(i.contractId));
  }
  
  res.json({ success: true, invoices: result });
});

app.post('/api/invoices', (req, res) => {
  const db = readDatabase();
  const contract = db.contracts.find(c => c.id === req.body.contractId);
  const newInvoice = {
    ...req.body,
    id: req.body.id || `inv-${Date.now()}`,
    contractorName: contract ? contract.contractor : (req.body.contractorName || ''),
    createdAt: new Date().toISOString()
  };
  db.invoices.push(newInvoice);
  writeDatabase(db);
  res.status(201).json({ success: true, invoice: newInvoice });
});

app.put('/api/invoices/:id', (req, res) => {
  const db = readDatabase();
  const index = db.invoices.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Factura no encontrada' });
  }
  db.invoices[index] = { ...db.invoices[index], ...req.body };
  writeDatabase(db);
  res.json({ success: true, invoice: db.invoices[index] });
});

app.delete('/api/invoices/:id', (req, res) => {
  const db = readDatabase();
  db.invoices = db.invoices.filter(i => i.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true, message: 'Factura eliminada' });
});

// 4. Años Fiscales
app.get('/api/fiscal-years', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, fiscalYears: db.fiscalYears || ['2026-2027'] });
});

app.post('/api/fiscal-years', (req, res) => {
  const { fiscalYear } = req.body;
  if (!fiscalYear) {
    return res.status(400).json({ success: false, message: 'Año fiscal requerido' });
  }
  const db = readDatabase();
  if (!db.fiscalYears.includes(fiscalYear)) {
    db.fiscalYears.push(fiscalYear);
    writeDatabase(db);
  }
  res.json({ success: true, fiscalYears: db.fiscalYears });
});

// 5. Respaldos y Restauración
app.get('/api/backup', (req, res) => {
  const db = readDatabase();
  res.setHeader('Content-Disposition', `attachment; filename=respaldo_contratos_toa_baja_${Date.now()}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/restore', (req, res) => {
  const data = req.body;
  if (!data || !Array.isArray(data.contracts)) {
    return res.status(400).json({ success: false, message: 'Formato de respaldo inválido' });
  }
  writeDatabase(data);
  res.json({ success: true, message: 'Datos restaurados exitosamente' });
});

// 6. Resetear a valores oficiales de fábrica
app.post('/api/reset', (req, res) => {
  writeDatabase(defaultData);
  res.json({ success: true, message: 'Sistema restablecido a los valores oficiales de Toa Baja' });
});

// Servir frontend compilado en producción
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de Contratos de Toa Baja activo en http://localhost:${PORT}`);
});
