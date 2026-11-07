import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// French numbers to words converter for OHADA invoices
function numberToFrenchWords(number) {
  if (isNaN(number)) return '';
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  if (number === 0) return 'zéro';
  if (number < 0) return 'moins ' + numberToFrenchWords(Math.abs(number));

  let words = '';

  if (Math.floor(number / 1000000000) > 0) {
    const b = Math.floor(number / 1000000000);
    words += (b === 1 ? 'un milliard ' : numberToFrenchWords(b) + ' milliards ');
    number %= 1000000000;
  }

  if (Math.floor(number / 1000000) > 0) {
    const m = Math.floor(number / 1000000);
    words += (m === 1 ? 'un million ' : numberToFrenchWords(m) + ' millions ');
    number %= 1000000;
  }

  if (Math.floor(number / 1000) > 0) {
    const th = Math.floor(number / 1000);
    words += (th === 1 ? 'mille ' : numberToFrenchWords(th) + ' mille ');
    number %= 1000;
  }

  if (Math.floor(number / 100) > 0) {
    const h = Math.floor(number / 100);
    words += (h === 1 ? 'cent ' : units[h] + ' cent ');
    number %= 100;
  }

  if (number > 0) {
    if (number < 20) {
      words += units[number];
    } else {
      const t = Math.floor(number / 10);
      const u = number % 10;
      if (t === 7 || t === 9) {
        words += tens[t - 1] + '-' + units[10 + u];
      } else {
        words += tens[t] + (u === 1 ? ' et un' : (u > 0 ? '-' + units[u] : ''));
      }
    }
  }

  return words.trim();
}

// GET /api/documents - list documents
router.get('/', (req, res) => {
  try {
    let docs = db.get('documents');
    const { type, search } = req.query;

    if (type && type !== 'all') {
      docs = docs.filter(d => d.type === type);
    }

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => 
        (d.ref && d.ref.toLowerCase().includes(q)) ||
        (d.client && d.client.name && d.client.name.toLowerCase().includes(q)) ||
        (d.supplier && d.supplier.name && d.supplier.name.toLowerCase().includes(q))
      );
    }

    const sorted = [...docs].sort((a, b) => (b.id || 0) - (a.id || 0));
    res.json({ success: true, total: sorted.length, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/documents/:id - single document with complete totals & French text
router.get('/:id', (req, res) => {
  try {
    const doc = db.find('documents', d => String(d.id) === String(req.params.id) || d.ref === req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document introuvable' });
    }

    const settings = db.getSettings();
    const items = doc.items || [];
    const totalHT = items.reduce((acc, it) => acc + (Number(it.total) || (Number(it.qty) * Number(it.pu))), 0);
    const vatRate = doc.vatRate !== undefined ? doc.vatRate : (settings.vatRate || 18);
    const totalTVA = Math.round(totalHT * (vatRate / 100));
    const totalTTC = totalHT + totalTVA;
    const amountInWords = numberToFrenchWords(totalTTC).toUpperCase() + ' FRANCS CFA';

    res.json({
      success: true,
      data: {
        ...doc,
        totals: {
          totalHT,
          vatRate,
          totalTVA,
          totalTTC,
          amountInWords
        },
        company: settings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/documents - create document
router.post('/', (req, res) => {
  try {
    const {
      type = 'invoice', // 'invoice', 'quote', 'order', 'delivery'
      template = 'corporate',
      client,
      supplier,
      deliveryInfo,
      items = [],
      applyStamp = true,
      paymentTerms = 'Comptant ou virement 30 jours',
      notes = ''
    } = req.body;

    const allDocs = db.get('documents');
    const seq = (allDocs.length + 1).toString().padStart(4, '0');
    const prefixes = {
      invoice: 'FACT-2026',
      quote: 'DEV-2026',
      order: 'BC-2026',
      delivery: 'BL-2026'
    };
    const ref = `${prefixes[type] || 'DOC-2026'}-${seq}`;

    const newDoc = {
      id: Date.now(),
      type,
      ref,
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      template,
      client: client || { name: 'Client Divers' },
      supplier: supplier || null,
      deliveryInfo: deliveryInfo || null,
      items,
      applyStamp,
      paymentTerms,
      notes,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('documents', newDoc);
    db.logAudit('CRÉATION_DOCUMENT', req.body.operator || 'Direction', 'Documents & Factures A4', `Création document ${ref} (${type})`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/documents/:id - update document
router.put('/:id', (req, res) => {
  try {
    const updated = db.update('documents', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Document non trouvé' });
    }
    db.logAudit('MODIFICATION_DOCUMENT', req.body.operator || 'Direction', 'Documents & Factures A4', `Mise à jour document ${updated.ref}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/documents/:id/convert-to-invoice - convert quote or order to invoice
router.post('/:id/convert-to-invoice', (req, res) => {
  try {
    const sourceDoc = db.find('documents', d => String(d.id) === String(req.params.id) || d.ref === req.params.id);
    if (!sourceDoc) {
      return res.status(404).json({ success: false, error: 'Document source non trouvé' });
    }

    const allDocs = db.get('documents');
    const seq = (allDocs.length + 1).toString().padStart(4, '0');
    const invoiceRef = `FACT-2026-${seq}`;

    const invoice = {
      id: Date.now(),
      type: 'invoice',
      ref: invoiceRef,
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      template: sourceDoc.template || 'corporate',
      client: sourceDoc.client,
      items: sourceDoc.items,
      applyStamp: true,
      paymentTerms: 'Virement ou Comptant à réception',
      notes: `Facture établie suite au document de référence ${sourceDoc.ref}.`,
      originRef: sourceDoc.ref,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('documents', invoice);
    db.logAudit('CONVERSION_DOCUMENT', req.body.operator || 'Direction', 'Documents & Factures A4', `Conversion du devis/BC ${sourceDoc.ref} en Facture Définitive ${invoiceRef}`);

    res.status(201).json({ success: true, data: saved, message: `Converti en facture ${invoiceRef}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/documents/:id - delete document
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete('documents', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Document non trouvé' });
    }
    db.logAudit('SUPPRESSION_DOCUMENT', req.query.operator || 'Admin', 'Documents & Factures A4', `Suppression document ${deleted.ref}`);
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
