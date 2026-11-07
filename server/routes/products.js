import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/products - list all products with optional filters
router.get('/', (req, res) => {
  try {
    let products = db.get('products');
    const { search, cat, alert, type } = req.query;

    if (cat && cat !== 'all') {
      products = products.filter(p => p.cat === cat || p.category === cat);
    }

    if (type) {
      products = products.filter(p => p.type === type);
    }

    if (alert === 'true') {
      products = products.filter(p => (p.stockShelf || 0) <= (p.alertThreshold || 5) && p.type !== 'service');
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.ref && p.ref.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q))
      );
    }

    res.json({
      success: true,
      total: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/movements/all - list all recorded stock movements
router.get('/movements/all', (req, res) => {
  try {
    const movements = db.get('stockMovements') || [];
    res.json({
      success: true,
      total: movements.length,
      data: [...movements].reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id - single product
router.get('/:id', (req, res) => {
  try {
    const product = db.find('products', p => String(p.id) === String(req.params.id) || p.ref === req.params.id || p.barcode === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - create a product
router.post('/', (req, res) => {
  try {
    const {
      name,
      cat,
      priceBuy = 0,
      priceSell = 0,
      stockShelf = 0,
      stockReserve = 0,
      alertThreshold = 5,
      barcode,
      ref,
      svgKey = 'package',
      badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      type = 'product',
      unit = 'Pièce',
      image
    } = req.body;

    if (!name || priceSell === undefined) {
      return res.status(400).json({ success: false, error: 'Le nom et le prix de vente sont obligatoires' });
    }

    const autoRef = ref || `PRD-${Date.now().toString().slice(-6)}`;
    const newProduct = {
      id: Date.now(),
      ref: autoRef,
      name,
      cat: cat || 'Alimentation Générale',
      priceBuy: Number(priceBuy) || 0,
      priceSell: Number(priceSell) || 0,
      stockShelf: Number(stockShelf) || 0,
      stockReserve: Number(stockReserve) || 0,
      alertThreshold: Number(alertThreshold) || 5,
      barcode: barcode || `${Date.now()}`,
      svgKey,
      badgeColor,
      type,
      unit,
      image: image || null,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('products', newProduct);
    db.logAudit('CRÉATION_PRODUIT', req.body.operator || 'Admin', 'Stocks', `Création du produit ${saved.name} (Réf: ${saved.ref})`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - update a product
router.put('/:id', (req, res) => {
  try {
    const updated = db.update('products', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }
    db.logAudit('MODIFICATION_PRODUIT', req.body.operator || 'Admin', 'Stocks', `Modification fiche produit ${updated.name}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/products/:id/stock - stock movement / replenishment / loss / inventory
router.patch('/:id/stock', (req, res) => {
  try {
    const product = db.find('products', p => String(p.id) === String(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    const { deltaShelf = 0, deltaReserve = 0, type = 'reassort', note = '', operator = 'Gestionnaire' } = req.body;

    const newShelf = Math.max(0, (product.stockShelf || 0) + Number(deltaShelf));
    const newReserve = Math.max(0, (product.stockReserve || 0) + Number(deltaReserve));

    const updated = db.update('products', product.id, {
      stockShelf: newShelf,
      stockReserve: newReserve,
      lastStockUpdate: new Date().toISOString()
    });

    // Record stock movement log
    db.insert('stockMovements', {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productRef: product.ref,
      type, // 'reassort', 'transfert_rayon', 'perte_casse', 'inventaire'
      deltaShelf,
      deltaReserve,
      newShelf,
      newReserve,
      note,
      operator,
      date: new Date().toISOString()
    });

    db.logAudit('MOUVEMENT_STOCK', operator, 'Stocks', `${type.toUpperCase()} sur ${product.name} (Rayon: ${product.stockShelf} -> ${newShelf}, Réserve: ${product.stockReserve} -> ${newReserve})`);

    res.json({ success: true, data: updated, movement: { type, deltaShelf, deltaReserve, newShelf, newReserve } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - delete product
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete('products', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }
    db.logAudit('SUPPRESSION_PRODUIT', req.query.operator || 'Admin', 'Stocks', `Suppression du produit ${deleted.name} (${deleted.ref})`);
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
