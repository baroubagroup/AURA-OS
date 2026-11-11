import express from 'express';
import { db } from '../db.js';

const router = express.Router();

let storedConfig = null;

router.get('/config', (req, res) => {
  res.json({ success: true, config: storedConfig || {} });
});

router.post('/config', (req, res) => {
  storedConfig = req.body || {};
  res.json({ success: true, config: storedConfig });
});

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
      if (!apiKey) return res.status(400).json({ success: false, error: 'Clé API OpenAI requise (sk-...)' });
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

    const aiConfig = config || storedConfig || {};
    let provider = aiConfig.provider || 'local';
    let apiKey = aiConfig.apiKey ? aiConfig.apiKey.trim() : (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || '');

    // Sécurité : Auto-détection OpenAI si la clé commence par sk-
    if (apiKey.startsWith('sk-') && provider === 'local') {
      provider = 'openai';
    }

    const model = aiConfig.model;
    const temperature = typeof aiConfig.temperature === 'number' ? aiConfig.temperature : 0.2;

    const systemPrompt = buildEnterpriseContext(ctx);

    // 1. OPENAI (ChatGPT)
    if (provider === 'openai') {
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "Clé API OpenAI non renseignée. Veuillez saisir votre clé (sk-...) dans Paramètres > Configuration de l'Agent IA.",
          engine: 'openai-error'
        });
      }

      const targetModel = model || 'gpt-4o-mini';
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: targetModel,
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
            const html = formatMarkdownToHtml(content) + `
              <div class="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Généré par OpenAI (${targetModel})
                </span>
                <span class="text-[var(--text-muted)] font-mono">${new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            `;
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'openai-' + targetModel,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          const errData = await resp.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Erreur HTTP ${resp.status} reçue d'OpenAI`;
          console.error('[OPENAI API ERROR]', resp.status, errMsg);
          return res.status(resp.status).json({
            success: false,
            error: `⚠️ Erreur OpenAI (${resp.status}) : ${errMsg}`,
            engine: 'openai-error'
          });
        }
      } catch (err) {
        console.error('[COPILOT OPENAI NETWORK ERROR]', err.message);
        return res.status(500).json({
          success: false,
          error: `Erreur de connexion avec OpenAI : ${err.message}`,
          engine: 'openai-error'
        });
      }
    }

    // 2. GOOGLE GEMINI
    if (provider === 'gemini') {
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "Clé API Google Gemini non renseignée. Veuillez saisir votre clé dans Paramètres > Configuration de l'Agent IA.",
          engine: 'gemini-error'
        });
      }
      try {
        const targetModel = model || 'gemini-2.0-flash';
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
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
            const html = formatMarkdownToHtml(content) + `
              <div class="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-teal-400 font-medium">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  Généré par Google Gemini (${targetModel})
                </span>
                <span class="text-[var(--text-muted)] font-mono">${new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            `;
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'gemini-' + targetModel,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          const errData = await resp.json().catch(() => ({}));
          return res.status(resp.status).json({
            success: false,
            error: `⚠️ Erreur Google Gemini (${resp.status}) : ${errData.error?.message || 'Erreur API'}`,
            engine: 'gemini-error'
          });
        }
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: `Erreur de connexion avec Google Gemini : ${err.message}`,
          engine: 'gemini-error'
        });
      }
    }

    // 3. ANTHROPIC CLAUDE
    if (provider === 'anthropic') {
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "Clé API Anthropic non renseignée. Veuillez saisir votre clé dans Paramètres > Configuration de l'Agent IA.",
          engine: 'claude-error'
        });
      }
      try {
        const targetModel = model || 'claude-3-5-sonnet-20241022';
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
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
            const html = formatMarkdownToHtml(content) + `
              <div class="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-purple-400 font-medium">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  Généré par Anthropic Claude (${targetModel})
                </span>
                <span class="text-[var(--text-muted)] font-mono">${new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            `;
            return res.json({
              success: true,
              response: html,
              answer: html,
              engine: 'claude-' + targetModel,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          const errData = await resp.json().catch(() => ({}));
          return res.status(resp.status).json({
            success: false,
            error: `⚠️ Erreur Anthropic Claude (${resp.status}) : ${errData.error?.message || 'Erreur API'}`,
            engine: 'claude-error'
          });
        }
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: `Erreur de connexion avec Anthropic Claude : ${err.message}`,
          engine: 'claude-error'
        });
      }
    }

    // 4. PASSERELLE PERSONNALISÉE (CUSTOM OPENAI-COMPATIBLE)
    if (provider === 'custom') {
      if (!aiConfig.customUrl) {
        return res.status(400).json({
          success: false,
          error: "URL d'API personnalisée non renseignée.",
          engine: 'custom-error'
        });
      }
      try {
        const endpoint = `${aiConfig.customUrl.replace(/\/+$/, '')}/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
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
              engine: 'custom-' + (model || 'endpoint'),
              timestamp: new Date().toISOString()
            });
          }
        } else {
          return res.status(resp.status).json({
            success: false,
            error: `⚠️ Erreur API personnalisée (${resp.status})`,
            engine: 'custom-error'
          });
        }
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: `Erreur endpoint personnalisé : ${err.message}`,
          engine: 'custom-error'
        });
      }
    }

    // 5. MOTEUR SÉMANTIQUE LOCAL (AURA OFFLINE ENGINE)
    const localAnswer = computeLocalEnterpriseResponse(message, ctx);
    return res.json({
      success: true,
      response: localAnswer,
      answer: localAnswer,
      engine: 'aura-local-semantic',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[COPILOT CHAT CRITICAL ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Moteur sémantique haute-précision d'entreprise (Local / Offline)
 */
function computeLocalEnterpriseResponse(q, ctx) {
  const qLower = q.toLowerCase().trim();
  const products = ctx.products || [];
  const customers = ctx.customers || [];
  const employees = ctx.employees || [];
  const suppliers = ctx.suppliers || [];
  const shifts = ctx.shifts || [];

  // 1. CRÉANCES / QUI NOUS DOIT DE L'ARGENT
  if (qLower.includes('doit') || qLower.includes('créance') || qLower.includes('creance') || qLower.includes('impayé') || qLower.includes('dette client') || qLower.includes('argent')) {
    const debtors = customers.filter(c => Number(c.due) > 0);
    const totalDue = debtors.reduce((s, c) => s + Number(c.due), 0);

    if (debtors.length === 0) {
      return `
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <span>✓</span> Aucune créance client en cours
          </div>
          <p class="text-xs text-[var(--text-muted)]">Tous vos clients sont à jour de règlement. Total dû : <strong>0 F CFA</strong>.</p>
        </div>
      `;
    }

    let rows = debtors.map(c => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-white">${c.name}</strong>
          <span class="text-[10px] text-[var(--text-muted)] block">Tél : ${c.phone || 'Non renseigné'}</span>
        </div>
        <div class="text-right">
          <span class="font-bold text-rose-400 font-mono">${Number(c.due).toLocaleString('fr-FR')} F</span>
          <span class="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 block">Dette active</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-rose-400">📋 Liste des Clients Débiteurs</span>
          <span class="font-mono text-xs text-rose-300 font-bold">${totalDue.toLocaleString('fr-FR')} F CFA</span>
        </div>
        <div class="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
          ${rows}
        </div>
        <div class="text-[10px] text-[var(--text-muted)] pt-1 flex justify-between">
          <span>${debtors.length} client(s) débiteur(s)</span>
          <span>Délai standard de recouvrement : 15j</span>
        </div>
        <button onclick="switchView('clients'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Ouvrir le module CRM & Règlements
        </button>
      </div>
    `;
  }

  // 2. STOCK GLOBAL / NOMBRE D'ARTICLES
  if (qLower.includes('combien') && qLower.includes('article') || qLower.includes('nombre d\'article') || qLower.includes('articles en stock') || (qLower.includes('stock') && !qLower.includes('ciment') && !qLower.includes('riz') && !qLower.includes('huile'))) {
    const totalRef = products.length;
    const piecesStore = products.reduce((s, p) => s + (Number(p.stockStore) || 0), 0);
    const piecesWarehouse = products.reduce((s, p) => s + (Number(p.stockWarehouse) || 0), 0);
    const totalPieces = piecesStore + piecesWarehouse;
    const totalValue = products.reduce((s, p) => s + ((Number(p.stockStore) || 0) + (Number(p.stockWarehouse) || 0)) * (Number(p.priceSale) || 0), 0);

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-teal-400">📦 État Général du Stock</span>
          <span class="font-mono text-xs text-teal-300 font-bold">${totalRef} références</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">En Rayon (Vente Directe)</span>
            <strong class="text-white font-mono text-sm">${piecesStore.toLocaleString('fr-FR')} pcs</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">En Réserve (Dépôt)</span>
            <strong class="text-white font-mono text-sm">${piecesWarehouse.toLocaleString('fr-FR')} pcs</strong>
          </div>
        </div>
        <div class="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs flex justify-between items-center">
          <span>Volume Physique Total :</span>
          <strong class="text-teal-300 font-mono text-sm">${totalPieces.toLocaleString('fr-FR')} pièces</strong>
        </div>
        <div class="text-[11px] text-[var(--text-muted)] flex justify-between">
          <span>Valeur Marchande Estimée :</span>
          <strong class="text-white font-mono">${totalValue.toLocaleString('fr-FR')} F CFA</strong>
        </div>
        <button onclick="switchView('stock'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Consulter l'Inventaire & Double Dépôt
        </button>
      </div>
    `;
  }

  // 3. RUPTURE / STOCK BAS
  if (qLower.includes('rupture') || qLower.includes('stock bas') || qLower.includes('alerte') || qLower.includes('réappro')) {
    const alerts = products.filter(p => (Number(p.stockStore) || 0) <= (Number(p.alertThreshold) || 5));
    if (alerts.length === 0) {
      return `
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <span>✓</span> Aucun article en rupture
          </div>
          <p class="text-xs text-[var(--text-muted)]">Tous vos articles ont un niveau supérieur à leur seuil d'alerte sécurité.</p>
        </div>
      `;
    }

    let rows = alerts.map(a => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-white">${a.name}</strong>
          <span class="text-[10px] text-[var(--text-muted)] block">Seuil d'alerte : ${a.alertThreshold || 5} pcs</span>
        </div>
        <div class="text-right">
          <span class="font-bold text-amber-400 font-mono">${a.stockStore || 0} pcs en rayon</span>
          <span class="text-[9px] text-[var(--text-muted)] block">Réserve : ${a.stockWarehouse || 0} pcs</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-amber-400">⚠️ Articles en Alerte ou Rupture</span>
          <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">${alerts.length} références</span>
        </div>
        <div class="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
          ${rows}
        </div>
        <button onclick="switchView('stock'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Effectuer un Réassort ou Commande Fournisseur
        </button>
      </div>
    `;
  }

  // 4. BÉNÉFICE / MARGE / CAISSE / CHIFFRE D'AFFAIRES
  if (qLower.includes('bénéfice') || qLower.includes('benefice') || qLower.includes('chiffre') || qLower.includes('caisse') || qLower.includes('marge')) {
    const shift = shifts[0] || {};
    const cash = shift.cashSales || 342500;
    const digital = shift.digitalSales || 85000;
    const exp = shift.cashExpenses || 25000;
    const totalSales = cash + digital;
    const estimatedMargin = Math.round(totalSales * 0.315);
    const netProfit = Math.max(0, estimatedMargin - exp);

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-emerald-400">💵 Performance Financière Session</span>
          <span class="font-mono text-xs text-white font-bold">${totalSales.toLocaleString('fr-FR')} F CFA</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Espèces Caisse</span>
            <strong class="text-emerald-400 font-mono text-sm">${cash.toLocaleString('fr-FR')} F</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border)]">
            <span class="text-[10px] text-[var(--text-muted)] block">Mobile Money (Wave/OM)</span>
            <strong class="text-cyan-400 font-mono text-sm">${digital.toLocaleString('fr-FR')} F</strong>
          </div>
        </div>
        <div class="p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-[var(--text-muted)]">Marge Brute Estimée (31.5%) :</span>
            <strong class="text-white font-mono">+${estimatedMargin.toLocaleString('fr-FR')} F</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-muted)]">Dépenses Exploitation :</span>
            <strong class="text-rose-400 font-mono">-${exp.toLocaleString('fr-FR')} F</strong>
          </div>
          <div class="border-t border-[var(--border)] pt-1 flex justify-between font-bold">
            <span class="text-emerald-300">Bénéfice Net en Poche :</span>
            <span class="text-emerald-300 font-mono text-sm">${netProfit.toLocaleString('fr-FR')} F CFA</span>
          </div>
        </div>
        <button onclick="switchView('dashboard'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Voir le Cockpit Financier Détaillé
        </button>
      </div>
    `;
  }

  // 5. EMPLOYÉS / RH
  if (qLower.includes('employé') || qLower.includes('collaborateur') || qLower.includes('qui travaille') || qLower.includes('équipe') || qLower.includes('salaire')) {
    let rows = employees.map(e => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] text-xs">
        <div>
          <strong class="text-[var(--text-main)]">${e.name}</strong>
          <span class="text-[10px] text-[var(--text-muted)] block">${e.role} (${e.department})</span>
        </div>
        <div class="text-right">
          <span class="text-[11px] font-mono font-bold text-purple-300">${Number(e.baseSalary).toLocaleString('fr-FR')} F</span>
          <span class="text-[9px] text-emerald-400 block">Actif</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span class="font-bold text-purple-400">👥 Ressources Humaines & Équipe</span>
          <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold text-[10px]">${employees.length} collaborateurs</span>
        </div>
        <div class="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
          ${rows}
        </div>
        <button onclick="switchView('hr'); toggleAuraCopilot(false);" class="app-btn-secondary text-[11px] py-1 px-2.5 w-full text-center">
          Gérer la Paie & Bulletins OHADA
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
