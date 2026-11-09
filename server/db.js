import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'aura_erp_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure & Realistic OHADA Seeds
const INITIAL_DATABASE = {
  settings: {
    name: 'AURA COMMERCE SARL',
    sigle: 'AURA-POS',
    tagline: 'Vente Matériaux, Alimentation Générale & Logistique',
    ifu: '00124856019M',
    rccm: 'BF-OUA-2021-B-8910',
    regime: 'Réel Normal d\'Imposition (RNI)',
    divisionFiscale: 'DGI Ouaga I (Kadiogo)',
    address: 'Zone Industrielle Gounghin, Secteur 15, Ouagadougou, Burkina Faso',
    phone: '+226 25 30 45 89 / +226 70 00 00 00',
    email: 'contact@auracommerce.bf',
    ribBank: 'Coris Bank International Burkina Faso',
    ribAccount: 'BF061 01001 048590123001 45',
    currency: 'F CFA',
    vatRate: 18,
    bicRate: 1,
    defaultDocTemplate: 'corporate'
  },
  categories: [
    { id: 'btp', name: 'Quincaillerie & Matériaux', icon: 'tool' },
    { id: 'food', name: 'Alimentation & Épicerie', icon: 'dish' },
    { id: 'beverage', name: 'Boissons & Fraîcheur', icon: 'bottle' },
    { id: 'tech', name: 'Électronique & Équipements', icon: 'phone' },
    { id: 'services', name: 'Prestations & Services', icon: 'switch' }
  ],
  products: [],
  customers: [],
  suppliers: [],
  employees: [],
  sales: [],
  shifts: [],
  expenses: [],
  credits: [],
  deliveries: [],
  salaryAdvances: [],
  documents: [],
  auditLogs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      action: 'INITIALISATION_PRODUCTION',
      user: 'Système',
      module: 'Backend',
      details: 'Base de données AURA ERP & POS initialisée en mode production vierge.'
    }
  ],
  users: [
    { id: 'usr-admin', username: 'admin', name: 'Administrateur', role: 'admin', store: 'Siège Principal', active: true }
  ]
};

// In-Memory state loaded from file
let memoryDb = null;
let lastMtime = 0;

export function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const stats = fs.statSync(DB_FILE);
      if (memoryDb && stats.mtimeMs <= lastMtime) {
        return memoryDb;
      }
      const data = fs.readFileSync(DB_FILE, 'utf8');
      memoryDb = JSON.parse(data);
      lastMtime = stats.mtimeMs;
      return memoryDb;
    } catch (e) {
      console.error('Failed reading DB file, fallback:', e.message);
      if (memoryDb) return memoryDb;
    }
  }

  // First time initialization
  memoryDb = JSON.parse(JSON.stringify(INITIAL_DATABASE));
  saveDatabase(memoryDb);
  console.log('Initialized fresh database file with complete OHADA seeds.');
  return memoryDb;
}

export function saveDatabase(data = memoryDb) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    if (fs.existsSync(DB_FILE)) {
      lastMtime = fs.statSync(DB_FILE).mtimeMs;
    }
  } catch (e) {
    console.error('Error saving database:', e.message);
  }
}

// Helper methods for tables
export const db = {
  get: (table) => {
    const database = loadDatabase();
    return database[table] || [];
  },
  find: (table, predicate) => {
    const items = db.get(table);
    return items.find(predicate);
  },
  filter: (table, predicate) => {
    const items = db.get(table);
    return items.filter(predicate);
  },
  insert: (table, item) => {
    const database = loadDatabase();
    if (!database[table]) database[table] = [];
    if (!item.id) item.id = Date.now() + Math.floor(Math.random() * 1000);
    database[table].push(item);
    saveDatabase(database);
    return item;
  },
  update: (table, id, updates) => {
    const database = loadDatabase();
    const items = database[table] || [];
    const idx = items.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      saveDatabase(database);
      return items[idx];
    }
    return null;
  },
  delete: (table, id) => {
    const database = loadDatabase();
    const items = database[table] || [];
    const idx = items.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      const deleted = items.splice(idx, 1)[0];
      saveDatabase(database);
      return deleted;
    }
    return null;
  },
  getSettings: () => {
    const database = loadDatabase();
    return database.settings;
  },
  updateSettings: (updates) => {
    const database = loadDatabase();
    database.settings = { ...database.settings, ...updates };
    saveDatabase(database);
    return database.settings;
  },
  logAudit: (action, user, module, details) => {
    return db.insert('auditLogs', {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      user: user || 'Système',
      module: module || 'Général',
      details
    });
  }
};
