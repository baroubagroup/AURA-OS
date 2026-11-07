import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/hr/employees - list employees
router.get('/employees', (req, res) => {
  try {
    const employees = db.get('employees');
    res.json({ success: true, total: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/hr/employees - add employee
router.post('/employees', (req, res) => {
  try {
    const {
      name,
      role = 'Employé',
      contract = 'CDI',
      phone = '',
      cnss = '',
      salaryBase = 100000,
      hired = new Date().toISOString().split('T')[0]
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Le nom du salarié est obligatoire' });
    }

    const newEmp = {
      id: Date.now().toString(),
      name,
      role,
      contract,
      phone,
      cnss,
      salaryBase: Number(salaryBase) || 60000,
      hired,
      status: 'Actif',
      attendance: 'Présent',
      arrivalTime: '08:00',
      advances: 0,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('employees', newEmp);
    db.logAudit('RECRUTEMENT_RH', req.body.operator || 'RH', 'Ressources Humaines', `Nouveau salarié enregistré: ${name} (${role})`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/hr/employees/:id - update employee
router.put('/employees/:id', (req, res) => {
  try {
    const updated = db.update('employees', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Employé non trouvé' });
    }
    db.logAudit('MODIFICATION_RH', req.body.operator || 'RH', 'Ressources Humaines', `Mise à jour fiche salarié: ${updated.name}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/hr/employees/:id/attendance - pointage interactif
router.patch('/employees/:id/attendance', (req, res) => {
  try {
    const { attendance, arrivalTime, operator = 'RH / Superviseur' } = req.body;
    const emp = db.find('employees', e => String(e.id) === String(req.params.id));
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employé non trouvé' });
    }

    const updated = db.update('employees', emp.id, {
      attendance, // 'Présent', 'Retard', 'Absent'
      arrivalTime: arrivalTime || (attendance === 'Absent' ? '--:--' : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    });

    db.logAudit('POINTAGE_RH', operator, 'Ressources Humaines', `Pointage de ${emp.name} marqué comme "${attendance}" à ${updated.arrivalTime}`);

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/hr/advances - list salary advances
router.get('/advances', (req, res) => {
  try {
    const advances = db.get('salaryAdvances') || [];
    const sorted = [...advances].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.json({ success: true, total: sorted.length, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/hr/advances - create advance on salary
router.post('/advances', (req, res) => {
  try {
    const { empId, amount, reason = 'Acompte quinzaine', operator = 'Comptabilité' } = req.body;
    const emp = db.find('employees', e => String(e.id) === String(empId));
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employé non trouvé' });
    }

    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Montant invalide' });
    }

    const newAdvance = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      empId: emp.id,
      employeeName: emp.name,
      amount: numAmount,
      reason,
      status: 'Validé & Décaissé',
      operator
    };

    const saved = db.insert('salaryAdvances', newAdvance);

    // Update employee advances balance
    db.update('employees', emp.id, {
      advances: (emp.advances || 0) + numAmount
    });

    db.logAudit('ACOMPTE_SALAIRE', operator, 'Ressources Humaines', `Acompte accordé à ${emp.name}: ${numAmount.toLocaleString('fr-FR')} F CFA (${reason})`);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/hr/payslips/:id - calculate complete OHADA / Burkina Faso payslip
router.get('/payslips/:id', (req, res) => {
  try {
    const emp = db.find('employees', e => String(e.id) === String(req.params.id));
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Salarié introuvable' });
    }

    const settings = db.getSettings();
    const base = Number(emp.salaryBase) || 100000;
    const prime = 15000; // Prime de transport / panier standard
    const brut = base + prime;

    // Cotisations Sociales & Fiscales Burkina Faso / OHADA
    const cnssPartSalariale = Math.round(brut * 0.055); // 5.5% CNSS Salariale
    const iuts = Math.round(brut * 0.07); // ~7% IUTS standard
    const totalRetenuesFiscales = cnssPartSalariale + iuts;

    const advances = Number(emp.advances) || 0;
    const netAPayer = Math.max(0, brut - totalRetenuesFiscales - advances);

    // Charges Patronales
    const cnssPartPatronale = Math.round(brut * 0.16); // 16% CNSS Employeur
    const tpa = Math.round(brut * 0.03); // 3% Taxe Patronale d'Apprentissage
    const totalChargesPatronales = cnssPartPatronale + tpa;
    const coutGlobalEntreprise = brut + totalChargesPatronales;

    const monthStr = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    res.json({
      success: true,
      payslip: {
        company: {
          name: settings.name,
          ifu: settings.ifu,
          rccm: settings.rccm,
          address: settings.address,
          phone: settings.phone
        },
        period: monthStr.toUpperCase(),
        employee: {
          id: emp.id,
          name: emp.name,
          role: emp.role,
          contract: emp.contract,
          cnss: emp.cnss || 'Non renseigné',
          hired: emp.hired
        },
        earnings: [
          { label: 'Salaire de Base Conventionnel', base: base, rate: 1, gain: base, deduction: 0 },
          { label: 'Prime Forfaitaire de Transport & Panier', base: prime, rate: 1, gain: prime, deduction: 0 }
        ],
        deductions: [
          { label: 'Cotisation Retraite CNSS (Part Salariale)', base: brut, rate: '5.50%', gain: 0, deduction: cnssPartSalariale },
          { label: 'Impôt Unique sur Traitements et Salaires (IUTS)', base: brut, rate: '7.00%', gain: 0, deduction: iuts },
          { label: 'Remboursement Acomptes sur Salaire', base: advances, rate: '100%', gain: 0, deduction: advances }
        ],
        summary: {
          salaireBrut: brut,
          totalRetenues: totalRetenuesFiscales + advances,
          netAPayer,
          cnssPartPatronale,
          tpa,
          coutGlobalEntreprise
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
