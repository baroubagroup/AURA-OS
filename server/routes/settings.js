import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Standard RBAC Permissions Matrix for West African Retail & Enterprise
const RBAC_MATRIX = {
  admin: {
    label: 'Directeur Général / Administrateur',
    canSell: true,
    canDiscount: true,
    canCancelSale: true,
    canViewProfits: true,
    canManageStocks: true,
    canManageHR: true,
    canManageSuppliers: true,
    canManageSettings: true,
    canExportAudit: true
  },
  manager: {
    label: 'Gérant de Magasin / Chef de Dépôt',
    canSell: true,
    canDiscount: true, // Up to 10%
    canCancelSale: true,
    canViewProfits: false,
    canManageStocks: true,
    canManageHR: true,
    canManageSuppliers: true,
    canManageSettings: false,
    canExportAudit: false
  },
  staff: {
    label: 'Magasinier / Gestionnaire Rayon',
    canSell: false,
    canDiscount: false,
    canCancelSale: false,
    canViewProfits: false,
    canManageStocks: true,
    canManageHR: false,
    canManageSuppliers: false,
    canManageSettings: false,
    canExportAudit: false
  },
  cashier: {
    label: 'Caissier(ère) / Vendeur Comptoir',
    canSell: true,
    canDiscount: false,
    canCancelSale: false,
    canViewProfits: false,
    canManageStocks: false,
    canManageHR: false,
    canManageSuppliers: false,
    canManageSettings: false,
    canExportAudit: false
  }
};

// GET /api/settings - get company settings
router.get('/', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/settings - update company settings
router.put('/', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    db.logAudit('PARAMÈTRES_ENTREPRISE', req.body.operator || 'Admin', 'Paramètres', 'Mise à jour des identifiants fiscaux, banque et coordonnées entreprise');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/stamp - update wet stamp image
router.post('/stamp', (req, res) => {
  try {
    const { stampImage, operator = 'Admin' } = req.body;
    if (!stampImage) {
      return res.status(400).json({ success: false, error: 'Image du cachet requise' });
    }

    const updated = db.updateSettings({ stampImage });
    db.logAudit('PARAMÈTRES_ENTREPRISE', operator, 'Paramètres', 'Mise à jour du cachet officiel / signature');
    res.json({ success: true, data: updated, message: 'Cachet humide enregistré avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/settings/rbac - get RBAC permissions matrix and users
router.get('/rbac', (req, res) => {
  try {
    const users = db.get('users');
    res.json({
      success: true,
      matrix: RBAC_MATRIX,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/purge-demo - Purge all dummy data for production deployment
router.post('/purge-demo', (req, res) => {
  try {
    const collections = ['products', 'customers', 'suppliers', 'employees', 'sales', 'shifts', 'expenses', 'credits', 'deliveries', 'salaryAdvances', 'documents'];
    collections.forEach(col => {
      db.saveCollection(col, []);
    });
    db.logAudit('PURGE_PRODUCTION', req.body.operator || 'Admin', 'Système', 'Purge intégrale des données de démo pour bascule en production.');
    res.json({
      success: true,
      message: 'Toutes les données fictives ont été purgées avec succès. Le système est vierge et prêt pour la production.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
