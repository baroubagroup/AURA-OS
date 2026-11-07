import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/accounting/dashboard - SYSCOHADA financial overview
router.get('/dashboard', (req, res) => {
  try {
    const settings = db.getSettings();
    const sales = db.filter('sales', s => s.status !== 'canceled');
    const expenses = db.get('expenses');
    const products = db.get('products');
    const customers = db.get('customers');
    const suppliers = db.get('suppliers');
    const employees = db.get('employees');

    // Total Revenue (Compte 70)
    const totalTTC = sales.reduce((acc, s) => acc + (s.total || 0), 0);
    const vatRate = (settings.vatRate || 18) / 100;
    const totalHT = Math.round(totalTTC / (1 + vatRate));
    const tvaCollectee = totalTTC - totalHT;

    // Cost of Goods Sold (Compte 60)
    let cogs = 0;
    sales.forEach(sale => {
      (sale.items || []).forEach(item => {
        const p = products.find(prod => String(prod.id) === String(item.id) || prod.ref === item.ref);
        const costPrice = p ? (p.priceBuy || 0) : 0;
        cogs += costPrice * (item.quantity || 1);
      });
    });

    // Gross Margin
    const margeBrute = Math.max(0, totalHT - cogs);
    const margePercent = totalHT > 0 ? ((margeBrute / totalHT) * 100).toFixed(1) : 0;

    // Operating expenses by SYSCOHADA class
    const expensesTotal = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const servicesExterieurs = expenses.filter(e => e.category && (e.category.startsWith('61') || e.category.startsWith('62'))).reduce((acc, e) => acc + (e.amount || 0), 0);
    const tvaDeductible = Math.round(expensesTotal * 0.18 / 1.18); // Estimation TVA déductible sur factures conformes
    const tvaNetteAPayer = Math.max(0, tvaCollectee - tvaDeductible);

    // Salaries (Compte 64)
    const totalSalaires = employees.reduce((acc, emp) => acc + (Number(emp.salaryBase) || 0), 0);

    // Net Result
    const resultatNet = margeBrute - expensesTotal - totalSalaires;

    // Balance Sheet items
    const creancesClients411 = customers.reduce((acc, c) => acc + (Number(c.balanceDue) || 0), 0);
    const dettesFournisseurs401 = suppliers.reduce((acc, s) => acc + (Number(s.balanceDue) || 0), 0);

    // Inventory Valuation at Purchase Price
    const valeurStockAchat = products.reduce((acc, p) => acc + ((p.stockShelf || 0) + (p.stockReserve || 0)) * (p.priceBuy || 0), 0);
    const valeurStockVente = products.reduce((acc, p) => acc + ((p.stockShelf || 0) + (p.stockReserve || 0)) * (p.priceSell || 0), 0);

    res.json({
      success: true,
      period: 'Exercice 2026',
      currency: 'F CFA',
      syscohada: {
        compte70_chiffreAffairesTTC: totalTTC,
        compte70_chiffreAffairesHT: totalHT,
        compte60_coutAchatVendu: cogs,
        margeCommercialeBrute: margeBrute,
        tauxMargePercent: Number(margePercent),
        compte61_62_servicesExterieurs: servicesExterieurs,
        compte64_chargesPersonnel: totalSalaires,
        totalChargesExploitation: expensesTotal + totalSalaires,
        resultatExploitation: resultatNet,
        fiscalite: {
          tvaCollectee18: tvaCollectee,
          tvaDeductible18: tvaDeductible,
          tvaNetteAPayerDGI: tvaNetteAPayer,
          regime: settings.regime,
          ifu: settings.ifu
        },
        bilanActifPassif: {
          compte411_creancesClients: creancesClients411,
          compte401_dettesFournisseurs: dettesFournisseurs401,
          compte31_valeurStockAchat: valeurStockAchat,
          valeurStockVentePotentielle: valeurStockVente
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/accounting/journal - SYSCOHADA journal entries
router.get('/journal', (req, res) => {
  try {
    const sales = db.filter('sales', s => s.status !== 'canceled').slice(-30);
    const expenses = db.get('expenses').slice(-30);

    const journalEntries = [];

    // Sales entries
    sales.forEach(s => {
      const date = (s.createdAt || '').split('T')[0];
      const ht = s.htAmount || Math.round(s.total / 1.18);
      const tva = s.vatAmount || (s.total - ht);

      // Debit Client (411) or Caisse (571) / Credit Ventes (701) + TVA (4431)
      journalEntries.push({
        id: `JRN-V-${s.id}`,
        date,
        piece: s.ticketNumber,
        libelle: `Vente ${s.ticketNumber} - ${s.customer ? s.customer.name : 'Client'}`,
        lignes: [
          { compte: s.paymentMethod === 'Espèces' ? '5711 (Caisse Ouaga)' : '4111 (Clients)', debit: s.total, credit: 0 },
          { compte: '7011 (Ventes Marchandises)', debit: 0, credit: ht },
          { compte: '4431 (État, TVA Facturée)', debit: 0, credit: tva }
        ]
      });
    });

    // Expenses entries
    expenses.forEach(e => {
      journalEntries.push({
        id: `JRN-D-${e.id}`,
        date: e.date,
        piece: e.receiptRef || `DEP-${e.id}`,
        libelle: `${e.desc} - Bénéficiaire: ${e.beneficiary}`,
        lignes: [
          { compte: e.category.split(' ')[0] || '6281 (Charges Diverses)', debit: e.amount, credit: 0 },
          { compte: e.paymentMode === 'Espèces' ? '5711 (Caisse)' : '5211 (Banque Coris)', debit: 0, credit: e.amount }
        ]
      });
    });

    // Sort newest first
    journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      totalEntries: journalEntries.length,
      data: journalEntries
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
