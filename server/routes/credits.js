import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/credits - list all debts and receivables
router.get('/', (req, res) => {
  try {
    let credits = db.get('credits');
    const { status, customerId } = req.query;

    if (status) {
      credits = credits.filter(c => c.status === status);
    }
    if (customerId) {
      credits = credits.filter(c => String(c.customerId) === String(customerId));
    }

    const today = new Date();
    const enriched = credits.map(c => {
      const due = new Date(c.dueDate || today);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      let riskLevel = 'normal'; // 'normal', 'due_soon', 'overdue', 'critical'

      if (c.remainingAmount <= 0) {
        riskLevel = 'settled';
      } else if (diffDays < -15) {
        riskLevel = 'critical';
      } else if (diffDays < 0) {
        riskLevel = 'overdue';
      } else if (diffDays <= 3) {
        riskLevel = 'due_soon';
      }

      return {
        ...c,
        daysRemaining: diffDays,
        riskLevel
      };
    });

    const totalOutstanding = enriched.reduce((acc, c) => acc + (c.remainingAmount || 0), 0);
    const totalOverdue = enriched.filter(c => c.riskLevel === 'overdue' || c.riskLevel === 'critical').reduce((acc, c) => acc + (c.remainingAmount || 0), 0);

    res.json({
      success: true,
      metrics: {
        totalOutstanding,
        totalOverdue,
        activeDebtorsCount: enriched.filter(c => c.remainingAmount > 0).length
      },
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/credits - create a new credit record
router.post('/', (req, res) => {
  try {
    const { customerId, customerName, phone, totalAmount, dueDate, invoiceRef, notes } = req.body;
    const amount = Number(totalAmount) || 0;
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Montant de crédit invalide' });
    }

    const newCredit = {
      id: Date.now(),
      customerId: customerId || null,
      customerName: customerName || 'Client Débiteur',
      phone: phone || '',
      invoiceRef: invoiceRef || ('CRED-' + Date.now().toString().slice(-4)),
      totalAmount: amount,
      paidAmount: 0,
      remainingAmount: amount,
      dueDate: dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'pending',
      notes: notes || '',
      payments: []
    };

    const inserted = db.insert('credits', newCredit);

    if (customerId) {
      const customer = db.find('customers', c => String(c.id) === String(customerId));
      if (customer) {
        const newBalance = (customer.balanceDue || 0) + amount;
        db.update('customers', customer.id, { balanceDue: newBalance });
      }
    }

    db.logAudit(
      'OCTROI_CRÉDIT',
      'Responsable Crédit',
      'Recouvrement',
      `Crédit de ${amount.toLocaleString('fr-FR')} F CFA accordé à ${newCredit.customerName}. Échéance : ${newCredit.dueDate}`
    );

    res.json({
      success: true,
      data: inserted,
      message: `Crédit de ${amount.toLocaleString('fr-FR')} F CFA créé avec succès.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/credits/:id/payment - record a debt payment
router.post('/:id/payment', (req, res) => {
  try {
    const credit = db.find('credits', c => String(c.id) === String(req.params.id));
    if (!credit) {
      return res.status(404).json({ success: false, error: 'Dossier de crédit introuvable' });
    }

    const { amount = 0, paymentMode = 'Espèces', cashierName = 'Caissière', note = '' } = req.body;
    const payAmount = Number(amount);

    if (payAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Montant de règlement invalide' });
    }

    const newPaid = (credit.paidAmount || 0) + payAmount;
    const newRemaining = Math.max(0, (credit.totalAmount || 0) - newPaid);
    const newStatus = newRemaining === 0 ? 'settled' : 'partially_paid';

    const payments = credit.payments || [];
    payments.push({
      id: Date.now(),
      date: new Date().toISOString(),
      amount: payAmount,
      paymentMode,
      cashierName,
      note
    });

    const updated = db.update('credits', credit.id, {
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newStatus,
      payments
    });

    // Update customer's general balanceDue
    if (credit.customerId) {
      const customer = db.find('customers', c => String(c.id) === String(credit.customerId));
      if (customer) {
        const newBalance = Math.max(0, (customer.balanceDue || 0) - payAmount);
        db.update('customers', customer.id, { balanceDue: newBalance });
      }
    }

    db.logAudit(
      'ENCAISSEMENT_CRÉDIT',
      cashierName,
      'Recouvrement',
      `Règlement de ${payAmount.toLocaleString('fr-FR')} F CFA reçu pour ${credit.customerName} (${paymentMode}). Solde restant: ${newRemaining.toLocaleString('fr-FR')} F CFA`
    );

    res.json({
      success: true,
      data: updated,
      message: `Paiement de ${payAmount.toLocaleString('fr-FR')} F CFA enregistré avec succès.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/credits/:id/whatsapp-reminder - generate polite WhatsApp debt reminder text & URL
router.get('/:id/whatsapp-reminder', (req, res) => {
  try {
    const credit = db.find('credits', c => String(c.id) === String(req.params.id));
    if (!credit) {
      return res.status(404).json({ success: false, error: 'Dossier de crédit introuvable' });
    }

    const settings = db.getSettings();
    const cleanPhone = (credit.phone || '').replace(/[^0-9]/g, '');
    const amountStr = (credit.remainingAmount || 0).toLocaleString('fr-FR') + ' F CFA';
    const dueDate = credit.dueDate || 'date convenue';

    const message = `Bonjour cher(e) partenaire ${credit.customerName},\n\nSauf erreur de notre part, nous constatons un solde restant dû de *${amountStr}* sur votre compte auprès de ${settings.name}.\n\nDate d'échéance convenue : *${dueDate}*.\n\nMerci de bien vouloir procéder à la régularisation par Orange Money, Virement Bancaire ou au comptoir.\n\nContact Direction : ${settings.phone}\nMerci pour votre fidélité et excellente journée.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    res.json({
      success: true,
      customerName: credit.customerName,
      phone: credit.phone,
      message,
      whatsappUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
