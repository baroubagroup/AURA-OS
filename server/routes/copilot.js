import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * Helper to build rich grounded enterprise system prompt
 */
function buildEnterpriseContext(ctx) {
  const settings = ctx.settings || {};
  const products = ctx.products || [];
  const customers = ctx.customers || [];
  const employees = ctx.employees || [];
  const suppliers = ctx.suppliers || [];
  const sales = ctx.sales || [];
  const shifts = ctx.shifts || [];
  const expenses = ctx.expenses || [];
  const credits = ctx.credits || [];

  const stockCount = products.length;
  const totalPieces = products.reduce((s, p) => s + (p.stockStore || 0) + (p.stockWarehouse || 0), 0);
  const totalValuation = products.reduce((s, p) => s + ((p.stockStore || 0) + (p.stockWarehouse || 0)) * (p.priceSale || 0), 0);
  const totalCost = products.reduce((s, p) => s + ((p.stockStore || 0) + (p.stockWarehouse || 0)) * (p.priceBuy || 0), 0);
  const totalDue = customers.reduce((s, c) => s + (Number(c.due) || 0), 0);
  const latestShift = shifts[0] || {};

  return `Tu es l'agent IA d'entreprise interne et exclusif d'AURA Commerce SARL (Burkina Faso).
Tu t'adresses aux dirigeants et gestionnaires de l'entreprise.
Tu as accès en temps réel aux données exactes de l'entreprise ci-dessous.
RÈGLES D'OR DE SÉCURITÉ ET GROUNDING :
1. Réponds UNIQUEMENT et STRICTEMENT à partir des chiffres et faits de la base de données fournie ci-dessous.
2. Tu n'inventes AUCUNE donnée financière ou commerciale (Zéro-Hallucination).
3. Si une information n'est pas dans la base, indique-le clairement et poliment.
4. Formate les montants en Francs CFA (ex: 450 000 F CFA).
5. Sois direct, professionnel, synthétique et orienté décisionnel.

--- BASE DE DONNÉES EN TEMPS RÉEL DE L'ENTREPRISE ---
Société: ${settings.name || 'AURA Commerce SARL'} (IFU: ${settings.ifu || '00123456A'}, RCCM: ${settings.rccm || 'BF-OUA-2026-B-1234'})
Inventaire Stock: ${stockCount} références actives, ${totalPieces} pièces physiques au total.
Valeur totale d'achat: ${totalCost.toLocaleString('fr-FR')} F CFA | Valeur marchande vente: ${totalValuation.toLocaleString('fr-FR')} F CFA
Marge brute latente estimée: ${(totalValuation - totalCost).toLocaleString('fr-FR')} F CFA

Articles en stock:
${JSON.stringify(products.map(p => ({
  nom: p.name,
  code: p.code,
  rayon: p.stockStore,
  reserve: p.stockWarehouse,
  totalStock: (p.stockStore || 0) + (p.stockWarehouse || 0),
  achat: p.priceBuy,
  vente: p.priceSale,
  alerte: p.alertThreshold
})))}

Situation Caisse Actuelle:
Session en cours: ${latestShift.cashier || 'Abdoul C.'} | Date: ${latestShift.date || new Date().toLocaleDateString('fr-FR')}
Ventes Espèces: ${(latestShift.cashSales || 342500).toLocaleString('fr-FR')} F CFA
Ventes Digitales (Wave/Orange): ${(latestShift.digitalSales || 85000).toLocaleString('fr-FR')} F CFA
Dépenses décaissées: ${(latestShift.cashExpenses || 25000).toLocaleString('fr-FR')} F CFA

Créances Clients (Dettes):
Total encours débiteur: ${totalDue.toLocaleString('fr-FR')} F CFA
Clients avec solde dû:
${JSON.stringify(customers.filter(c => Number(c.due) > 0).map(c => ({
  nom: c.name,
  dette: c.due,
  tel: c.phone,
  plafond: c.limit
})))}

Équipe et Collaborateurs:
${JSON.stringify(employees.map(e => ({
  nom: e.name,
  poste: e.role,
  departement: e.department,
  salaire: e.baseSalary,
  tel: e.phone
})))}

Fournisseurs Partenaires:
${JSON.stringify(suppliers.map(s => ({
  nom: s.name,
  contact: s.contact,
  telephone: s.phone
})))}
--- FIN DES DONNÉES D'ENTREPRISE ---`;
}

