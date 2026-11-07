const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 13 - COMPTABILITÉ & TVA 18%    ');
console.log('====================================================\n');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Mock DOM elements
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(...cls) { cls.forEach(c => this.classes.add(c)); }
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
  contains(cls) { return this.classes.has(cls); }
  toggle(cls) { this.contains(cls) ? this.remove(cls) : this.add(cls); }
}

class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.innerHTML = '';
    this.innerText = '';
    this.value = '';
    this.classList = new MockClassList();
    this.style = {};
    this.attributes = {};
    this.children = [];
    this.options = [];
    this.selectedIndex = 0;
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
  }
  click() {
    if (typeof this.onclick === 'function') this.onclick();
  }
  closest(sel) { return null; }
  remove() {
    if (this.parentNode && typeof this.parentNode.removeChild === 'function') {
      this.parentNode.removeChild(this);
    }
  }
  focus() {}
}

const elementsMap = new Map();

function getOrCreateElement(id, tag = 'div') {
  if (!elementsMap.has(id)) {
    elementsMap.set(id, new MockElement(tag, id));
  }
  return elementsMap.get(id);
}

// Extract all id="..." from index.html
const idRegex = /id=["']([^"']+)["']/g;
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
  getOrCreateElement(match[1]);
}

let printedHtml = '';
let toasts = [];
let downloadedFileName = '';
let downloadedCSVContent = '';

const mockWindow = {
  document: {
    getElementById: (id) => getOrCreateElement(id),
    querySelector: (sel) => {
      if (sel.startsWith('#')) return getOrCreateElement(sel.slice(1));
      return new MockElement('div');
    },
    querySelectorAll: (sel) => [],
    createElement: (tag) => new MockElement(tag),
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  },
  navigator: { userAgent: 'NodeTest' },
  location: { reload: () => {} },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  open: (url, title, opts) => ({
    document: {
      open: () => {},
      write: (h) => { printedHtml = h; },
      close: () => {}
    },
    focus: () => {},
    print: () => {}
  }),
  URL: {
    createObjectURL: (b) => {
      downloadedCSVContent = (b && b.parts) ? b.parts.join('') : (b && b.content) ? b.content : '';
      return 'blob:mock-url-' + Date.now();
    },
    revokeObjectURL: () => {}
  },
  Blob: function(parts, opts) {
    this.parts = parts;
    this.content = parts.join('');
    this.opts = opts;
  },
  confirm: () => true,
  alert: (msg) => { console.log('Mock Alert:', msg); },
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: (fn) => setTimeout(fn, 0),
  clearTimeout: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  showToast: (msg, type) => { toasts.push({ msg, type }); },
  console: console
};

mockWindow.window = mockWindow;

// Global context
const context = vm.createContext(mockWindow);

// Extract inline scripts
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let scriptMatch;
let scriptsCombined = '';
while ((scriptMatch = scriptRegex.exec(htmlContent)) !== null) {
  scriptsCombined += scriptMatch[1] + '\n';
}

