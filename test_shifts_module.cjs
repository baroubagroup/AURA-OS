const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('=== TEST SUITE: MODULE 5 (view-shifts: Clôture de Caisse & Quarts) ===');

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
['lock-screen', 'view-shifts'].forEach(id => {
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

let lastPrintedHtml = null;
let confirmResult = true;

const mockWindow = {
  document: mockDocument,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => cb(),
  console: console,
  open: (url) => {
    return {
      document: {
        write: (htmlContent) => { lastPrintedHtml = htmlContent; },
        close: () => {}
      }
    };
  },
  showToast: (msg, type) => {},
  alert: (msg) => {},
  confirm: (msg) => confirmResult,
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

const norm = (s) => (s || '').replace(/\s+/g, ' ');

console.log('--- STARTING MODULE 5 VERIFICATION CHECKS ---');

// 1. Data Integrity
testAssert(Array.isArray(context.DENOMINATIONS) && context.DENOMINATIONS.length === 9, '1.1. DENOMINATIONS collection populated with 9 cuts');
testAssert(typeof context.theoreticalShiftTotal === 'number' && context.theoreticalShiftTotal === 367500, '1.2. theoreticalShiftTotal initialized to 367 500 F CFA');
testAssert(context.ACTIVE_SHIFT && context.ACTIVE_SHIFT.cashierName === 'Abdoul C.', '1.3. ACTIVE_SHIFT initialized with cashier name');
testAssert(Array.isArray(context.SHIFTS_HISTORY) && context.SHIFTS_HISTORY.length >= 2, '1.4. SHIFTS_HISTORY populated with past shifts');

// 2. Denominations Table Rendering
context.renderDenominationsTable();
const denomBody = mockDocument.getElementById('denominations-body');
testAssert(denomBody.children.length === 9, '2.1. denominations-body renders all 9 denomination rows');
testAssert(denomBody.innerHTML.includes('10 000 F CFA'), '2.2. Table contains 10 000 F CFA row');
testAssert(denomBody.innerHTML.includes('25 F CFA'), '2.3. Table contains 25 F CFA row');
testAssert(denomBody.innerHTML.includes('updateDenominationCount'), '2.4. Inputs trigger updateDenominationCount');

// 3. Counting & Discrepancy / Variance
context.recalculateShiftCount();
testAssert(norm(mockDocument.getElementById('shift-counted-total').innerText).includes('367 500'), '3.1. Counted total equals 367 500 F CFA');
testAssert(mockDocument.getElementById('shift-variance-badge').innerText.includes('Parfait'), '3.2. Variance badge indicates Parfait (0 F discrepancy)');

// Simulate Excess (+10 000 F CFA)
context.updateDenominationCount(0, 26); // 26 x 10000 instead of 25
testAssert(norm(mockDocument.getElementById('shift-counted-total').innerText).includes('377 500'), '3.3. Counted total increases to 377 500 F CFA');
testAssert(mockDocument.getElementById('shift-variance-badge').innerText.includes('Excédent'), '3.4. Variance badge indicates Excédent');

// Simulate Deficit (-10 000 F CFA)
context.updateDenominationCount(0, 24); // 24 x 10000
testAssert(norm(mockDocument.getElementById('shift-counted-total').innerText).includes('357 500'), '3.5. Counted total decreases to 357 500 F CFA');
testAssert(mockDocument.getElementById('shift-variance-badge').innerText.includes('Déficit'), '3.6. Variance badge indicates Déficit');

// Restore to exact total
context.updateDenominationCount(0, 25);
testAssert(mockDocument.getElementById('shift-variance-badge').innerText.includes('Parfait'), '3.7. Restoring exact count restores Parfait badge');

// 4. Reset Denominations
context.resetDenominations();
testAssert(norm(mockDocument.getElementById('shift-counted-total').innerText).includes('0 F CFA'), '4.1. resetDenominations reduces counted total to 0 F CFA');
testAssert(mockDocument.getElementById('shift-variance-badge').innerText.includes('Déficit'), '4.2. Zero count correctly displays full deficit');

// Restore initial counts for further tests
context.DENOMINATIONS[0].count = 25;
context.DENOMINATIONS[1].count = 18;
context.DENOMINATIONS[2].count = 10;
context.DENOMINATIONS[3].count = 6;
context.DENOMINATIONS[4].count = 3;
context.renderDenominationsTable();

// 5. Theoretical Metrics Display
context.recalculateShiftMetrics();
testAssert(mockDocument.getElementById('shift-cashier-name').innerText.includes('Abdoul C.'), '5.1. #shift-cashier-name updated');
testAssert(norm(mockDocument.getElementById('shift-initial-cash').innerText).includes('50 000'), '5.2. #shift-initial-cash updated');
testAssert(norm(mockDocument.getElementById('shift-cash-sales').innerText).includes('342 500'), '5.3. #shift-cash-sales updated');
testAssert(norm(mockDocument.getElementById('shift-cash-expenses').innerText).includes('25 000'), '5.4. #shift-cash-expenses updated');
testAssert(norm(mockDocument.getElementById('shift-theoretical-total').innerText).includes('367 500'), '5.5. #shift-theoretical-total equals 367 500 F CFA');

// 6. Clôture de Caisse (submitShiftClose)
const prevShiftHistoryLength = context.SHIFTS_HISTORY.length;
lastPrintedHtml = null;
confirmResult = true;
context.submitShiftClose();
testAssert(context.SHIFTS_HISTORY.length === prevShiftHistoryLength + 1, '6.1. submitShiftClose prepends closed shift into SHIFTS_HISTORY');
const lastClosed = context.SHIFTS_HISTORY[0];
testAssert(lastClosed.countedAmount === 367500 && lastClosed.discrepancy === 0, '6.2. Closed shift records exact counted amount and 0 discrepancy');
testAssert(lastClosed.status === 'Conforme', '6.3. Closed shift marked as Conforme');
testAssert(lastPrintedHtml && lastPrintedHtml.includes('TICKET Z'), '6.4. submitShiftClose automatically generates Rapport Z ticket');
testAssert(!mockDocument.getElementById('lock-screen').classList.contains('hidden'), '6.5. submitShiftClose locks station screen');

// 7. Official Rapport Z Printout (printZReportPreview)
lastPrintedHtml = null;
context.printZReportPreview();
testAssert(lastPrintedHtml && lastPrintedHtml.includes('AURA COMMERCE SARL'), '7.1. printZReportPreview contains company name');
testAssert(lastPrintedHtml.includes('IFU : 00124856019M'), '7.2. printZReportPreview contains IFU');
testAssert(lastPrintedHtml.includes('TOTAL VENTES (TTC)'), '7.3. printZReportPreview contains sales summary');
testAssert(lastPrintedHtml.includes('SOLDE PHYSIQUE COMPTÉ'), '7.4. printZReportPreview contains physical counted balance');
testAssert(lastPrintedHtml.includes('Visa Caissier') && lastPrintedHtml.includes('Visa Responsable'), '7.5. printZReportPreview contains supervisor visas');
testAssert(lastPrintedHtml.includes('window.print()'), '7.6. printZReportPreview triggers print');

// 8. Station Lock & PIN Authentication
context.lockScreen();
const lockScreenEl = mockDocument.getElementById('lock-screen');
testAssert(!lockScreenEl.classList.contains('hidden'), '8.1. lockScreen displays lock-screen modal');

// Test wrong PIN
context.pressPin('9');
context.pressPin('9');
context.pressPin('9');
context.pressPin('9');
context.checkPin();
testAssert(!lockScreenEl.classList.contains('hidden'), '8.2. Wrong PIN keeps screen locked');

// Test clear PIN
context.clearPin();
testAssert(context.window.currentEnteredPin === '', '8.3. clearPin empties entered PIN');

// Test correct PIN
context.pressPin('1');
context.pressPin('2');
context.pressPin('3');
context.pressPin('4');
context.checkPin();
testAssert(lockScreenEl.classList.contains('hidden'), '8.4. Correct PIN (1234) unlocks screen');

// 9. switchView("shifts") Navigation Hook
context.switchView('shifts');
testAssert(!mockDocument.getElementById('view-shifts').classList.contains('hidden'), '9.1. switchView("shifts") activates view-shifts');
testAssert(norm(mockDocument.getElementById('shift-theoretical-total').innerText).includes('367 500'), '9.2. switchView refreshes shift theoretical total');

console.log(`\n=== RESULTS: ${passedCount} PASSED, ${failedCount} FAILED ===`);
if (failedCount === 0) {
  console.log('SUCCESS: All Module 5 (Clôture de Caisse & Shifts) tests passed perfectly!');
  process.exit(0);
} else {
  console.error('FAILURE: Some tests failed.');
  process.exit(1);
}
