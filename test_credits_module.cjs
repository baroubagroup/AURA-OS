const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('=== TEST SUITE: MODULE 4 (view-credits: Créances & Recouvrement) ===');

const html = fs.readFileSync('aura-pos/index.html', 'utf8');

// Extract all DOM IDs from HTML
const allIds = new Set();
const idRegex = /\bid=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(html)) !== null) {
  allIds.add(m[1]);
}

const elements = new Map();

function createElement(id = '', tag = 'div') {
  const classes = new Set();
  const children = [];
  const el = {
    id: id,
    tagName: tag.toUpperCase(),
    dataset: {},
    classList: {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      contains: (c) => classes.has(c),
      toggle: (c) => classes.has(c) ? classes.delete(c) : classes.add(c),
      toString: () => Array.from(classes).join(' ')
    },
    style: {},
    children: children,
    options: [],
    selectedIndex: 0,
    value: '',
    checked: true,
    _innerHTML: '',
    _innerText: '',
    get innerHTML() { return this._innerHTML; },
    set innerHTML(val) {
      this._innerHTML = String(val);
      const trMatches = (this._innerHTML.match(/<tr\b/gi) || []).length;
      this.children.length = 0;
      for (let i = 0; i < trMatches; i++) {
        this.children.push({ tagName: 'TR' });
      }
    },
    get innerText() { return this._innerText || this._innerHTML.replace(/<[^>]+>/g, '').trim(); },
    set innerText(val) { this._innerText = String(val); this._innerHTML = String(val); },
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: (c) => children.push(c),
    remove: () => {},
    closest: (selector) => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  return el;
}

// Pre-create all elements found in HTML
allIds.forEach(id => {
  elements.set(id, createElement(id));
});

// Configure elements that are hidden by default in HTML
['modal-repay-credit', 'modal-new-credit', 'view-credits'].forEach(id => {
  if (elements.has(id)) {
    elements.get(id).classList.add('hidden');
  }
});

const mockDocument = {
  getElementById: (id) => {
    if (!elements.has(id)) {
      elements.set(id, createElement(id));
    }
    return elements.get(id);
  },
  createElement: (tag) => createElement('', tag),
  querySelectorAll: (selector) => {
    if (selector === '.page-view') {
      return Array.from(elements.values()).filter(e => e.id.startsWith('view-'));
    }
    if (selector === '.nav-btn') {
      return Array.from(elements.values()).filter(e => e.id.startsWith('nav-'));
    }
    return [];
  },
  querySelector: (sel) => {
    if (sel.startsWith('#')) return mockDocument.getElementById(sel.slice(1));
    return null;
  },
  body: createElement('body')
};

let lastOpenedUrl = null;
let lastPrintedHtml = null;

const mockWindow = {
  document: mockDocument,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => cb(),
  console: console,
  open: (url) => {
    lastOpenedUrl = url;
    return {
      document: {
        write: (htmlContent) => { lastPrintedHtml = htmlContent; },
        close: () => {}
      }
    };
  },
  showToast: (msg, type) => {
    // mock toast
  },
  alert: (msg) => {},
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  Date: Date,
  Math: Math,
  JSON: JSON,
  parseInt: parseInt,
  parseFloat: parseFloat,
  String: String,
  Number: Number,
  Array: Array,
  Object: Object,
  apiFetch: (url, opts) => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
};

mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);

// Extract main script
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi) || [];
const mainScript = scriptMatches[scriptMatches.length - 1]
  .replace(/<script[^>]*>/i, '')
  .replace(/<\/script>/i, '');

vm.runInContext(mainScript, context);

let passedCount = 0;
let failedCount = 0;

function testAssert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedCount++;
  }
}

console.log('--- STARTING MODULE 4 VERIFICATION CHECKS ---');

// 1. Initial Data Integrity
testAssert(Array.isArray(context.CREDITS) && context.CREDITS.length >= 3, '1.1. CREDITS collection populated with initial debts');
const initialTotalDue = context.CREDITS.reduce((sum, c) => sum + (c.due || 0), 0);
testAssert(initialTotalDue === 400000, `1.2. Initial total due equals 400 000 F CFA (calculated: ${initialTotalDue})`);
testAssert(context.window.CREDITS === context.CREDITS, '1.3. window.CREDITS is cleanly bound');

