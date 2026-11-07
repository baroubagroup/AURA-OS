import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/categories - list all categories
router.get('/', (req, res) => {
  try {
    const categories = db.get('categories');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/categories - add a category
router.post('/', (req, res) => {
  try {
    const { id, name, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Le nom de la catégorie est obligatoire' });
    }

    const catId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = db.find('categories', c => c.id === catId || c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'Cette catégorie existe déjà' });
    }

    const newCat = {
      id: catId,
      name,
      icon: icon || 'tag'
    };

    const saved = db.insert('categories', newCat);
    db.logAudit('CRÉATION_CATÉGORIE', req.body.operator || 'Admin', 'Catalogue', `Nouvelle catégorie créée: ${name}`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
