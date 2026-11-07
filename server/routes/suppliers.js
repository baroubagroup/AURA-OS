import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/suppliers - list all suppliers
router.get('/', (req, res) => {
  try {
    let suppliers = db.get('suppliers');
    const { search } = req.query;

    if (search) {
      const q = search.toLowerCase();
      suppliers = suppliers.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.contact && s.contact.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }

    res.json({ success: true, total: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/suppliers - create supplier
router.post('/', (req, res) => {
  try {
    const { name, contact = '', phone = '', email = '', address = '', ifu = '', balanceDue = 0 } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Le nom du fournisseur est obligatoire' });
    }

    const newSupplier = {
      id: Date.now().toString(),
      name,
      contact,
      phone,
      email,
      address,
      ifu,
      balanceDue: Number(balanceDue) || 0,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('suppliers', newSupplier);
    db.logAudit('CRÉATION_FOURNISSEUR', req.body.operator || 'Admin', 'Fournisseurs', `Nouveau fournisseur référencé: ${saved.name}`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/suppliers/:id - update supplier
router.put('/:id', (req, res) => {
  try {
    const updated = db.update('suppliers', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Fournisseur non trouvé' });
    }
    db.logAudit('MODIFICATION_FOURNISSEUR', req.body.operator || 'Admin', 'Fournisseurs', `Mise à jour fiche fournisseur: ${updated.name}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/suppliers/:id - delete supplier
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete('suppliers', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Fournisseur non trouvé' });
    }
    db.logAudit('SUPPRESSION_FOURNISSEUR', req.query.operator || 'Admin', 'Fournisseurs', `Suppression fournisseur: ${deleted.name}`);
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