// 2. Table Rendering
context.renderCreditsTable();
const tbody = mockDocument.getElementById('credits-table-body');
testAssert(tbody.children.length === context.CREDITS.length, `2.1. credits-table-body renders all ${context.CREDITS.length} credit rows`);
testAssert(tbody.innerHTML.includes('BATI-PLUS SARL'), '2.2. credits-table-body contains BATI-PLUS SARL');
testAssert(tbody.innerHTML.includes('Hôtel Somgandé Prestige'), '2.3. credits-table-body contains Hôtel Somgandé Prestige');
testAssert(tbody.innerHTML.includes('Critique'), '2.4. Table renders Critique status badge');
testAssert(tbody.innerHTML.includes('openRepayModal'), '2.5. Table contains openRepayModal action buttons');
testAssert(tbody.innerHTML.includes('sendCreditWhatsAppReminder'), '2.6. Table contains sendCreditWhatsAppReminder action buttons');

// 3. Dynamic KPIs
context.updateCreditsKPICounters();
testAssert(mockDocument.getElementById('kpi-credits-total').innerText.includes('400'), '3.1. #kpi-credits-total formatted correctly');
testAssert(mockDocument.getElementById('kpi-credits-count').innerText.includes('3 client'), '3.2. #kpi-credits-count displays active debtor count');
testAssert(mockDocument.getElementById('kpi-credits-overdue').innerText.includes('F'), '3.3. #kpi-credits-overdue formatted correctly');
testAssert(mockDocument.getElementById('kpi-credits-recovered').innerText.includes('F'), '3.4. #kpi-credits-recovered formatted correctly');
testAssert(mockDocument.getElementById('kpi-credits-rate').innerText.includes('%'), '3.5. #kpi-credits-rate displays percentage');

// 4. Real-time Search and Filtering
context.filterCreditTable('BATI');
testAssert(tbody.children.length === 1, '4.1. filterCreditTable("BATI") filters to 1 row');
context.filterCreditTable('+226 70 88');
testAssert(tbody.children.length === 1 && tbody.innerHTML.includes('Ibrahim Ouedraogo'), '4.2. filterCreditTable filters by phone number');
context.filterCreditTable('FAC-2026-0740');
testAssert(tbody.children.length === 1 && tbody.innerHTML.includes('Hôtel Somgandé Prestige'), '4.3. filterCreditTable filters by invoice reference');
context.filterCreditTable('NONEXISTENT_CLIENT_QUERY');
testAssert(tbody.innerHTML.includes('Aucune créance'), '4.4. filterCreditTable displays empty state for zero results');
context.filterCreditTable('');
testAssert(tbody.children.length === context.CREDITS.length, '4.5. filterCreditTable("") restores all rows');

// 5. Octroi de Nouveau Crédit
context.openNewCreditModal();
const modalNewCredit = mockDocument.getElementById('modal-new-credit');
testAssert(!modalNewCredit.classList.contains('hidden'), '5.1. openNewCreditModal displays #modal-new-credit');
const clientSelect = mockDocument.getElementById('new-credit-client');
testAssert(clientSelect.children.length > 0 || clientSelect.innerHTML.includes('<option'), '5.2. #new-credit-client populated with CRM clients');

// Test validation rejection
mockDocument.getElementById('new-credit-amount').value = '0';
const prevLength = context.CREDITS.length;
context.submitNewCredit();
testAssert(context.CREDITS.length === prevLength, '5.3. submitNewCredit rejects amount <= 0');

// Test valid submission
mockDocument.getElementById('new-credit-amount').value = '250000';
mockDocument.getElementById('new-credit-ref').value = 'FAC-2026-TEST';
mockDocument.getElementById('new-credit-due').value = '2026-12-15';
mockDocument.getElementById('new-credit-notes').value = 'Caution déposée pour test';
context.submitNewCredit();
testAssert(context.CREDITS.length === prevLength + 1, '5.4. submitNewCredit prepends new credit');
const createdCredit = context.CREDITS[0];
testAssert(createdCredit.total === 250000 && createdCredit.due === 250000, '5.5. Created credit has correct total and remaining due');
testAssert(createdCredit.ref === 'FAC-2026-TEST', '5.6. Created credit ref stored');
testAssert(createdCredit.status === 'À jour', '5.7. Created credit status set to "À jour"');
testAssert(modalNewCredit.classList.contains('hidden'), '5.8. #modal-new-credit closes automatically');
testAssert(mockDocument.getElementById('kpi-credits-total').innerText.includes('650'), '5.9. #kpi-credits-total updated with new credit (400k + 250k = 650k)');

