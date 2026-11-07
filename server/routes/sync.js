import { Router } from 'express';
import { db, loadDatabase } from '../db.js';

const router = Router();

// Track processed operation IDs to guarantee idempotency
const processedOps = new Set();

// GET /api/sync/state - return complete fresh database snapshot for offline initialization
router.get('/state', (req, res) => {
  try {
    const data = loadDatabase();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        settings: data.settings,
        categories: data.categories || [],
        products: data.products || [],
        customers: data.customers || [],
        suppliers: data.suppliers || [],
        employees: data.employees || [],
        shifts: (data.shifts || []).filter(s => s.status === 'open'),
        credits: data.credits || [],
        deliveries: (data.deliveries || []).filter(d => d.status !== 'delivered'),
        documents: (data.documents || []).slice(-20)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/sync - batch process offline mutation queue
router.post('/', (req, res) => {
  try {
    const { operations = [], clientTime } = req.body;
    let appliedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const op of operations) {
      const opId = op.id || `${op.type}-${JSON.stringify(op.payload)}`;

      if (processedOps.has(opId)) {
        skippedCount++;
        continue;
      }

      try {
        switch (op.type) {
          case 'CREATE_SALE': {
            const sale = op.payload;
            db.insert('sales', sale);
            // Decrement stocks
            (sale.items || []).forEach(item => {
              const p = db.find('products', prod => String(prod.id) === String(item.id) || prod.ref === item.ref);
              if (p && p.type !== 'service') {
                db.update('products', p.id, {
                  stockShelf: Math.max(0, (p.stockShelf || 0) - item.quantity)
                });
              }
            });
            break;
          }

          case 'UPDATE_STOCK': {
            const { productId, deltaShelf, deltaReserve, type, note } = op.payload;
            const p = db.find('products', prod => String(prod.id) === String(productId));
            if (p) {
              db.update('products', p.id, {
                stockShelf: Math.max(0, (p.stockShelf || 0) + (Number(deltaShelf) || 0)),
                stockReserve: Math.max(0, (p.stockReserve || 0) + (Number(deltaReserve) || 0))
              });
            }
            break;
          }

          case 'CREATE_CUSTOMER': {
            db.insert('customers', op.payload);
            break;
          }

          case 'CREATE_EXPENSE': {
            db.insert('expenses', op.payload);
            break;
          }

          case 'RECORD_CREDIT_PAYMENT': {
            const { creditId, amount, paymentMode } = op.payload;
            const c = db.find('credits', cr => String(cr.id) === String(creditId));
            if (c) {
              const newPaid = (c.paidAmount || 0) + amount;
              const newRemaining = Math.max(0, (c.totalAmount || 0) - newPaid);
              db.update('credits', c.id, {
                paidAmount: newPaid,
                remainingAmount: newRemaining,
                status: newRemaining === 0 ? 'settled' : 'partially_paid'
              });
            }
            break;
          }

          default:
            console.warn('Unknown sync op type:', op.type);
        }

        processedOps.add(opId);
        appliedCount++;
      } catch (err) {
        errors.push({ opId, error: err.message });
      }
    }

    db.logAudit(
      'SYNCHRONISATION_OFFLINE',
      'Client POS',
      'Sync Engine',
      `Synchronisation réussie: ${appliedCount} opérations appliquées, ${skippedCount} déjà traitées (doublons ignorés)`
    );

    res.json({
      success: true,
      applied: appliedCount,
      skipped: skippedCount,
      errors,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