try {
  vm.runInContext(scriptsCombined, context);
  console.log('Script parsed and initialized in VM successfully.\n');
} catch (err) {
  console.error('Fatal initialization error:', err);
  process.exit(1);
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

// ==========================================
// 1. Static HTML Elements Inspection
// ==========================================
console.log('--- 1. Static HTML Structure & IDs in index.html ---');
assert(htmlContent.includes('id="view-accounting"'), 'Section view-accounting exists in index.html');
assert(htmlContent.includes('id="acc-tab-pnl"'), 'Subtab button acc-tab-pnl exists');
assert(htmlContent.includes('id="acc-tab-balance"'), 'Subtab button acc-tab-balance exists');
assert(htmlContent.includes('id="acc-tab-tva"'), 'Subtab button acc-tab-tva exists');
assert(htmlContent.includes('id="acc-tab-ledger"'), 'Subtab button acc-tab-ledger exists');

assert(htmlContent.includes('id="subview-acc-pnl"'), 'P&L subview exists');
assert(htmlContent.includes('id="subview-acc-balance"'), 'Balance subview exists');
assert(htmlContent.includes('id="subview-acc-tva"'), 'TVA subview exists');
assert(htmlContent.includes('id="subview-acc-ledger"'), 'Ledger subview exists');

assert(htmlContent.includes('id="acc-period-select"'), 'Period select acc-period-select exists');
assert(htmlContent.includes('exportGrandLivreCSV()'), 'exportGrandLivreCSV button wired');
assert(htmlContent.includes('printTVADeclarationA4()'), 'printTVADeclarationA4 button wired');
assert(htmlContent.includes('printBilanA4()'), 'printBilanA4 button wired');

// ==========================================
// 2. Subtab Switching Engine
// ==========================================
console.log('\n--- 2. Subtab Switching Engine (switchAccountingTab) ---');
assert(typeof context.switchAccountingTab === 'function', 'switchAccountingTab function is exposed globally');

context.switchAccountingTab('balance');
assert(!getOrCreateElement('subview-acc-balance').classList.contains('hidden'), 'Subtab balance becomes visible');
assert(getOrCreateElement('subview-acc-pnl').classList.contains('hidden'), 'Subtab pnl is hidden');
assert(getOrCreateElement('acc-tab-balance').classList.contains('border-[var(--primary)]'), 'Active tab button has primary active styling');

context.switchAccountingTab('tva');
assert(!getOrCreateElement('subview-acc-tva').classList.contains('hidden'), 'Subtab tva becomes visible');
assert(getOrCreateElement('subview-acc-balance').classList.contains('hidden'), 'Subtab balance is hidden');

context.switchAccountingTab('ledger');
assert(!getOrCreateElement('subview-acc-ledger').classList.contains('hidden'), 'Subtab ledger becomes visible');
assert(getOrCreateElement('subview-acc-tva').classList.contains('hidden'), 'Subtab tva is hidden');

context.switchAccountingTab('pnl');
assert(!getOrCreateElement('subview-acc-pnl').classList.contains('hidden'), 'Subtab pnl becomes visible again');

// ==========================================
// 3. P&L & Bilan Financial Metrics (SYSCOHADA)
// ==========================================
console.log('\n--- 3. SYSCOHADA P&L and Balance Sheet Metrics ---');
assert(typeof context.recalculateAccountingMetrics === 'function', 'recalculateAccountingMetrics function exists');

// Month calculations
context.recalculateAccountingMetrics('month');
const pnlRevMonth = getOrCreateElement('acc-pnl-revenue-ht').innerText;
const pnlCogsMonth = getOrCreateElement('acc-pnl-cogs').innerText;
const pnlMarginMonth = getOrCreateElement('acc-pnl-gross-margin').innerText;
const pnlEbeMonth = getOrCreateElement('acc-pnl-ebe-badge').innerText;
const pnlNetMonth = getOrCreateElement('acc-pnl-net-result').innerText;

assert(pnlRevMonth.includes('12') && pnlRevMonth.includes('584') && pnlRevMonth.includes('746'), `P&L Month Revenue HT matches 12 584 746 F CFA (${pnlRevMonth})`);
assert(pnlCogsMonth.includes('7') && pnlCogsMonth.includes('554') && pnlCogsMonth.includes('746'), `P&L Month COGS matches -7 554 746 F CFA (${pnlCogsMonth})`);
assert(pnlMarginMonth.includes('5') && pnlMarginMonth.includes('030') && pnlMarginMonth.includes('000'), `P&L Gross Margin matches 5 030 000 F CFA (${pnlMarginMonth})`);
assert(pnlEbeMonth.includes('3') && pnlEbeMonth.includes('605') && pnlEbeMonth.includes('000'), `P&L EBE matches +3 605 000 F CFA (${pnlEbeMonth})`);
assert(pnlNetMonth.includes('3') && pnlNetMonth.includes('605') && pnlNetMonth.includes('000'), `P&L Net Profit matches +3 605 000 F CFA (${pnlNetMonth})`);

// Balance sheet equilibrium
const balCash = getOrCreateElement('acc-bal-cash').innerText;
const balRec = getOrCreateElement('acc-bal-receivables').innerText;
const balStock = getOrCreateElement('acc-bal-stock-val').innerText;
const balActif = getOrCreateElement('acc-bal-total-actif').innerText;
const balPassif = getOrCreateElement('acc-bal-total-passif').innerText;
const balStatus = getOrCreateElement('acc-bal-status-badge').innerText;

assert(balCash.includes('4') && balCash.includes('820') && balCash.includes('000'), `Bilan Cash matches 4 820 000 F CFA (${balCash})`);
assert(balRec.includes('400') && balRec.includes('000'), `Bilan Receivables (411) matches 400 000 F CFA (${balRec})`);
assert(balStock.includes('18') && balStock.includes('420') && balStock.includes('000'), `Bilan Inventory (31) matches 18 420 000 F CFA (${balStock})`);
assert(balActif.includes('23') && balActif.includes('640') && balActif.includes('000'), `Total Actif matches 23 640 000 F CFA (${balActif})`);
assert(balPassif.includes('23') && balPassif.includes('640') && balPassif.includes('000'), `Total Passif matches 23 640 000 F CFA (${balPassif})`);
assert(balStatus.includes('BILAN SYSCOHADA ÉQUILIBRÉ') && balStatus.includes('23') && balStatus.includes('640') && balStatus.includes('000'), `Bilan status badge confirms perfect equilibrium Actif = Passif (${balStatus})`);

// ==========================================
// 4. DGI Burkina Faso TVA 18% & BIC Declaration
// ==========================================
console.log('\n--- 4. DGI Burkina Faso TVA 18% & BIC Declaration ---');
const tvaRev = getOrCreateElement('acc-tva-revenue-ht').innerText;
const tvaColl = getOrCreateElement('acc-tva-collected').innerText;
const tvaDed = getOrCreateElement('acc-tva-deductible').innerText;
const tvaNet = getOrCreateElement('acc-tva-net').innerText;

assert(tvaRev.includes('12') && tvaRev.includes('584') && tvaRev.includes('746'), `TVA Taxable Base HT matches 12 584 746 F CFA (${tvaRev})`);
assert(tvaColl.includes('2') && tvaColl.includes('265') && tvaColl.includes('254'), `TVA Brute 18% Collected matches 2 265 254 F CFA (${tvaColl})`);
assert(tvaDed.includes('1') && tvaDed.includes('841') && tvaDed.includes('254'), `TVA Deductible matches 1 841 254 F CFA (${tvaDed})`);
assert(tvaNet.includes('424') && tvaNet.includes('000'), `TVA Net Due matches 424 000 F CFA (${tvaNet})`);

// DGI detailed return lines
const rowL01 = getOrCreateElement('dgi-row-ca-taxable').innerText;
const rowL05 = getOrCreateElement('dgi-row-tva-brute').innerText;
const rowL10 = getOrCreateElement('dgi-row-total-deduct').innerText;
const rowL11 = getOrCreateElement('dgi-row-net-tva').innerText;
const rowL12 = getOrCreateElement('dgi-row-bic-acompte').innerText;
const rowL13 = getOrCreateElement('dgi-row-total-telepay').innerText;

assert(rowL01.includes('14') && rowL01.includes('850') && rowL01.includes('000'), `DGI L01 Taxable TTC matches 14 850 000 F (${rowL01})`);
assert(rowL05.includes('2') && rowL05.includes('265') && rowL05.includes('254'), `DGI L05 TVA Brute 18% matches 2 265 254 F (${rowL05})`);
assert(rowL10.includes('1') && rowL10.includes('841') && rowL10.includes('254'), `DGI L10 Deductible matches 1 841 254 F (${rowL10})`);
assert(rowL11.includes('424') && rowL11.includes('000'), `DGI L11 Solde TVA matches 424 000 F (${rowL11})`);
assert(rowL12.includes('125') && rowL12.includes('847'), `DGI L12 Minimum BIC/IS 1% matches 125 847 F (${rowL12})`);
assert(rowL13.includes('549') && rowL13.includes('847'), `DGI L13 Total Telepay matches 549 847 F CFA (${rowL13})`);

// Annual period recalculation
context.recalculateAccountingMetrics('year');
const pnlRevYear = getOrCreateElement('acc-pnl-revenue-ht').innerText;
const tvaNetYear = getOrCreateElement('acc-tva-net').innerText;
const bicYear = getOrCreateElement('dgi-row-bic-acompte').innerText;
assert(pnlRevYear.includes('136') && pnlRevYear.includes('620') && pnlRevYear.includes('000'), `Annual Revenue HT matches 136 620 000 F CFA (${pnlRevYear})`);
assert(tvaNetYear.includes('4') && tvaNetYear.includes('604') && tvaNetYear.includes('000'), `Annual Net TVA matches 4 604 000 F CFA (${tvaNetYear})`);
assert(bicYear.includes('1') && bicYear.includes('366') && bicYear.includes('200'), `Annual 1% BIC matches 1 366 200 F (${bicYear})`);

// Reset to month
context.recalculateAccountingMetrics('month');

// ==========================================
// 5. Grand Livre & Journal Écritures SYSCOHADA
// ==========================================
console.log('\n--- 5. Grand Livre & Journal Écritures SYSCOHADA ---');
assert(Array.isArray(context.window.ACCOUNTING_LEDGER) && context.window.ACCOUNTING_LEDGER.length >= 20, `ACCOUNTING_LEDGER initialized with ${context.window.ACCOUNTING_LEDGER?.length} entries`);

// Verify journal equilibrium across all entries
const sumDebit = context.window.ACCOUNTING_LEDGER.reduce((s, e) => s + (Number(e.debit) || 0), 0);
const sumCredit = context.window.ACCOUNTING_LEDGER.reduce((s, e) => s + (Number(e.credit) || 0), 0);
assert(sumDebit === sumCredit && sumDebit > 0, `Ledger entries are strictly balanced: Total Débit (${sumDebit} F) === Total Crédit (${sumCredit} F)`);

// Render & filter
context.filterLedger();
const tbodyHtml = getOrCreateElement('ledger-table-body').innerHTML;
assert(tbodyHtml.includes('5711') && tbodyHtml.includes('Caisse Principale') && tbodyHtml.includes('TK-2026-0001'), 'Ledger table renders POS cash sales entries');
assert(tbodyHtml.includes('7011') && tbodyHtml.includes('Ventes Marchandises'), 'Ledger table renders account 7011 sales revenue entries');
assert(tbodyHtml.includes('4431') && tbodyHtml.includes('TVA Facturée'), 'Ledger table renders account 4431 VAT entries');

// Filter by specific account
getOrCreateElement('ledger-account-filter').value = '571';
context.filterLedger();
const tbody571 = getOrCreateElement('ledger-table-body').innerHTML;
assert(tbody571.includes('5711') && !tbody571.includes('4451'), 'Filter by account 571 isolates cash entries');

// Filter by search term
getOrCreateElement('ledger-account-filter').value = 'ALL';
getOrCreateElement('ledger-search-input').value = 'CIMFASO';
context.filterLedger();
const tbodySearch = getOrCreateElement('ledger-table-body').innerHTML;
assert(tbodySearch.includes('CIMFASO') && tbodySearch.includes('BC-2026-0941'), 'Search query filters supplier CIMFASO purchase entries');

// Clear filters
getOrCreateElement('ledger-search-input').value = '';
context.filterLedger();
const balStatusLedger = getOrCreateElement('ledger-balance-status').innerText;
assert(balStatusLedger.includes('Journal Équilibré'), 'Ledger balance status confirms equilibrium Débit = Crédit');

// ==========================================
// 6. Official A4 Reports & Formulaires DGI
// ==========================================
console.log('\n--- 6. Official A4 Printable Documents & Certificates ---');

// 1. Official Bilan A4
context.printBilanA4();
assert(printedHtml.includes('ABDOULPRINT SARL') && printedHtml.includes('SYSCOHADA'), 'printBilanA4 outputs formal SYSCOHADA header and company info');
assert(printedHtml.includes('ACTIF CIRCULANT') && printedHtml.includes('PASSIF & CAPITAUX'), 'printBilanA4 includes balanced Actif & Passif tables');
assert(printedHtml.includes('Compte de Résultat') && printedHtml.includes('Expert-Comptable'), 'printBilanA4 includes P&L and certification signature blocks');

// 2. Official DGI TVA Declaration A4
context.printTVADeclarationA4();
assert(printedHtml.includes('DIRECTION GÉNÉRALE DES IMPÔTS') && printedHtml.includes('BURKINA FASO'), 'printTVADeclarationA4 outputs official DGI Burkina Faso header');
assert(printedHtml.includes('e-SINTAX') && printedHtml.includes('00142856X'), 'printTVADeclarationA4 references e-SINTAX platform and company IFU');
assert(printedHtml.includes('L01') && printedHtml.includes('L05') && printedHtml.includes('L11') && printedHtml.includes('L13'), 'printTVADeclarationA4 includes all official fiscal lines L01-L13');

// 3. Official Grand Livre A4
context.printGrandLivreA4();
assert(printedHtml.includes('Grand Livre des Comptes') && printedHtml.includes('Journal Général des Écritures'), 'printGrandLivreA4 prints journal entries with balanced totals');

// ==========================================
// 7. CSV Exports (Grand Livre & e-SINTAX)
// ==========================================
console.log('\n--- 7. Data Exports (CSV & e-SINTAX) ---');

// Export Grand Livre CSV
mockWindow.document.createElement = (tag) => {
  const el = new MockElement(tag);
  if (tag.toLowerCase() === 'a') {
    el.click = () => {};
    el.setAttribute = (k, v) => {
      if (k === 'download') downloadedFileName = v;
    };
  }
  return el;
};

context.exportGrandLivreCSV();
assert(downloadedFileName.includes('Grand_Livre_SYSCOHADA'), `exportGrandLivreCSV produces file ${downloadedFileName}`);
assert(downloadedCSVContent.includes('Date;Piece') && downloadedCSVContent.includes('5711'), 'Grand Livre CSV contains proper OHADA columns and entries');

// Export e-SINTAX CSV
context.exportTVACodeSintaxCSV();
assert(downloadedFileName.includes('eSINTAX'), `exportTVACodeSintaxCSV produces file ${downloadedFileName}`);
assert(downloadedCSVContent.includes('L01') && downloadedCSVContent.includes('00142856X') && downloadedCSVContent.includes('549847'), 'e-SINTAX CSV contains official DGI tax breakdown lines');

// ==========================================
// 8. View Switching Integration
// ==========================================
console.log('\n--- 8. View Switching & Navigation ---');
context.switchView('accounting');
const pageTitle = getOrCreateElement('page-title').innerText;
const breadcrumb = getOrCreateElement('breadcrumb-active').innerText;
assert(pageTitle === 'Comptabilité Fiscale (TVA 18%)', `switchView updates page title to 'Comptabilité Fiscale (TVA 18%)' (${pageTitle})`);
assert(breadcrumb === 'Comptabilité Fiscale (TVA 18%)', `switchView updates breadcrumb (${breadcrumb})`);

console.log('\n====================================================');
console.log(` RESULTS: ${testsPassed} / ${testsPassed + testsFailed} TESTS PASSED (${testsFailed} ERRORS)`);
console.log('====================================================\n');

if (testsFailed > 0) process.exit(1);
