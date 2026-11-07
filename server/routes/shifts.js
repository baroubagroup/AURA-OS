import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/shifts - list all shifts
router.get('/', (req, res) => {
  try {
    const shifts = db.get('shifts');
    const sorted = [...shifts].sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shifts/active - get current active shift
router.get('/active', (req, res) => {
  try {
    const active = db.find('shifts', s => s.status === 'open');
    if (!active) {
      return res.json({ success: true, active: false, data: null });
    }

    // Calculate real-time stats for the open shift
    const sales = db.filter('sales', s => String(s.shiftId) === String(active.id) && s.status !== 'canceled');
    const cashSales = sales.filter(s => s.paymentMethod === 'Espèces').reduce((acc, s) => acc + (s.total || 0), 0);
    const orangeSales = sales.filter(s => s.paymentMethod === 'Orange Money').reduce((acc, s) => acc + (s.total || 0), 0);
    const moovSales = sales.filter(s => s.paymentMethod === 'Moov Money').reduce((acc, s) => acc + (s.total || 0), 0);
    const waveSales = sales.filter(s => s.paymentMethod === 'Wave').reduce((acc, s) => acc + (s.total || 0), 0);
    const cardSales = sales.filter(s => s.paymentMethod === 'Carte Bancaire').reduce((acc, s) => acc + (s.total || 0), 0);
    const creditSales = sales.filter(s => s.paymentMethod === 'Crédit').reduce((acc, s) => acc + (s.total || 0), 0);

    const expenses = db.filter('expenses', e => e.paymentMode === 'Espèces' && new Date(e.date) >= new Date(active.startedAt.split('T')[0]));
    const totalCashExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    const initial = active.initialAmount || 0;
    const cashIn = active.cashIn || 0;
    const cashOut = (active.cashOut || 0) + totalCashExpenses;
    const theoreticalCash = initial + cashSales + cashIn - cashOut;

    res.json({
      success: true,
      active: true,
      data: {
        ...active,
        salesCount: sales.length,
        cashSales,
        orangeSales,
        moovSales,
        waveSales,
        cardSales,
        creditSales,
        totalSales: sales.reduce((acc, s) => acc + (s.total || 0), 0),
        theoreticalCash
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/shifts/open - open a new shift
router.post('/open', (req, res) => {
  try {
    const existing = db.find('shifts', s => s.status === 'open');
    if (existing) {
      return res.status(400).json({ success: false, error: 'Un quart de caisse est déjà ouvert. Veuillez le clôturer avant.' });
    }

    const { cashierName = 'Aminata Sanogo', initialAmount = 50000, notes = '' } = req.body;

    const newShift = {
      id: Date.now(),
      cashierName,
      startedAt: new Date().toISOString(),
      closedAt: null,
      initialAmount: Number(initialAmount) || 0,
      cashIn: 0,
      cashOut: 0,
      salesCount: 0,
      salesTotal: 0,
      expectedAmount: Number(initialAmount) || 0,
      countedAmount: null,
      discrepancy: null,
      status: 'open',
      notes
    };

    const saved = db.insert('shifts', newShift);
    db.logAudit('OUVERTURE_CAISSE', cashierName, 'Caisse POS', `Ouverture de caisse avec fond initial de ${newShift.initialAmount.toLocaleString('fr-FR')} F CFA`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/shifts/movement - cash in / cash out during shift
router.post('/movement', (req, res) => {
  try {
    const active = db.find('shifts', s => s.status === 'open');
    if (!active) {
      return res.status(400).json({ success: false, error: 'Aucun quart de caisse ouvert' });
    }

    const { type = 'in', amount = 0, reason = '', operator = 'Caissier' } = req.body;
    const numAmount = Number(amount) || 0;

    let updates = {};
    if (type === 'in') {
      updates.cashIn = (active.cashIn || 0) + numAmount;
    } else {
      updates.cashOut = (active.cashOut || 0) + numAmount;
    }

    const updated = db.update('shifts', active.id, updates);
    db.logAudit(
      type === 'in' ? 'APPOINT_CAISSE' : 'DÉCAISSEMENT_CAISSE',
      operator,
      'Caisse POS',
      `${type === 'in' ? 'Apport' : 'Sortie'} d'espèces: ${numAmount.toLocaleString('fr-FR')} F CFA - Motif: ${reason}`
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/shifts/close - close shift and calculate discrepancy
router.post('/close', (req, res) => {
  try {
    const active = db.find('shifts', s => s.status === 'open');
    if (!active) {
      return res.status(400).json({ success: false, error: 'Aucun quart ouvert à clôturer' });
    }

    const { countedAmount = 0, notes = '', operator = 'Caissier' } = req.body;
    const counted = Number(countedAmount) || 0;

    // Recalculate sales for this shift
    const sales = db.filter('sales', s => String(s.shiftId) === String(active.id) && s.status !== 'canceled');
    const cashSales = sales.filter(s => s.paymentMethod === 'Espèces').reduce((acc, s) => acc + (s.total || 0), 0);
    const expected = (active.initialAmount || 0) + cashSales + (active.cashIn || 0) - (active.cashOut || 0);
    const discrepancy = counted - expected; // > 0: excédent, < 0: manquant

    const closed = db.update('shifts', active.id, {
      status: 'closed',
      closedAt: new Date().toISOString(),
      expectedAmount: expected,
      countedAmount: counted,
      discrepancy,
      closeNotes: notes,
      closedBy: operator
    });

    const ecartText = discrepancy === 0 ? 'Parfait (0 F CFA)' : (discrepancy > 0 ? `+${discrepancy.toLocaleString('fr-FR')} F CFA (Excédent)` : `${discrepancy.toLocaleString('fr-FR')} F CFA (Manquant)`);
    db.logAudit('CLÔTURE_CAISSE', operator, 'Caisse POS', `Clôture de quart. Attendu: ${expected.toLocaleString('fr-FR')} F, Compté: ${counted.toLocaleString('fr-FR')} F, Écart: ${ecartText}`);

    res.json({
      success: true,
      data: closed,
      reconciliation: {
        initialAmount: active.initialAmount,
        cashSales,
        expected,
        counted,
        discrepancy,
        status: discrepancy === 0 ? 'CONFORME' : (discrepancy > 0 ? 'EXCÉDENT' : 'MANQUANT')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
