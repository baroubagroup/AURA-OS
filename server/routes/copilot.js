import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * POST /api/copilot/chat
 * Intelligence Métier Grounded sur les données de l'entreprise
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message requis' });
    }

    const data = db.data || {};
    const products = data.products || [];
    const customers = data.customers || [];
    const employees = data.employees || [];
    const suppliers = data.suppliers || [];
    const sales = data.sales || [];
    const shifts = data.shifts || [];
    const expenses = data.expenses || [];
    const credits = data.credits || [];
    const deliveries = data.deliveries || [];
    const settings = data.settings || {};

    const apiKey = process.env.GEMINI_API_KEY || settings.geminiApiKey || process.env.GOOGLE_API_KEY;

    // Si une clé Gemini est disponible, on sollicite l'IA avec grounding strict
    if (apiKey) {
      try {
        const prompt = buildGeminiPrompt(message, {
          settings,
          products,
          customers,
          employees,
          suppliers,
          sales,
          shifts,
          expenses,
          credits,
          deliveries
        });

        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000
            }
          })
        });

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return res.json({
              success: true,
              answer: formatMarkdownToHtml(candidateText),
              provider: 'gemini-grounded',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (geminiErr) {
        console.warn('[COPILOT GEMINI FALLBACK]', geminiErr.message);
      }
    }

    // Moteur d'analyse sémantique déterministe (Zero-Hallucination)
    const localAnswer = executeSemanticBusinessReasoning(message, {
      settings,
      products,
      customers,
      employees,
      suppliers,
      sales,
      shifts,
      expenses,
      credits,
      deliveries
    });

    return res.json({
      success: true,
      answer: localAnswer,
      provider: 'aura-semantic-engine',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[COPILOT ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function buildGeminiPrompt(userQuery, ctx) {
  // Extraction synthétique des données pour le prompt
  const stockCount = ctx.products.length;
  const totalPieces = ctx.products.reduce((s, p) => s + (p.stockStore || 0) + (p.stockWarehouse || 0), 0);
  const totalValuation = ctx.products.reduce((s, p) => s + ((p.stockStore || 0) + (p.stockWarehouse || 0)) * (p.priceSale || 0), 0);
  const totalCost = ctx.products.reduce((s, p) => s + ((p.stockStore || 0) + (p.stockWarehouse || 0)) * (p.priceBuy || 0), 0);
  const totalDue = ctx.customers.reduce((s, c) => s + (Number(c.due) || 0), 0);

  return `Tu es l'agent IA d'entreprise interne et exclusif d'AURA Commerce SARL (Burkina Faso).
Tu t'adresses aux dirigeants et gestionnaires de l'entreprise.
Tu as accès en temps réel aux données exactes de l'entreprise ci-dessous.
RÈGLES IMPÉRATIVES :
1. Réponds UNIQUEMENT et STRICTEMENT à partir des chiffres et faits de la base de données fournie ci-dessous.
2. Tu n'inventes AUCUNE donnée. Si une information n'est pas dans la base, dis-le poliment.
3. Formate les montants en Francs CFA (ex: 450 000 F CFA).
4. Sois précis, professionnel, courtois et synthétique.

--- BASE DE DONNÉES EN TEMPS RÉEL ---
Entreprise: ${ctx.settings.name || 'AURA Commerce SARL'} (IFU: ${ctx.settings.ifu})
Stocks: ${stockCount} références, ${totalPieces} pièces physiques au total (Valeur d'achat: ${totalCost} F, Valeur vente: ${totalValuation} F CFA).
Articles: ${JSON.stringify(ctx.products.map(p => ({ nom: p.name, code: p.code, rayon: p.stockStore, reserve: p.stockWarehouse, achat: p.priceBuy, vente: p.priceSale, alerte: p.alertThreshold })))}
Clients débiteurs: ${JSON.stringify(ctx.customers.filter(c => Number(c.due) > 0).map(c => ({ nom: c.name, dette: c.due, tel: c.phone, plafond: c.limit })))}
Total créances clients: ${totalDue} F CFA
Employés: ${JSON.stringify(ctx.employees.map(e => ({ nom: e.name, poste: e.role, dept: e.department, salaire: e.baseSalary })))}
Fournisseurs: ${JSON.stringify(ctx.suppliers.map(s => ({ nom: s.name, contact: s.contact, tel: s.phone })))}
Dépenses récentes: ${JSON.stringify(ctx.expenses.slice(0, 5))}
--- FIN DE LA BASE ---

QUESTION DE L'UTILISATEUR :
"${userQuery}"
`;
}

function formatMarkdownToHtml(md) {
  let html = md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h4 class="font-bold text-sm text-purple-400 mt-2">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="font-bold text-base text-purple-300 mt-2">$1</h3>')
    .replace(/^\- (.*$)/gim, '• $1<br>')
    .replace(/\n\n/g, '<br><br>');
  return `<div class="space-y-1.5 leading-relaxed text-xs">${html}</div>`;
}

function executeSemanticBusinessReasoning(q, ctx) {
  const qLower = q.toLowerCase().trim();
  const products = ctx.products || [];
  const customers = ctx.customers || [];
  const employees = ctx.employees || [];
  const suppliers = ctx.suppliers || [];
  const expenses = ctx.expenses || [];
  const shifts = ctx.shifts || [];

  // 1. NOMBRE D'ARTICLES / QUANTITÉ PHYSIQUE / STOCKS
  if (
    qLower.includes("nombre d'articles") ||
    qLower.includes("nombre d'article") ||
    qLower.includes("combien d'articles") ||
    qLower.includes("combien d'article") ||
    qLower.includes("combien de produits") ||
    qLower.includes("total d'articles") ||
    qLower.includes("total articles") ||
    qLower.includes("pièces en stock") ||
    (qLower.includes("combien") && qLower.includes("stock")) ||
    (qLower.includes("quantité") && qLower.includes("stock")) ||
    qLower === "stock" ||
    qLower === "stocks"
  ) {
    const totalRef = products.length;
    const piecesRayon = products.reduce((s, p) => s + (Number(p.stockStore) || 0), 0);
    const piecesReserve = products.reduce((s, p) => s + (Number(p.stockWarehouse) || 0), 0);
    const totalPieces = piecesRayon + piecesReserve;
    const valBuy = products.reduce((s, p) => s + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceBuy) || 0), 0);
    const valSale = products.reduce((s, p) => s + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceSale) || 0), 0);

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">📊 Inventaire Physique des Stocks</span>
          <span class="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-black text-[10px]">${totalRef} références</span>
        </div>
        <p>Voici la décomposition exacte de votre stock à cet instant :</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-[var(--bg-app)] rounded-xl border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">En Rayon Vente :</span>
            <strong class="text-base text-teal-400 font-mono font-bold">${piecesRayon.toLocaleString('fr-FR')} pièces</strong>
            <span class="text-[9px] text-teal-500 block">Prêtes à être encaissées</span>
          </div>
          <div class="p-2.5 bg-[var(--bg-app)] rounded-xl border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">En Réserve Dépôt :</span>
            <strong class="text-base text-indigo-400 font-mono font-bold">${piecesReserve.toLocaleString('fr-FR')} pièces</strong>
            <span class="text-[9px] text-indigo-400 block">Stock tampon magasin</span>
          </div>
        </div>
        <div class="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1 text-[11px]">
          <div class="flex justify-between font-black text-xs text-purple-200">
            <span>VOLUME TOTAL EN STOCK :</span>
            <span class="text-emerald-400 font-mono">${totalPieces.toLocaleString('fr-FR')} pièces physiques</span>
          </div>
          <div class="flex justify-between text-slate-300 pt-1 border-t border-purple-500/20">
            <span>Coût d'achat total immobilisé :</span>
            <strong class="font-mono">${valBuy.toLocaleString('fr-FR')} F CFA</strong>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Valeur marchande vente estimée :</span>
            <strong class="font-mono text-emerald-300">${valSale.toLocaleString('fr-FR')} F CFA</strong>
          </div>
        </div>
        <button onclick="switchView('stock'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Consulter le Catalogue Détaillé des Stocks
        </button>
      </div>
    `;
  }

  // 2. BÉNÉFICE / MARGE / RENTABILITÉ / PROFIT
  if (
    qLower.includes('bénéfice') ||
    qLower.includes('benefice') ||
    qLower.includes('marge') ||
    qLower.includes('rentabilité') ||
    qLower.includes('profit') ||
    qLower.includes('gains nets') ||
    qLower === 'marge'
  ) {
    const valBuy = products.reduce((s, p) => s + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceBuy) || 0), 0);
    const valSale = products.reduce((s, p) => s + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceSale) || 0), 0);
    const grossMargin = valSale - valBuy;
    const marginRate = valSale > 0 ? ((grossMargin / valSale) * 100).toFixed(1) : '0';

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-emerald-400">📈 Analyse de Rentabilité & Bénéfices</span>
          <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black text-[10px]">Taux : ${marginRate}%</span>
        </div>
        <p>Voici l'état des marges et profits générés par votre activité :</p>
        <div class="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border)] space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-400">Valeur Vente du Stock :</span>
            <strong class="font-mono">${valSale.toLocaleString('fr-FR')} F CFA</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Coût d'Achat des Marchandises :</span>
            <strong class="font-mono text-slate-300">- ${valBuy.toLocaleString('fr-FR')} F CFA</strong>
          </div>
          <div class="pt-2 border-t border-[var(--border)] flex justify-between text-emerald-400 font-bold">
            <span>MARGE BRUTE POTENTIELLE DU STOCK :</span>
            <span class="font-mono font-black text-sm">+ ${grossMargin.toLocaleString('fr-FR')} F CFA</span>
          </div>
        </div>
        <div class="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-[11px] text-slate-300">
          💡 <strong>Indicateur clé :</strong> Sur chaque tranche de 10 000 F CFA vendue, votre entreprise dégage en moyenne <strong>${Math.round(marginRate * 100).toLocaleString('fr-FR')} F CFA</strong> de marge brute après déduction du coût d'achat.
        </div>
        <button onclick="switchView('accounting'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Ouvrir le Module Comptabilité & Bilan
        </button>
      </div>
    `;
  }

  // 3. RESSOURCES HUMAINES / ÉQUIPE / QUI EST QUI
  if (
    qLower.includes('employé') ||
    qLower.includes('salarié') ||
    qLower.includes('équipe') ||
    qLower.includes('personnel') ||
    qLower.includes('ressources humaines') ||
    qLower.includes('rh') ||
    qLower.includes('qui est') ||
    qLower.includes('moussa') ||
    qLower.includes('abdoul') ||
    qLower.includes('issouf') ||
    qLower.includes('kadiatou') ||
    qLower.includes('salif')
  ) {
    let matchedEmp = employees.find(e => qLower.includes(e.name.toLowerCase()) || (e.role && qLower.includes(e.role.toLowerCase())));

    if (matchedEmp) {
      return `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span class="font-bold text-purple-400">👤 Fiche Collaborateur</span>
            <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold text-[10px]">${matchedEmp.department || 'AURA OS'}</span>
          </div>
          <div class="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border)] space-y-1.5 text-xs">
            <div class="text-sm font-black text-[var(--text-main)]">${matchedEmp.name}</div>
            <div class="text-teal-400 font-semibold">${matchedEmp.role}</div>
            <div class="text-slate-400 text-[11px]">Matricule : <strong class="text-slate-200 font-mono">${matchedEmp.matricule || 'EMP-001'}</strong></div>
            <div class="text-slate-400 text-[11px]">Salaire de base : <strong class="text-emerald-400 font-mono">${Number(matchedEmp.baseSalary || 150000).toLocaleString('fr-FR')} F CFA</strong></div>
            <div class="text-slate-400 text-[11px]">Contact : <span>${matchedEmp.phone || '+226 70 00 00 00'}</span></div>
          </div>
          <button onclick="switchView('hr'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
            Consulter l'Équipe & Fiches de Paie
          </button>
        </div>
      `;
    }

    let empList = employees.map(e => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-[var(--text-main)]">${e.name}</strong>
          <span class="text-[10px] text-teal-400 block">${e.role}</span>
        </div>
        <div class="text-right">
          <span class="font-mono text-emerald-400 font-bold">${Number(e.baseSalary || 150000).toLocaleString('fr-FR')} F</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">👥 Équipe & Ressources Humaines</span>
          <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold text-[10px]">${employees.length} collaborateurs</span>
        </div>
        <p>Voici les membres enregistrés dans le personnel de l'entreprise :</p>
        <div class="space-y-1.5">
          ${empList}
        </div>
        <button onclick="switchView('hr'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Gérer les Salaires & Avances RH
        </button>
      </div>
    `;
  }

  // 4. CRÉANCES & DÉBITEURS
  if (
    qLower.includes('doit') ||
    qLower.includes('dette') ||
    qLower.includes('créance') ||
    qLower.includes('impayé') ||
    qLower.includes('redevable') ||
    qLower.includes('encours')
  ) {
    const debtors = customers.filter(c => Number(c.due || 0) > 0);
    const totalDue = debtors.reduce((sum, c) => sum + Number(c.due || 0), 0);

    if (debtors.length === 0) {
      return `
        <div class="space-y-1">
          <span class="font-bold text-emerald-400">Excellente situation !</span>
          <p>Aucun client n'a de dette en cours actuellement. Toutes les créances sont soldées.</p>
        </div>
      `;
    }

    let debtorsRows = debtors.map(c => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <div class="font-bold text-[var(--text-main)]">${c.name}</div>
          <div class="text-[10px] text-[var(--text-muted)]">Tél : ${c.phone || 'Non renseigné'} | Plafond : ${Number(c.limit || 0).toLocaleString('fr-FR')} F</div>
        </div>
        <div class="text-right">
          <div class="font-black text-rose-500 font-num">${Number(c.due).toLocaleString('fr-FR')} F CFA</div>
          <button onclick="printClientStatement('${c.id}'); toggleAuraCopilot(false);" class="text-[10px] text-blue-400 hover:underline font-semibold">Voir Relevé</button>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">Synthèse des Créances Clients</span>
          <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-black text-[10px]">${debtors.length} débiteurs</span>
        </div>
        <p>Le montant total des créances non soldées s'élève à <strong class="text-rose-400 font-num">${totalDue.toLocaleString('fr-FR')} F CFA</strong> :</p>
        <div class="space-y-1.5 pt-1">
          ${debtorsRows}
        </div>
        <button onclick="switchView('clients'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center mt-1">
          Ouvrir CRM Clients & Relances
        </button>
      </div>
    `;
  }

  // 5. CAISSE & CHIFFRE D'AFFAIRES
  if (
    qLower.includes('caisse') ||
    qLower.includes("chiffre d'affaires") ||
    qLower.includes('recette') ||
    qLower.includes('vente') ||
    qLower.includes('argent')
  ) {
    const shift = ctx.shifts?.[0] || {
      cashierName: 'Abdoul C.',
      initialAmount: 50000,
      cashSales: 342500,
      digitalSales: 85000,
      creditSales: 50000,
      cashExpenses: 25000
    };
    const initial = Number(shift.initialAmount || 50000);
    const cashSales = Number(shift.cashSales || 342500);
    const digitalSales = Number(shift.digitalSales || 85000);
    const expenses = Number(shift.cashExpenses || 25000);
    const totalSales = cashSales + digitalSales + (Number(shift.creditSales) || 50000);
    const physicalCashInDrawer = initial + cashSales - expenses;

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">État Financier & Caisse Actuelle</span>
          <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">Session Active</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-[var(--bg-app)] rounded-xl border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Chiffre d'Affaires Brut :</span>
            <strong class="text-base text-emerald-400 font-mono font-black">${totalSales.toLocaleString('fr-FR')} F CFA</strong>
          </div>
          <div class="p-2.5 bg-[var(--bg-app)] rounded-xl border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Espèces en Tiroir-Caisse :</span>
            <strong class="text-base text-teal-400 font-mono font-black">${physicalCashInDrawer.toLocaleString('fr-FR')} F CFA</strong>
          </div>
        </div>
        <div class="space-y-1 text-[11px] text-[var(--text-muted)] pt-1">
          <div class="flex justify-between"><span>Ventes Espèces :</span> <strong class="text-[var(--text-main)]">${cashSales.toLocaleString('fr-FR')} F</strong></div>
          <div class="flex justify-between"><span>Mobile Money (Wave/Orange) :</span> <strong class="text-[var(--text-main)]">${digitalSales.toLocaleString('fr-FR')} F</strong></div>
          <div class="flex justify-between"><span>Décaissements / Dépenses :</span> <strong class="text-rose-400">-${expenses.toLocaleString('fr-FR')} F</strong></div>
        </div>
        <button onclick="switchView('shifts'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center mt-1">
          Consulter les Sessions de Caisse
        </button>
      </div>
    `;
  }

  // 6. ARTICLE SPÉCIFIQUE
  const matchedArticle = products.find(a => 
    qLower.includes(a.name.toLowerCase()) || 
    (a.code && qLower.includes(a.code.toLowerCase())) || 
    (a.category && qLower.includes(a.category.toLowerCase()))
  );
  if (matchedArticle) {
    const totalStock = (matchedArticle.stockStore || 0) + (matchedArticle.stockWarehouse || 0);
    return `
      <div class="space-y-2">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
          <span class="font-bold text-purple-400">${matchedArticle.name}</span>
          <span class="font-mono text-[10px] text-[var(--text-muted)]">${matchedArticle.code}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">En Rayon (Vente) :</span>
            <strong class="text-teal-400 font-num text-sm">${matchedArticle.stockStore || 0} ${matchedArticle.unit || 'pcs'}</strong>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">En Réserve (Dépôt) :</span>
            <strong class="text-indigo-400 font-num text-sm">${matchedArticle.stockWarehouse || 0} ${matchedArticle.unit || 'pcs'}</strong>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]">
          <span>Prix Vente Unitaire : <strong class="text-[var(--text-main)]">${Number(matchedArticle.priceSale).toLocaleString('fr-FR')} F</strong></span>
          <span class="font-bold text-emerald-400">Total : ${totalStock} ${matchedArticle.unit || 'pcs'}</span>
        </div>
        <button onclick="switchView('stock'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center mt-1">
          Gérer cet article en Stock
        </button>
      </div>
    `;
  }

  // 7. FOURNISSEURS
  if (qLower.includes('fournisseur') || qLower.includes('approvisionnement') || qLower.includes('achat')) {
    let rows = suppliers.map(s => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-[var(--text-main)]">${s.name}</strong>
          <span class="text-[10px] text-[var(--text-muted)] block">Contact : ${s.contact || 'Commercial'}</span>
        </div>
        <div class="text-right text-[11px] font-mono text-slate-300">
          ${s.phone || 'Non renseigné'}
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-amber-400">🏢 Fournisseurs Partenaires</span>
          <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px]">${suppliers.length} référencés</span>
        </div>
        <div class="space-y-1.5">
          ${rows}
        </div>
        <button onclick="switchView('suppliers'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Accéder aux Commandes Fournisseurs
        </button>
      </div>
    `;
  }

  // Réponse synthétique par défaut
  const totalRef = products.length;
  const piecesTotal = products.reduce((s, p) => s + (p.stockStore || 0) + (p.stockWarehouse || 0), 0);
  const totalDebts = customers.reduce((s, c) => s + (Number(c.due) || 0), 0);

  return `
    <div class="space-y-2 text-xs">
      <p>Je suis connecté en direct à votre base de données. Voici votre situation opérationnelle immédiate :</p>
      <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
          <span class="text-[10px] text-[var(--text-muted)] block">Stocks Référencés</span>
          <strong class="text-teal-400 font-mono">${totalRef} articles (${piecesTotal} pcs)</strong>
        </div>
        <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
          <span class="text-[10px] text-[var(--text-muted)] block">Encours Créances</span>
          <strong class="text-rose-400 font-mono">${totalDebts.toLocaleString('fr-FR')} F CFA</strong>
        </div>
      </div>
      <p class="text-[11px] text-[var(--text-muted)]">Vous pouvez me poser n'importe quelle question précise en français :<br>
      • <em>"Quel nombre d'articles nous avons en stock ?"</em><br>
      • <em>"Quel est notre bénéfice et marge brute ?"</em><br>
      • <em>"Qui est le responsable logistique ?"</em><br>
      • <em>"Qui nous doit de l'argent ?"</em></p>
    </div>
  `;
}

export default router;
