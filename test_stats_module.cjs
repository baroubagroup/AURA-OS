const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 12 - STATS & MARGES RÉELLES   ');
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
    createObjectURL: (b) => 'blob:mock-url-' + Date.now(),
    revokeObjectURL: () => {}
  },
  Blob: function(parts, opts) {
    this.parts = parts;
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
    console.log(`  [PASS] Test ${testsPassed + testsFailed + 1}: ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] Test ${testsPassed + testsFailed + 1}: ${message}`);
    testsFailed++;
  }
}

// ==========================================
// 1. Static HTML & ID Verifications
// ==========================================
console.log('--- 1. Static HTML & ID Verifications ---');
assert(htmlContent.includes('id="view-stats"'), 'Section #view-stats exists in HTML');
assert(htmlContent.includes('id="stats-period-select"'), 'Period select #stats-period-select exists');
assert(htmlContent.includes('id="stats-kpi-revenue"'), 'KPI #stats-kpi-revenue exists');
assert(htmlContent.includes('id="stats-kpi-revenue-sub"'), 'KPI #stats-kpi-revenue-sub exists');
assert(htmlContent.includes('id="stats-kpi-cogs"'), 'KPI #stats-kpi-cogs exists');
assert(htmlContent.includes('id="stats-kpi-cogs-sub"'), 'KPI #stats-kpi-cogs-sub exists');
assert(htmlContent.includes('id="stats-kpi-gross-margin"'), 'KPI #stats-kpi-gross-margin exists');
assert(htmlContent.includes('id="stats-kpi-gross-margin-sub"'), 'KPI #stats-kpi-gross-margin-sub exists');
assert(htmlContent.includes('id="stats-kpi-expenses"'), 'KPI #stats-kpi-expenses exists');
assert(htmlContent.includes('id="stats-kpi-expenses-sub"'), 'KPI #stats-kpi-expenses-sub exists');
assert(htmlContent.includes('id="stats-kpi-net-profit"'), 'KPI #stats-kpi-net-profit exists');
assert(htmlContent.includes('id="stats-kpi-net-profit-sub"'), 'KPI #stats-kpi-net-profit-sub exists');
assert(htmlContent.includes('id="stats-peak-hours-label"'), 'Badge #stats-peak-hours-label exists');
assert(htmlContent.includes('id="stats-hourly-chart"'), 'Chart container #stats-hourly-chart exists');
assert(htmlContent.includes('id="stats-mode-cash-val"'), 'Payment channel #stats-mode-cash-val exists');
assert(htmlContent.includes('id="stats-mode-wave-val"'), 'Payment channel #stats-mode-wave-val exists');
assert(htmlContent.includes('id="stats-mode-om-val"'), 'Payment channel #stats-mode-om-val exists');
assert(htmlContent.includes('id="stats-mode-bank-val"'), 'Payment channel #stats-mode-bank-val exists');
assert(htmlContent.includes('id="stats-top-products-body"'), 'Table body #stats-top-products-body exists');
assert(htmlContent.includes('id="stats-top-clients-body"'), 'Table body #stats-top-clients-body exists');
assert(htmlContent.includes('exportFinancialStatsCSV()'), 'Export CSV button exists in header');
assert(htmlContent.includes('printFinancialReport()'), 'Print financial report PDF button exists in header');

// ==========================================
// 2. Global Function Definitions
// ==========================================
console.log('\n--- 2. Stats Functions in Global Scope ---');
assert(typeof context.recalculateStatsMetrics === 'function', 'recalculateStatsMetrics is defined');
assert(typeof context.renderHourlyChart === 'function', 'renderHourlyChart is defined');
assert(typeof context.renderPaymentDistribution === 'function', 'renderPaymentDistribution is defined');
assert(typeof context.renderTopProfitableProducts === 'function', 'renderTopProfitableProducts is defined');
assert(typeof context.renderTopClientsRevenue === 'function', 'renderTopClientsRevenue is defined');
assert(typeof context.renderStats === 'function', 'renderStats is defined');
assert(typeof context.printFinancialReport === 'function', 'printFinancialReport is defined');
assert(typeof context.exportFinancialStatsCSV === 'function', 'exportFinancialStatsCSV is defined');

// ==========================================
// 3. Financial Metrics & Period Calculations
// ==========================================
console.log('\n--- 3. Financial Metrics across Periods ---');

// Default month
context.recalculateStatsMetrics('month');
const revMonth = getOrCreateElement('stats-kpi-revenue').innerText;
const cogsMonth = getOrCreateElement('stats-kpi-cogs').innerText;
const marginMonth = getOrCreateElement('stats-kpi-gross-margin').innerText;
const expMonth = getOrCreateElement('stats-kpi-expenses').innerText;
const netMonth = getOrCreateElement('stats-kpi-net-profit').innerText;

