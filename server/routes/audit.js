import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/audit - list audit logs
router.get('/', (req, res) => {
  try {
    let logs = db.get('auditLogs');
    const { module, user, search, limit = 100 } = req.query;

    if (module && module !== 'all') {
      logs = logs.filter(l => l.module && l.module.toLowerCase() === module.toLowerCase());
    }
    if (user) {
      logs = logs.filter(l => l.user && l.user.toLowerCase().includes(user.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l => 
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.details && l.details.toLowerCase().includes(q)) ||
        (l.user && l.user.toLowerCase().includes(q))
      );
    }

    const sorted = [...logs].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    res.json({
      success: true,
      total: sorted.length,
      data: sorted.slice(0, Number(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/audit - add audit entry
router.post('/', (req, res) => {
  try {
    const { action, user = 'Opérateur', module = 'Général', details = '' } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, error: 'L\'action est requise' });
    }

    const entry = db.logAudit(action, user, module, details);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