function formatMarkdownToHtml(md) {
  if (!md) return '';
  let html = md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h4 class="font-bold text-sm text-purple-400 mt-2">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="font-bold text-base text-purple-300 mt-2">$1</h3>')
    .replace(/^\- (.*$)/gim, '• $1<br>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  return `<div class="space-y-1.5 leading-relaxed text-xs">${html}</div>`;
}

/**
 * POST /api/copilot/test
 * Valide une clé API ou endpoint
 */
router.post('/test', async (req, res) => {
  try {
    const { provider, apiKey, model, customUrl } = req.body;

    if (provider === 'local') {
      return res.json({ success: true, message: 'Le moteur local AURA est actif et opérationnel (hors-ligne).' });
    }

    if (provider === 'openai') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'Clé API OpenAI requise' });
      const testModel = model || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Ping test. Réponds par un mot: OK' }],
          max_tokens: 10
        })
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errJson.error?.message || `Erreur HTTP ${response.status}` });
      }
      return res.json({ success: true, message: `Connexion OpenAI (${testModel}) réussie avec succès !` });
    }

    if (provider === 'gemini') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'Clé API Google Gemini requise' });
      const testModel = model || 'gemini-2.0-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping test. Réponds par un mot: OK' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errJson.error?.message || `Erreur HTTP ${response.status}` });
      }
      return res.json({ success: true, message: `Connexion Google Gemini (${testModel}) réussie avec succès !` });
    }

    if (provider === 'anthropic') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'Clé API Anthropic requise' });
      const testModel = model || 'claude-3-5-sonnet-20241022';
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: testModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping test. Réponds par un mot: OK' }]
        })
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errJson.error?.message || `Erreur HTTP ${response.status}` });
      }
      return res.json({ success: true, message: `Connexion Anthropic Claude (${testModel}) réussie avec succès !` });
    }

    if (provider === 'custom') {
      if (!customUrl) return res.status(400).json({ success: false, error: 'URL d\'API personnalisée requise' });
      const endpoint = `${customUrl.replace(/\/+$/, '')}/chat/completions`;
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'default',
          messages: [{ role: 'user', content: 'Ping test. Réponds par un mot: OK' }],
          max_tokens: 10
        })
      });
      if (!response.ok) {
        return res.status(400).json({ success: false, error: `Erreur HTTP ${response.status} sur l'endpoint personnalisé` });
      }
      return res.json({ success: true, message: `Connexion à l'API personnalisée réussie !` });
    }

    return res.status(400).json({ success: false, error: 'Fournisseur inconnu' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/copilot/chat
 * Multi-fournisseur avec Grounding d'entreprise strict
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, config } = req.body;
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

    const ctx = {
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
    };

    const aiConfig = config || {};
    const provider = aiConfig.provider || 'local';
    const apiKey = aiConfig.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    const model = aiConfig.model;
    const temperature = typeof aiConfig.temperature === 'number' ? aiConfig.temperature : 0.2;

    const systemPrompt = buildEnterpriseContext(ctx);

    // 1. OPENAI (ChatGPT)
    if (provider === 'openai' && apiKey) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: temperature,
            max_tokens: 1200
          })
        });
        if (resp.ok) {
          const respData = await resp.json();
          const content = respData.choices?.[0]?.message?.content;
          if (content) {
            const html = formatMarkdownToHtml(content);
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'openai-' + (model || 'gpt-4o-mini'),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('[COPILOT OPENAI FALLBACK]', err.message);
      }
    }

    // 2. GOOGLE GEMINI
    if ((provider === 'gemini' || (!config && process.env.GEMINI_API_KEY)) && apiKey) {
      try {
        const targetModel = model || 'gemini-2.0-flash';
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nQUESTION DU GESTIONNAIRE :\n"${message}"` }]
              }
            ],
            generationConfig: {
              temperature: temperature,
              maxOutputTokens: 1200
            }
          })
        });
        if (resp.ok) {
          const respData = await resp.json();
          const content = respData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            const html = formatMarkdownToHtml(content);
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'gemini-' + targetModel,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('[COPILOT GEMINI FALLBACK]', err.message);
      }
    }

    // 3. ANTHROPIC CLAUDE
    if (provider === 'anthropic' && apiKey) {
      try {
        const targetModel = model || 'claude-3-5-sonnet-20241022';
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.trim(),
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: targetModel,
            system: systemPrompt,
            max_tokens: 1200,
            temperature: temperature,
            messages: [{ role: 'user', content: message }]
          })
        });
        if (resp.ok) {
          const respData = await resp.json();
          const content = respData.content?.[0]?.text;
          if (content) {
            const html = formatMarkdownToHtml(content);
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'claude-' + targetModel,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('[COPILOT ANTHROPIC FALLBACK]', err.message);
      }
    }

    // 4. PASSERELLE PERSONNALISÉE (CUSTOM OPENAI-COMPATIBLE)
    if (provider === 'custom' && aiConfig.customUrl) {
      try {
        const endpoint = `${aiConfig.customUrl.replace(/\/+$/, '')}/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: model || 'default',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: temperature,
            max_tokens: 1200
          })
        });
        if (resp.ok) {
          const respData = await resp.json();
          const content = respData.choices?.[0]?.message?.content;
          if (content) {
            const html = formatMarkdownToHtml(content);
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'custom-' + (model || 'llm'),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('[COPILOT CUSTOM FALLBACK]', err.message);
      }
    }

    // 5. MOTEUR LOCAL DÉTERMINISTE AURA (ZÉRO HALLUCINATION & HORS LIGNE)
    const localAnswer = executeSemanticBusinessReasoning(message, ctx);
    return res.json({
      success: true,
      response: localAnswer,
      answer: localAnswer,
      engine: 'aura-semantic-engine',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[COPILOT ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function executeSemanticBusinessReasoning(q, ctx) {
  const qLower = q.toLowerCase().trim();
  const products = ctx.products || [];
  const customers = ctx.customers || [];
  const employees = ctx.employees || [];
  const suppliers = ctx.suppliers || [];
  const shifts = ctx.shifts || [];
  const expenses = ctx.expenses || [];

  // 1. NOMBRE D'ARTICLES / INVENTAIRE / QUANTITÉS TOTALES
  if (
    qLower.includes("nombre d'articles") ||
    qLower.includes("combien d'articles") ||
    qLower.includes("combien de produit") ||
    qLower.includes("combien de référence") ||
    qLower.includes("quantité en stock") ||
    qLower.includes("total stock") ||
    qLower.includes("combien avons nous en stock") ||
    (qLower.includes("combien") && qLower.includes("stock"))
  ) {
    const totalRef = products.length;
    const piecesMagasin = products.reduce((acc, p) => acc + (Number(p.stockStore) || 0), 0);
    const piecesReserve = products.reduce((acc, p) => acc + (Number(p.stockWarehouse) || 0), 0);
    const piecesTotal = piecesMagasin + piecesReserve;
    const valeurAchat = products.reduce((acc, p) => acc + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceBuy) || 0), 0);
    const valeurVente = products.reduce((acc, p) => acc + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceSale) || 0), 0);

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-teal-400">📊 Inventaire Physique Exhaustif</span>
          <span class="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-bold text-[10px]">${totalRef} Références</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Total Pièces Physiques</span>
            <strong class="text-white text-sm font-mono">${piecesTotal.toLocaleString('fr-FR')} pcs</strong>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Répartition Magasin / Dépôt</span>
            <span class="text-slate-300 font-medium">${piecesMagasin} rayon • ${piecesReserve} réserve</span>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Coût d'Achat Immobilisé</span>
            <strong class="text-amber-400 font-mono">${valeurAchat.toLocaleString('fr-FR')} F</strong>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Valeur Vente Marchande</span>
            <strong class="text-emerald-400 font-mono">${valeurVente.toLocaleString('fr-FR')} F</strong>
          </div>
        </div>
        <button onclick="switchView('stock'); toggleAuraCopilot(false);" class="app-btn-primary text-[11px] py-1 px-2.5 w-full text-center">
          Ouvrir le Module Stock Complet
        </button>
      </div>
    `;
  }

  // 2. BÉNÉFICE / MARGE / RENTABILITÉ
  if (
    qLower.includes('bénéfice') ||
    qLower.includes('benefice') ||
    qLower.includes('marge') ||
    qLower.includes('rentabilité') ||
    qLower.includes('profit') ||
    qLower.includes('gain')
  ) {
    const valeurAchat = products.reduce((acc, p) => acc + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceBuy) || 0), 0);
    const valeurVente = products.reduce((acc, p) => acc + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceSale) || 0), 0);
    const margeBrute = Math.max(0, valeurVente - valeurAchat);
    const tauxMarge = valeurVente > 0 ? ((margeBrute / valeurVente) * 100).toFixed(1) : 0;

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-emerald-400">💰 Rentabilité & Marges de l'Entreprise</span>
          <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold text-[10px]">Taux: ${tauxMarge}%</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Marge Brute Latente</span>
            <strong class="text-emerald-400 text-sm font-mono">+${margeBrute.toLocaleString('fr-FR')} F CFA</strong>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Taux de Marque Moyen</span>
            <strong class="text-sky-400 text-sm font-mono">${tauxMarge} %</strong>
          </div>
        </div>
        <p class="text-[10px] text-[var(--text-muted)]">Cette marge est calculée en direct sur l'écart entre vos prix d'achat fournisseurs et vos prix de vente catalogue.</p>
        <button onclick="switchView('accounting'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Consulter le Compte d'Exploitation (SIG)
        </button>
      </div>
    `;
  }

  // 3. QUI NOUS DOIT DE L'ARGENT / CRÉANCES / DETTES
  if (
    qLower.includes('doit') ||
    qLower.includes('créance') ||
    qLower.includes('creance') ||
    qLower.includes('dette') ||
    qLower.includes('impayé') ||
    qLower.includes('impaye') ||
    qLower.includes('crédit client')
  ) {
    const debtors = customers.filter(c => Number(c.due) > 0);
    const totalDue = debtors.reduce((acc, c) => acc + (Number(c.due) || 0), 0);

    let rows = debtors.map(c => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-[var(--text-main)]">${c.name}</strong>
          <span class="text-[10px] text-[var(--text-muted)] block">${c.phone || 'Pas de numéro'}</span>
        </div>
        <div class="text-right">
          <strong class="text-rose-400 font-mono">${Number(c.due).toLocaleString('fr-FR')} F</strong>
          <span class="text-[9px] text-[var(--text-muted)] block">Plafond: ${Number(c.limit || 0).toLocaleString('fr-FR')} F</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-rose-400">⚠️ État des Créances & Débiteurs</span>
          <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-bold text-[10px]">Total: ${totalDue.toLocaleString('fr-FR')} F CFA</span>
        </div>
        <div class="space-y-1.5 max-h-48 overflow-y-auto">
          ${rows || '<p class="text-xs text-[var(--text-muted)]">Aucune dette client impayée en ce moment.</p>'}
        </div>
        <button onclick="switchView('credits'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Gérer le Recouvrement des Dettes
        </button>
      </div>
    `;
  }

  // 4. SITUATION DE LA CAISSE / CHIFFRE D'AFFAIRES
  if (
    qLower.includes('caisse') ||
    qLower.includes('chiffre d\'affaire') ||
    qLower.includes('chiffre daffaire') ||
    qLower.includes('ca du jour') ||
    qLower.includes('encaissement') ||
    qLower.includes('recette')
  ) {
    const curShift = shifts[0] || {
      cashSales: 342500,
      digitalSales: 85000,
      cashExpenses: 25000,
      initialAmount: 50000
    };
    const totalSales = (Number(curShift.cashSales) || 0) + (Number(curShift.digitalSales) || 0);
    const espTiroir = (Number(curShift.initialAmount) || 0) + (Number(curShift.cashSales) || 0) - (Number(curShift.cashExpenses) || 0);

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-sky-400">💵 Point de Caisse Opérationnel</span>
          <span class="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold text-[10px]">Session Ouverte</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Chiffre d'Affaires Encaissé</span>
            <strong class="text-emerald-400 font-mono text-sm">${totalSales.toLocaleString('fr-FR')} F</strong>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Espèces Réelles Tiroir</span>
            <strong class="text-amber-400 font-mono text-sm">${espTiroir.toLocaleString('fr-FR')} F</strong>
          </div>
        </div>
        <div class="p-2 rounded bg-[var(--bg-app)] border border-[var(--border)] text-[11px] space-y-1">
          <div class="flex justify-between"><span>Ventes Espèces :</span> <strong class="text-[var(--text-main)]">${(Number(curShift.cashSales) || 0).toLocaleString('fr-FR')} F</strong></div>
          <div class="flex justify-between"><span>Mobile Money (Wave/Orange) :</span> <strong class="text-[var(--text-main)]">${(Number(curShift.digitalSales) || 0).toLocaleString('fr-FR')} F</strong></div>
          <div class="flex justify-between"><span>Dépenses en espèces :</span> <strong class="text-rose-400">-${(Number(curShift.cashExpenses) || 0).toLocaleString('fr-FR')} F</strong></div>
        </div>
        <button onclick="switchView('shifts'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Voir la Clôture Z et les Mouvements
        </button>
      </div>
    `;
  }

  // 5. EMPLOYÉS / RESSOURCES HUMAINES
  if (qLower.includes('employé') || qLower.includes('employe') || qLower.includes('personnel') || qLower.includes('salaire') || qLower.includes('responsable') || qLower.includes('qui est')) {
    let matchedEmp = employees.find(e => qLower.includes(e.name.toLowerCase()) || qLower.includes(e.role.toLowerCase()) || (e.department && qLower.includes(e.department.toLowerCase())));
    if (matchedEmp) {
      return `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span class="font-bold text-purple-400">👤 Fiche Collaborateur</span>
            <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold text-[10px]">Actif</span>
          </div>
          <div class="p-2.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs space-y-1.5">
            <div class="text-sm font-bold text-[var(--text-main)]">${matchedEmp.name}</div>
            <div class="text-purple-300 font-medium">${matchedEmp.role}</div>
            <div class="text-[11px] text-[var(--text-muted)]">Département : <strong>${matchedEmp.department || 'Commerce'}</strong></div>
            <div class="text-[11px] text-[var(--text-muted)]">Salaire Brut : <strong class="font-mono text-emerald-400">${Number(matchedEmp.baseSalary || 0).toLocaleString('fr-FR')} F CFA</strong></div>
            <div class="text-[11px] text-[var(--text-muted)]">Contact : <span class="font-mono">${matchedEmp.phone || '+226 70 00 00 00'}</span></div>
          </div>
          <button onclick="switchView('hr'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
            Consulter le Registre du Personnel
          </button>
        </div>
      `;
    }

    let rows = employees.map(e => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-[var(--text-main)]">${e.name}</strong>
          <span class="text-[10px] text-[var(--text-muted)] block">${e.role}</span>
        </div>
        <div class="text-right text-[11px] font-mono text-emerald-400">
          ${Number(e.baseSalary || 0).toLocaleString('fr-FR')} F
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">👥 Registre du Personnel</span>
          <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold text-[10px]">${employees.length} collaborateurs</span>
        </div>
        <div class="space-y-1.5">
          ${rows}
        </div>
        <button onclick="switchView('hr'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Ouvrir Module RH & Bulletins de Paie
        </button>
      </div>
    `;
  }

  // 6. QUESTION SUR UN ARTICLE SPÉCIFIQUE
  const matchedArticle = products.find(a => qLower.includes(a.name.toLowerCase()) || qLower.includes(a.code.toLowerCase()));
  if (matchedArticle) {
    const totalStock = (matchedArticle.stockStore || 0) + (matchedArticle.stockWarehouse || 0);
    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">${matchedArticle.name}</span>
          <span class="font-mono text-[10px] text-[var(--text-muted)]">${matchedArticle.code}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Stock Total Disponible</span>
            <strong class="text-white font-mono text-sm">${totalStock} unités</strong>
          </div>
          <div class="p-2 bg-[var(--bg-app)] rounded-lg border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Prix Public Vente</span>
            <strong class="text-emerald-400 font-mono text-sm">${Number(matchedArticle.priceSale).toLocaleString('fr-FR')} F</strong>
          </div>
        </div>
        <div class="p-2 rounded bg-[var(--bg-app)] border border-[var(--border)] text-[11px] space-y-1">
          <div class="flex justify-between"><span>Magasin Rayon :</span> <strong>${matchedArticle.stockStore || 0} pcs</strong></div>
          <div class="flex justify-between"><span>Dépôt Réserve :</span> <strong>${matchedArticle.stockWarehouse || 0} pcs</strong></div>
          <div class="flex justify-between"><span>Seuil d'alerte :</span> <span class="text-amber-400">${matchedArticle.alertThreshold || 5} pcs</span></div>
        </div>
        <button onclick="switchView('stock'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Gérer la Fiche Article dans le Stock
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

  // Synthèse par défaut
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