assert(revMonth.includes('8') && revMonth.includes('450') && revMonth.includes('000'), `Month Revenue matches 8 450 000 F CFA (${revMonth})`);
assert(cogsMonth.includes('5') && cogsMonth.includes('420') && cogsMonth.includes('000'), `Month COGS matches 5 420 000 F CFA (${cogsMonth})`);
assert(marginMonth.includes('3') && marginMonth.includes('030') && marginMonth.includes('000'), `Month Gross Margin matches 3 030 000 F CFA (${marginMonth})`);
assert(expMonth.includes('1') && expMonth.includes('425') && expMonth.includes('000'), `Month Expenses match 1 425 000 F CFA (${expMonth})`);
assert(netMonth.includes('1') && netMonth.includes('605') && netMonth.includes('000'), `Month Net Profit matches 1 605 000 F CFA (${netMonth})`);

// Today
context.recalculateStatsMetrics('today');
const revToday = getOrCreateElement('stats-kpi-revenue').innerText;
const netToday = getOrCreateElement('stats-kpi-net-profit').innerText;
assert(revToday.includes('1') && revToday.includes('188') && revToday.includes('000'), `Today Revenue matches 1 188 000 F CFA (${revToday})`);
assert(netToday.includes('168') && netToday.includes('000'), `Today Net Profit matches 168 000 F CFA (${netToday})`);

// Year
context.recalculateStatsMetrics('year');
const revYear = getOrCreateElement('stats-kpi-revenue').innerText;
const netYear = getOrCreateElement('stats-kpi-net-profit').innerText;
assert(revYear.includes('136') && revYear.includes('620') && revYear.includes('000'), `Year Revenue matches 136 620 000 F CFA (${revYear})`);
assert(netYear.includes('29') && netYear.includes('220') && netYear.includes('000'), `Year Net Profit matches 29 220 000 F CFA (${netYear})`);

// Reset to month
context.recalculateStatsMetrics('month');

// ==========================================
// 4. Charts & Distributions
// ==========================================
console.log('\n--- 4. Charts & Payment Distributions ---');
const hourlyHtml = getOrCreateElement('stats-hourly-chart').innerHTML;
assert(hourlyHtml.includes('08h') && hourlyHtml.includes('11h') && hourlyHtml.includes('17h') && hourlyHtml.includes('19h'), 'Hourly chart renders full operational day bars');

const cashVal = getOrCreateElement('stats-mode-cash-val').innerText;
const waveVal = getOrCreateElement('stats-mode-wave-val').innerText;
const omVal = getOrCreateElement('stats-mode-om-val').innerText;
const bankVal = getOrCreateElement('stats-mode-bank-val').innerText;

assert(cashVal.includes('58%') && cashVal.includes('4') && cashVal.includes('901'), `Cash drawer distribution matches 58% (${cashVal})`);
assert(waveVal.includes('24%') && waveVal.includes('2') && waveVal.includes('028'), `Wave Mobile Money matches 24% (${waveVal})`);
assert(omVal.includes('12%') && omVal.includes('1') && omVal.includes('014'), `Orange Money matches 12% (${omVal})`);
assert(bankVal.includes('6%') && bankVal.includes('507'), `Bank transfers / cheques match 6% (${bankVal})`);

// ==========================================
// 5. Profitability Tables
// ==========================================
console.log('\n--- 5. Top Products & Clients Tables ---');
const prodTbody = getOrCreateElement('stats-top-products-body').innerHTML;
assert(prodTbody.includes('Ciment Portland') && prodTbody.includes('Fer à Béton') && prodTbody.includes('Brakina Canette'), 'Top products table renders best performers');
assert(prodTbody.includes('720') && prodTbody.includes('000'), 'Top products table displays gross margin figures');

const clientTbody = getOrCreateElement('stats-top-clients-body').innerHTML;
assert(clientTbody.includes('BATI-PLUS') && clientTbody.includes('Société Faso Agro'), 'Top clients table renders key customer accounts');

// ==========================================
// 6. Interactive Financial Operations
// ==========================================
console.log('\n--- 6. Interactive Financial Operations ---');

// Print Report A4
context.printFinancialReport();
assert(printedHtml.includes('ABDOULPRINT SARL') && printedHtml.includes('Rapport d\'Exploitation Financière'), 'printFinancialReport generates formal printable A4 report');
assert(printedHtml.includes('C.A. Réalisé') && printedHtml.includes('Bénéfice Net'), 'Report contains P&L metrics grid and signature boxes');

// Export CSV
let csvDownloaded = false;
mockWindow.document.createElement = (tag) => {
  const el = new MockElement(tag);
  if (tag.toLowerCase() === 'a') {
    el.click = () => { csvDownloaded = true; };
  }
  return el;
};
context.exportFinancialStatsCSV();
assert(csvDownloaded, 'exportFinancialStatsCSV generates and triggers CSV download');

// View Switch Navigation
context.switchView('stats');
const pageTitle = getOrCreateElement('page-title').innerText;
const breadcrumb = getOrCreateElement('breadcrumb-active').innerText;
assert(pageTitle === 'Statistiques & Marges Réelles', `switchView updates page title to 'Statistiques & Marges Réelles' (${pageTitle})`);
assert(breadcrumb === 'Statistiques & Marges Réelles', `switchView updates breadcrumb (${breadcrumb})`);

console.log('\n====================================================');
console.log(` RESULTS: ${testsPassed} / ${testsPassed + testsFailed} TESTS PASSED (${testsFailed} ERRORS)`);
console.log('====================================================\n');

if (testsFailed > 0) process.exit(1);
