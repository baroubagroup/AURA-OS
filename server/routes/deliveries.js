import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/deliveries - list deliveries
router.get('/', (req, res) => {
  try {
    let deliveries = db.get('deliveries');
    const { status, driver } = req.query;

    if (status && status !== 'all') {
      deliveries = deliveries.filter(d => d.status === status);
    }
    if (driver) {
      deliveries = deliveries.filter(d => d.driver && d.driver.toLowerCase().includes(driver.toLowerCase()));
    }

    const sorted = [...deliveries].sort((a, b) => (b.id || 0) - (a.id || 0));
    res.json({ success: true, total: sorted.length, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/deliveries/:id - get delivery details
router.get('/:id', (req, res) => {
  try {
    const delivery = db.find('deliveries', d => String(d.id) === String(req.params.id) || d.ref === req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Bon de livraison introuvable' });
    }
    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/deliveries - create delivery note
router.post('/', (req, res) => {
  try {
    const {
      customerName,
      customerPhone = '',
      address,
      driver = 'Moussa Traoré',
      vehicle = 'Camionnette Isuzu (11-JJ-4859)',
      departureTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' GMT',
      packagesCount = '1 Colis',
      weight = 'Standard',
      fee = 0,
      notes = ''
    } = req.body;

    if (!customerName || !address) {
      return res.status(400).json({ success: false, error: 'Le client et l\'adresse de livraison sont requis' });
    }

    const allDeliveries = db.get('deliveries');
    const refSeq = (allDeliveries.length + 1).toString().padStart(4, '0');
    const ref = `BL-2026-${refSeq}`;

    const newDelivery = {
      id: Date.now(),
      ref,
      customerName,
      customerPhone,
      address,
      driver,
      vehicle,
      departureTime,
      packagesCount,
      weight,
      fee: Number(fee) || 0,
      status: 'delivering', // 'pending', 'delivering', 'delivered', 'canceled'
      notes,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('deliveries', newDelivery);
    db.logAudit('EXPÉDITION_LIVRAISON', req.body.operator || 'Logistique', 'Expéditions', `Départ livraison ${ref} vers ${address} (Chauffeur: ${driver})`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/deliveries/:id/status - update status (e.g. delivered with discharge)
router.patch('/:id/status', (req, res) => {
  try {
    const { status, operator = 'Chauffeur' } = req.body;
    const delivery = db.find('deliveries', d => String(d.id) === String(req.params.id) || d.ref === req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Bon de livraison non trouvé' });
    }

    const updated = db.update('deliveries', delivery.id, {
      status,
      deliveredAt: status === 'delivered' ? new Date().toISOString() : delivery.deliveredAt
    });

    db.logAudit('STATUT_LIVRAISON', operator, 'Expéditions', `Mise à jour livraison ${delivery.ref}: Statut passé à "${status.toUpperCase()}"`);

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
