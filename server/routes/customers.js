import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/customers - list all customers
router.get('/', (req, res) => {
  try {
    let customers = db.get('customers');
    const { search, cat, hasDebt } = req.query;

    if (cat && cat !== 'all') {
      customers = customers.filter(c => c.cat === cat);
    }
    if (hasDebt === 'true') {
      customers = customers.filter(c => (c.balanceDue || 0) > 0);
    }
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.ifu && c.ifu.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, total: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/customers/:id - get customer details + history
router.get('/:id', (req, res) => {
  try {
    const customer = db.find('customers', c => String(c.id) === String(req.params.id));
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }

    const sales = db.filter('sales', s => s.customer && (String(s.customer.id) === String(customer.id) || s.customer.name === customer.name));
    const credits = db.filter('credits', c => String(c.customerId) === String(customer.id) || c.customerName === customer.name);

    res.json({
      success: true,
      data: {
        ...customer,
        salesHistory: sales,
        creditHistory: credits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/customers - create a customer
router.post('/', (req, res) => {
  try {
    const { name, cat = 'B2C', phone = '', email = '', ifu = '', rccm = '', city = 'Ouagadougou', address = '', creditLimit = 500000 } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Le nom du client est obligatoire' });
    }

    const newCustomer = {
      id: Date.now().toString(),
      name,
      cat, // 'B2B', 'B2C', 'Grossiste', 'Institutionnel'
      phone,
      email,
      ifu,
      rccm,
      city,
      address,
      balanceDue: 0,
      creditLimit: Number(creditLimit) || 0,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('customers', newCustomer);
    db.logAudit('CRÉATION_CLIENT', req.body.operator || 'Commercial', 'CRM Clients', `Nouveau compte client créé: ${saved.name} (${saved.cat})`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/customers/:id - update a customer
router.put('/:id', (req, res) => {
  try {
    const updated = db.update('customers', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    db.logAudit('MODIFICATION_CLIENT', req.body.operator || 'Commercial', 'CRM Clients', `Mise à jour fiche client: ${updated.name}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/customers/:id - delete customer
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete('customers', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    db.logAudit('SUPPRESSION_CLIENT', req.query.operator || 'Admin', 'CRM Clients', `Suppression compte client: ${deleted.name}`);
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