// 6. Enregistrement d'Acompte / Encaissement
const targetCredit = context.CREDITS.find(c => c.client === 'BATI-PLUS SARL');
const targetId = targetCredit.id;
context.openRepayModal(targetId);
const modalRepay = mockDocument.getElementById('modal-repay-credit');
testAssert(!modalRepay.classList.contains('hidden'), '6.1. openRepayModal opens modal-repay-credit');
testAssert(mockDocument.getElementById('repay-client-name').innerText === 'BATI-PLUS SARL', '6.2. #repay-client-name populated');
testAssert(modalRepay.dataset.targetId === String(targetId), '6.3. modal dataset.targetId set');

// Partial repayment
const prevDue = targetCredit.due;
const prevPaid = targetCredit.paid;
mockDocument.getElementById('repay-amount-input').value = '45000';
mockDocument.getElementById('repay-method').value = 'Orange Money';
context.executeCreditRepayment();
testAssert(targetCredit.due === prevDue - 45000, `6.4. Partial repayment deducted from due (${prevDue} -> ${targetCredit.due})`);
testAssert(targetCredit.paid === prevPaid + 45000, `6.5. Partial repayment added to paid (${prevPaid} -> ${targetCredit.paid})`);
testAssert(modalRepay.classList.contains('hidden'), '6.6. modal-repay-credit closes after repayment');

// Full settlement
context.openRepayModal(targetId);
mockDocument.getElementById('repay-amount-input').value = String(targetCredit.due);
context.executeCreditRepayment();
testAssert(targetCredit.due === 0, '6.7. Full settlement reduces due to 0');
testAssert(targetCredit.status === 'Soldé', '6.8. Settled debt status set to "Soldé"');

// 7. WhatsApp Reminders
lastOpenedUrl = null;
context.sendCreditWhatsAppReminder(targetId);
testAssert(lastOpenedUrl && lastOpenedUrl.startsWith('https://wa.me/'), '7.1. sendCreditWhatsAppReminder generates wa.me URL');
testAssert(lastOpenedUrl.includes('BATI-PLUS'), '7.2. WhatsApp message encodes client name');

// 8. Print Reports & Receipts
lastPrintedHtml = null;
context.printDebtorsReport();
testAssert(lastPrintedHtml && lastPrintedHtml.includes('AURA COMMERCE SARL'), '8.1. printDebtorsReport generates official document');
testAssert(lastPrintedHtml.includes('TOTAL ENCOURS RESTANT DÛ'), '8.2. printDebtorsReport contains total encours summary');
testAssert(lastPrintedHtml.includes('window.print()'), '8.3. printDebtorsReport triggers auto-print');

lastPrintedHtml = null;
context.printCreditReceipt(targetId, 45000, 'Wave');
testAssert(lastPrintedHtml && lastPrintedHtml.includes("REÇU D'ENCAISSEMENT CRÉDIT"), '8.4. printCreditReceipt generates payment voucher');
testAssert(lastPrintedHtml && lastPrintedHtml.includes('BATI-PLUS SARL'), '8.5. printCreditReceipt contains debtor name');

// 9. switchView("credits") Navigation Hook
context.switchView('credits');
testAssert(!mockDocument.getElementById('view-credits').classList.contains('hidden'), '9.1. switchView("credits") displays view-credits');
testAssert(mockDocument.getElementById('credits-table-body').children.length > 0, '9.2. switchView refreshes credits table');

console.log(`\n=== RESULTS: ${passedCount} PASSED, ${failedCount} FAILED ===`);
if (failedCount === 0) {
  console.log('SUCCESS: All Module 4 (Créances & Recouvrement) tests passed perfectly!');
  process.exit(0);
} else {
  console.error('FAILURE: Some tests failed.');
  process.exit(1);
}
