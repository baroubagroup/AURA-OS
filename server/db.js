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
    { id: 'btp', name: 'Quincaillerie & BTP', icon: 'tool' },
    { id: 'food', name: 'Restauration & Maquis', icon: 'dish' },
    { id: 'grocery', name: 'Alimentation Générale', icon: 'bread' },
    { id: 'beverage', name: 'Boissons & Brasserie', icon: 'bottle' },
    { id: 'tech', name: 'Téléphonie & High-Tech', icon: 'phone' },
    { id: 'fashion', name: 'Mode & Tissus', icon: 'shirt' },
    { id: 'auto', name: 'Pièces Moto & Véhicules', icon: 'moto' },
    { id: 'health', name: 'Santé & Cosmétiques', icon: 'pill' },
    { id: 'services', name: 'Prestations & Services', icon: 'switch' }
  ],
  products: [
    // Quincaillerie & Électricité
    { id: 1, ref: 'QUIN-001', name: 'Ampoule LED 15W Haute Économie', cat: 'Quincaillerie & BTP', svgKey: 'lightbulb', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', priceBuy: 900, priceSell: 1500, stockShelf: 40, stockReserve: 150, alertThreshold: 10, barcode: '600100100010' },
    { id: 2, ref: 'QUIN-002', name: 'Câble Électrique 1.5mm² (Rouleau 100m)', cat: 'Quincaillerie & BTP', svgKey: 'wire', badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20', priceBuy: 14000, priceSell: 18500, stockShelf: 12, stockReserve: 50, alertThreshold: 5, barcode: '600100100011' },
    { id: 3, ref: 'QUIN-003', name: 'Ciment Portland CPJ 42.5 (Sac 50kg)', cat: 'Quincaillerie & BTP', svgKey: 'cement', badgeColor: 'bg-amber-600/10 text-amber-600 border-amber-600/20', priceBuy: 5200, priceSell: 6500, stockShelf: 45, stockReserve: 350, alertThreshold: 15, barcode: '600100100001' },
    { id: 4, ref: 'QUIN-004', name: 'Fer à Béton FeE500 Ø 10mm (Barre 12m)', cat: 'Quincaillerie & BTP', svgKey: 'iron', badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20', priceBuy: 3400, priceSell: 4200, stockShelf: 30, stockReserve: 200, alertThreshold: 15, barcode: '600100100002' },
    { id: 5, ref: 'QUIN-005', name: 'Peinture Blanche Mate 15L (Seau)', cat: 'Quincaillerie & BTP', svgKey: 'paint', badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20', priceBuy: 18000, priceSell: 24500, stockShelf: 8, stockReserve: 40, alertThreshold: 5, barcode: '600100100003' },
    { id: 6, ref: 'QUIN-006', name: 'Cadenas Blindé Haute Sécurité 60mm', cat: 'Quincaillerie & BTP', svgKey: 'lock', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', priceBuy: 3000, priceSell: 4500, stockShelf: 15, stockReserve: 60, alertThreshold: 5, barcode: '600100100012' },

    // Boissons & Brasserie
    { id: 7, ref: 'BOIS-001', name: 'Brakina Canette 33cl (Pack de 24)', cat: 'Boissons & Brasserie', svgKey: 'can', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', priceBuy: 11000, priceSell: 14400, stockShelf: 14, stockReserve: 80, alertThreshold: 6, barcode: '600100200001' },
    { id: 8, ref: 'BOIS-002', name: 'Bière Brakina Bouteille 65cl (Casier 12)', cat: 'Boissons & Brasserie', svgKey: 'bottle', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', priceBuy: 6500, priceSell: 7800, stockShelf: 20, stockReserve: 60, alertThreshold: 8, barcode: '600100200004' },
    { id: 9, ref: 'BOIS-003', name: 'Eau Minérale Naturelle 1.5L (Pack x6)', cat: 'Boissons & Brasserie', svgKey: 'bottle', badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', priceBuy: 2200, priceSell: 3000, stockShelf: 22, stockReserve: 120, alertThreshold: 10, barcode: '600100200002' },
    { id: 10, ref: 'BOIS-004', name: 'Canette Énergisante XXL Energy 33cl', cat: 'Boissons & Brasserie', svgKey: 'can', badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20', priceBuy: 500, priceSell: 700, stockShelf: 35, stockReserve: 150, alertThreshold: 15, barcode: '600100200005' },

    // Alimentation & Épicerie
    { id: 11, ref: 'ALIM-001', name: 'Baguette de Pain Frais (250g)', cat: 'Alimentation Générale', svgKey: 'bread', badgeColor: 'bg-amber-600/10 text-amber-600 border-amber-600/20', priceBuy: 125, priceSell: 150, stockShelf: 50, stockReserve: 200, alertThreshold: 20, barcode: '600100300001' },
    { id: 12, ref: 'ALIM-002', name: 'Sac de Riz Parfumé (50kg)', cat: 'Alimentation Générale', svgKey: 'sack', badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', priceBuy: 21500, priceSell: 24500, stockShelf: 18, stockReserve: 90, alertThreshold: 5, barcode: '600100300002' },
    { id: 13, ref: 'ALIM-003', name: 'Bidon d\'Huile Végétale 5L', cat: 'Alimentation Générale', svgKey: 'jug', badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', priceBuy: 5400, priceSell: 6250, stockShelf: 15, stockReserve: 60, alertThreshold: 5, barcode: '600100300003' },
    { id: 14, ref: 'ALIM-004', name: 'Paquet de Sucre Morceaux SOSUCO (1kg)', cat: 'Alimentation Générale', svgKey: 'sack', badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20', priceBuy: 750, priceSell: 900, stockShelf: 30, stockReserve: 100, alertThreshold: 10, barcode: '600100300004' },

    // Restauration & Maquis
    { id: 15, ref: 'REST-001', name: 'Plat de Poulet Bicyclette Braisé (Entier)', cat: 'Restauration & Maquis', svgKey: 'chicken', badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/20', priceBuy: 3200, priceSell: 4500, stockShelf: 15, stockReserve: 40, alertThreshold: 5, barcode: '600100400001' },
    { id: 16, ref: 'REST-002', name: 'Poisson Braisé Carpe / Capitaine (Portion)', cat: 'Restauration & Maquis', svgKey: 'fish', badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', priceBuy: 2400, priceSell: 3500, stockShelf: 12, stockReserve: 30, alertThreshold: 4, barcode: '600100400002' },
    { id: 17, ref: 'REST-003', name: 'Plat de Riz au Gras / Tchêp Poulet', cat: 'Restauration & Maquis', svgKey: 'dish', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', priceBuy: 900, priceSell: 1500, stockShelf: 25, stockReserve: 50, alertThreshold: 8, barcode: '600100400003' },

    // Prestations de Services
    { id: 18, ref: 'SRV-TR01', name: 'Transport & Déchargement Chantier (Camion 10T)', type: 'service', cat: 'Prestations & Services', unit: 'Forfait', svgKey: 'truck', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', priceBuy: 0, priceSell: 35000, stockShelf: 999999, stockReserve: 0, alertThreshold: 0, barcode: '600901001' },
    { id: 19, ref: 'SRV-MC02', name: 'Main-d\'œuvre Pose & Maçonnerie (Équipe / Jour)', type: 'service', cat: 'Prestations & Services', unit: 'Journée', svgKey: 'tool', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', priceBuy: 0, priceSell: 25000, stockShelf: 999999, stockReserve: 0, alertThreshold: 0, barcode: '600902002' },
    { id: 20, ref: 'SRV-ET03', name: 'Étude Technique, Métré & Devis Gros-Œuvre', type: 'service', cat: 'Prestations & Services', unit: 'Forfait', svgKey: 'tool', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', priceBuy: 0, priceSell: 50000, stockShelf: 999999, stockReserve: 0, alertThreshold: 0, barcode: '600903003' }
  ],
  customers: [
    { id: '1', name: 'ENTREPRISE SOGEB SARL', cat: 'B2B', phone: '+226 70 20 45 89', email: 'direction@sogeb-bf.com', ifu: '00045812934K', rccm: 'BF-OUA-2021-B-8910', city: 'Ouagadougou', address: 'Zone Industrielle Gounghin', balanceDue: 450000 },
    { id: '2', name: 'MAQUIS LE BAMBOU D\'OR', cat: 'B2B', phone: '+226 78 12 34 56', email: 'contact@bamboudor.bf', ifu: '00109283457M', rccm: 'BF-OUA-2022-A-1209', city: 'Ouagadougou', address: 'Boulevard Charles de Gaulle', balanceDue: 0 },
    { id: '3', name: 'OUÉDRAOGO Souleymane (Particulier)', cat: 'B2C', phone: '+226 76 99 88 77', city: 'Bobo-Dioulasso', address: 'Secteur 25', balanceDue: 65000 }
  ],
  suppliers: [
    { id: '1', name: 'CIMENTS DU FASO (CIMFACO)', contact: 'M. Ouédraogo', phone: '+226 25 30 00 00', email: 'ventes@cimfaco.bf', address: 'Zone Industrielle Kossodo, Ouagadougou', balanceDue: 1250000 },
    { id: '2', name: 'BRAKINA / SODIBO', contact: 'Service Commercial', phone: '+226 25 37 40 00', email: 'commandes@brakina.bf', address: 'Route de Kamboinsé, Ouagadougou', balanceDue: 350000 }
  ],
  employees: [
    { id: '1', name: 'Ousmane Zoungrana', role: 'Responsable Magasin & Approvisionnements', contract: 'CDI', phone: '+226 70 45 12 90', cnss: '489201-BF', salaryBase: 185000, hired: '2023-03-15', status: 'Actif', attendance: 'Présent', arrivalTime: '07:45', advances: 25000 },
    { id: '2', name: 'Aminata Sanogo', role: 'Caissière Principale & Accueil', contract: 'CDI', phone: '+226 78 60 11 22', cnss: '512094-BF', salaryBase: 135000, hired: '2023-09-01', status: 'Actif', attendance: 'Présent', arrivalTime: '07:50', advances: 0 },
    { id: '3', name: 'Moussa Traoré', role: 'Chauffeur Livreur & Manutentionnaire', contract: 'CDD', phone: '+226 76 33 44 55', cnss: '534890-BF', salaryBase: 110000, hired: '2024-02-10', status: 'Actif', attendance: 'Retard', arrivalTime: '08:40', advances: 15000 }
  ],
  sales: [],
  shifts: [
    {
      id: 1,
      cashierName: 'Aminata Sanogo',
      startedAt: new Date().toISOString(),
      initialAmount: 50000,
      expectedAmount: 50000,
      status: 'open'
    }
  ],
  expenses: [
    {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      category: '62 - Services extérieurs & Loyers',
      desc: 'Facture électricité SONABEL Caisse & Rayons',
      beneficiary: 'SONABEL',
      amount: 25000,
      paymentMode: 'Espèces',
      cashierName: 'Aminata Sanogo'
    }
  ],
  credits: [
    {
      id: 1,
      customerId: '1',
      customerName: 'ENTREPRISE SOGEB SARL',
      phone: '+226 70 20 45 89',
      totalAmount: 450000,
      paidAmount: 0,
      remainingAmount: 450000,
      dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'pending'
    }
  ],
  deliveries: [
    {
      id: 1,
      ref: 'BL-2026-0894',
      customerName: 'ENTREPRISE SOGEB SARL',
      customerPhone: '+226 70 20 45 89',
      address: 'Chantier Cité Ouaga 2000, Lot 14',
      driver: 'Moussa Traoré (Permis C-894)',
      vehicle: 'Camion Isuzu 10T (11-JJ-4859-BF)',
      departureTime: '08:30 GMT',
      packagesCount: '54 Colis & Palettes',
      weight: '3 850 kg',
      fee: 35000,
      status: 'delivering'
    }
  ],
  salaryAdvances: [
    {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      empId: '1',
      employeeName: 'Ousmane Zoungrana',
      amount: 25000,
      reason: 'Acompte quinzaine',
      status: 'Validé & Décaissé'
    }
  ],
  documents: [
    {
      id: 1,
      type: 'invoice',
      ref: 'FACT-2026-0894',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      template: 'corporate',
      client: {
        name: 'ENTREPRISE SOGEB SARL',
        attn: 'M. Ousmane Sawadogo (Directeur Technique)',
        ifu: '00045812934K',
        rccm: 'BF-OUA-2021-B-8910',
        address: 'Zone Industrielle Gounghin, Ouagadougou',
        phone: '+226 70 20 45 89'
      },
      supplier: {
        name: 'CIMENTS DU FASO (CIMFACO)',
        contact: 'M. Ouédraogo',
        phone: '+226 25 30 00 00',
        address: 'Zone Industrielle Kossodo, Ouagadougou'
      },
      deliveryInfo: {
        driver: 'Moussa Traoré (Permis C-894)',
        vehicle: 'Camion Isuzu 10T - Immat: 11-JJ-4859-BF',
        departureTime: '08:30 GMT',
        destination: 'Chantier Cité Ouaga 2000, Lot 14',
        packagesCount: '54 Colis & Palettes',
        weight: '3 850 kg'
      },
      items: [
        { desc: 'Ciment Portland CPJ 42.5 (Sac 50kg Haute Résistance)', unit: 'Sac', qty: 50, pu: 6500, remise: 0, total: 325000, qtyOrdered: 50, qtyDelivered: 50, qtyRemaining: 0 },
        { desc: 'Fer à Béton Haute Adhérence FeE500 Ø 10mm (Barre 12m)', unit: 'Barre', qty: 30, pu: 4200, remise: 0, total: 126000, qtyOrdered: 30, qtyDelivered: 30, qtyRemaining: 0 },
        { desc: 'Peinture Blanche Mate Intérieure/Extérieure (Seau 15L)', unit: 'Seau', qty: 4, pu: 24500, remise: 5000, total: 93000, qtyOrdered: 4, qtyDelivered: 4, qtyRemaining: 0 }
      ],
      applyStamp: true,
      paymentTerms: 'Virement Bancaire (Coris / Ecobank)',
      notes: 'Marchandises vendues sous réserve de propriété (Loi 2017-024) jusqu\'au paiement intégral.'
    }
  ],
  auditLogs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      action: 'INITIALISATION_SYSTÈME',
      user: 'Système',
      module: 'Backend',
      details: 'Base de données AURA ERP & POS initialisée avec succès.'
    }
  ],
  users: [
    { id: 'usr-1', username: 'admin', name: 'Abdoul Kaboré', role: 'admin', store: 'Siège Ouagadougou', active: true },
    { id: 'usr-2', username: 'manager', name: 'Ousmane Zoungrana', role: 'manager', store: 'Dépôt Central Gounghin', active: true },
    { id: 'usr-3', username: 'staff', name: 'Moussa Traoré', role: 'staff', store: 'Magasin Rayon', active: true },
    { id: 'usr-4', username: 'caisse1', name: 'Aminata Sanogo', role: 'cashier', store: 'Caisse Principale', active: true }
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
