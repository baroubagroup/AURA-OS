import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/sales - list sales
router.get('/', (req, res) => {
  try {
    let sales = db.get('sales');
    const { date, shiftId, cashier, limit = 50 } = req.query;

    if (date) {
      sales = sales.filter(s => s.createdAt && s.createdAt.startsWith(date));
    }
    if (shiftId) {
      sales = sales.filter(s => String(s.shiftId) === String(shiftId));
    }
    if (cashier) {
      sales = sales.filter(s => s.cashierName && s.cashierName.toLowerCase().includes(cashier.toLowerCase()));
    }

    // Sort newest first
    sales = [...sales].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      total: sales.length,
      data: sales.slice(0, Number(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sales/:id - get single sale
router.get('/:id', (req, res) => {
  try {
    const sale = db.find('sales', s => String(s.id) === String(req.params.id) || s.ticketNumber === req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Vente non trouvée' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/sales - execute checkout
router.post('/', (req, res) => {
  try {
    const {
      items = [],
      customer,
      paymentMethod = 'Espèces', // 'Espèces', 'Orange Money', 'Moov Money', 'Wave', 'Carte Bancaire', 'Chèque', 'Crédit'
      cashReceived = 0,
      discount = 0,
      cashierName = 'Aminata Sanogo',
      notes = ''
    } = req.body;

    if (!items.length) {
      return res.status(400).json({ success: false, error: 'Le panier est vide' });
    }

    const settings = db.getSettings();
    const activeShift = db.find('shifts', s => s.status === 'open');

    // Compute totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      subtotal += lineTotal;
      return {
        id: item.id,
        ref: item.ref || '',
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        total: lineTotal
      };
    });

    const total = Math.max(0, subtotal - Number(discount));
    const vatRate = settings.vatRate || 18;
    const htAmount = Math.round(total / (1 + vatRate / 100));
    const vatAmount = total - htAmount;

    // Generate ticket number: TK-YYYY-NNNN
    const allSales = db.get('sales');
    const ticketSeq = (allSales.length + 1).toString().padStart(4, '0');
    const ticketNumber = `TK-2026-${ticketSeq}`;

    const newSale = {
      id: Date.now(),
      ticketNumber,
      createdAt: new Date().toISOString(),
      shiftId: activeShift ? activeShift.id : null,
      cashierName,
      customer: customer || { name: 'Client Comptant (Particulier)', cat: 'B2C' },
      items: processedItems,
      subtotal,
      discount: Number(discount) || 0,
      total,
      htAmount,
      vatAmount,
      paymentMethod,
      cashReceived: Number(cashReceived) || total,
      changeGiven: Math.max(0, (Number(cashReceived) || total) - total),
      status: 'completed',
      notes
    };

    // 1. Decrement product stocks
    processedItems.forEach(item => {
      const product = db.find('products', p => String(p.id) === String(item.id) || p.ref === item.ref);
      if (product && product.type !== 'service') {
        const newShelf = Math.max(0, (product.stockShelf || 0) - item.quantity);
        db.update('products', product.id, {
          stockShelf: newShelf,
          lastStockUpdate: new Date().toISOString()
        });
      }
    });

    // 2. If active shift exists, update shift sales total
    if (activeShift) {
      const shiftSales = (activeShift.salesTotal || 0) + total;
      const expectedAmount = (activeShift.initialAmount || 0) + (activeShift.cashIn || 0) - (activeShift.cashOut || 0) + (paymentMethod === 'Espèces' ? total : 0);
      db.update('shifts', activeShift.id, {
        salesTotal: shiftSales,
        salesCount: (activeShift.salesCount || 0) + 1,
        expectedAmount
      });
    }

    // 3. If payment method is Crédit, record debt
    if (paymentMethod === 'Crédit' && customer) {
      db.insert('credits', {
        id: Date.now(),
        customerId: customer.id || null,
        customerName: customer.name,
        phone: customer.phone || '',
        ticketNumber,
        totalAmount: total,
        paidAmount: 0,
        remainingAmount: total,
        dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Update customer balanceDue
      if (customer.id) {
        const cRecord = db.find('customers', c => String(c.id) === String(customer.id));
        if (cRecord) {
          db.update('customers', cRecord.id, {
            balanceDue: (cRecord.balanceDue || 0) + total
          });
        }
      }
    }

    // 4. Save sale record
    const saved = db.insert('sales', newSale);

    // 5. Audit log
    db.logAudit(
      'ENCAISSEMENT_VENTE',
      cashierName,
      'Caisse POS',
      `Vente ${ticketNumber} de ${total.toLocaleString('fr-FR')} F CFA (${paymentMethod})`
    );

    res.status(201).json({
      success: true,
      data: saved,
      receiptPrintable: {
        company: settings,
        sale: saved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/sales/:id/cancel - cancel a sale and replenish stock
router.post('/:id/cancel', (req, res) => {
  try {
    const sale = db.find('sales', s => String(s.id) === String(req.params.id) || s.ticketNumber === req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Vente non trouvée' });
    }

    if (sale.status === 'canceled') {
      return res.status(400).json({ success: false, error: 'Cette vente est déjà annulée' });
    }

    const { reason = 'Annulation client', operator = 'Admin' } = req.body;

    // Restore stock
    sale.items.forEach(item => {
      const product = db.find('products', p => String(p.id) === String(item.id) || p.ref === item.ref);
      if (product && product.type !== 'service') {
        db.update('products', product.id, {
          stockShelf: (product.stockShelf || 0) + item.quantity
        });
      }
    });

    const updated = db.update('sales', sale.id, {
      status: 'canceled',
      cancelReason: reason,
      canceledAt: new Date().toISOString(),
      canceledBy: operator
    });

    db.logAudit('ANNULATION_VENTE', operator, 'Caisse POS', `Annulation ticket ${sale.ticketNumber} - Motif: ${reason}`);

    res.json({ success: true, data: updated, message: 'Vente annulée et stock réapprovisionné avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
