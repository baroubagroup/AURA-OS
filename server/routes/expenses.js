import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/expenses - list disbursements
router.get('/', (req, res) => {
  try {
    let expenses = db.get('expenses');
    const { category, paymentMode, date, startDate, endDate } = req.query;

    if (category) {
      expenses = expenses.filter(e => e.category && e.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (paymentMode) {
      expenses = expenses.filter(e => e.paymentMode === paymentMode);
    }
    if (date) {
      expenses = expenses.filter(e => e.date === date);
    }
    if (startDate && endDate) {
      expenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);
    }

    const totalAmount = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const sorted = [...expenses].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    res.json({
      success: true,
      totalCount: sorted.length,
      totalAmount,
      data: sorted
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/expenses - create disbursement
router.post('/', (req, res) => {
  try {
    const {
      date = new Date().toISOString().split('T')[0],
      category = '62 - Services extérieurs & Loyers',
      desc,
      beneficiary,
      amount,
      paymentMode = 'Espèces',
      cashierName = 'Aminata Sanogo',
      receiptRef = ''
    } = req.body;

    if (!desc || !amount) {
      return res.status(400).json({ success: false, error: 'La description et le montant sont obligatoires' });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Le montant doit être supérieur à zéro' });
    }

    const newExpense = {
      id: Date.now(),
      date,
      category,
      desc,
      beneficiary: beneficiary || 'Fournisseur divers',
      amount: numAmount,
      paymentMode,
      cashierName,
      receiptRef,
      createdAt: new Date().toISOString()
    };

    // If paid by cash and active shift is open, update shift cashOut
    if (paymentMode === 'Espèces') {
      const activeShift = db.find('shifts', s => s.status === 'open');
      if (activeShift) {
        db.update('shifts', activeShift.id, {
          cashOut: (activeShift.cashOut || 0) + numAmount,
          expectedAmount: (activeShift.expectedAmount || 0) - numAmount
        });
      }
    }

    const saved = db.insert('expenses', newExpense);
    db.logAudit(
      'DÉPENSE_ENREGISTRÉE',
      cashierName,
      'Finances & Dépenses',
      `Décaissement de ${numAmount.toLocaleString('fr-FR')} F CFA [${category}] - Bénéficiaire: ${saved.beneficiary}`
    );

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/expenses/:id - delete/cancel expense
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete('expenses', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Dépense introuvable' });
    }
    db.logAudit('ANNULATION_DÉPENSE', req.query.operator || 'Admin', 'Finances & Dépenses', `Annulation dépense #${deleted.id}: ${deleted.desc} (${deleted.amount} F CFA)`);
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
