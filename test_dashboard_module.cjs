// test_dashboard_module.cjs
// Comprehensive Automated Test Suite for Module 1: Tableau de Bord 360° & Cockpit Financier
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

console.log('================================================================');
console.log('  TEST SUITE: MODULE 1 - TABLEAU DE BORD 360° & COCKPIT FINANCIER ');
console.log('================================================================\n');

let passedCount = 0;
let failedCount = 0;

function it(desc, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  [PASS] #${passedCount}: ${desc}`);
  } catch (err) {
    failedCount++;
    console.error(`  [FAIL] #${passedCount + failedCount}: ${desc}`);
    console.error(`         ${err.message}`);
  }
}

// 1. Static HTML DOM Structure Checks
it('Section #view-dashboard exists in DOM', () => {
  assert.ok(html.includes('id="view-dashboard"'), '#view-dashboard missing');
});

it('Cockpit KPI elements exist in DOM', () => {
  const kpis = [
    'dash-ca-ttc', 'dash-ca-ht', 'dash-net-profit', 'dash-credits-total',
    'dash-suppliers-debt', 'dash-stock-cost', 'dash-stock-sales',
    'dash-treasury-total', 'dash-stock-alerts'
  ];
  kpis.forEach(id => assert.ok(html.includes(`id="${id}"`), `Missing KPI #${id}`));
});

it('Period presets and date inputs exist in DOM', () => {
  ['btn-period-today', 'btn-period-week', 'btn-period-month', 'btn-period-year', 'dash-date-start', 'dash-date-end'].forEach(id => {
    assert.ok(html.includes(`id="${id}"`), `Missing period element #${id}`);
  });
});

it('Top products and top clients table bodies exist in DOM', () => {
  assert.ok(html.includes('id="dash-top-products-tbody"'), 'Missing #dash-top-products-tbody');
  assert.ok(html.includes('id="dash-top-clients-tbody"'), 'Missing #dash-top-clients-tbody');
});

it('Quick action buttons are wired in HTML', () => {
  assert.ok(html.includes("onclick=\"switchView('pos')\""), 'Missing Vente Caisse POS button');
  assert.ok(html.includes("onclick=\"openCreateDocumentModal('invoice')\""), 'Missing + Facture A4 button');
  assert.ok(html.includes("onclick=\"openQuickExpenseModal()\""), 'Missing + Dépense button');
  assert.ok(html.includes("onclick=\"exportDashboardReport()\""), 'Missing Export CSV button');
});

// 2. Simulated DOM & JavaScript Logic
const domElements = {
  'view-dashboard': { classList: { add: () => {}, remove: () => {} } },
  'btn-period-today': { className: '' },
  'btn-period-week': { className: '' },
  'btn-period-month': { className: '' },
  'btn-period-year': { className: '' },
  'dash-date-start': { value: '2026-11-01' },
  'dash-date-end': { value: '2026-11-25' },
  'dash-stock-cost': { innerText: '' },
  'dash-stock-sales': { innerText: '' },
  'dash-stock-alerts': { innerText: '' },
  'dash-ca-ttc': { innerText: '' },
  'dash-ca-ht': { innerText: '' },
  'dash-net-profit': { innerText: '' },
  'dash-credits-total': { innerText: '' },
  'dash-suppliers-debt': { innerText: '' },
  'dash-treasury-total': { innerText: '' },
  'dash-top-products-tbody': { innerHTML: '' },
  'dash-top-clients-tbody': { innerHTML: '' },
  'toast-container': { appendChild: () => {} }
};

let lastDownloadedUri = '';
const domContext = {
  requestAnimationFrame: (cb) => cb(),
  addEventListener: () => {},
  removeEventListener: () => {},
  window: {},
  document: {
    getElementById: (id) => domElements[id] || {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      className: '',
      value: '',
      innerText: '',
      innerHTML: '',
      appendChild: () => {},
      remove: () => {},
      querySelectorAll: () => [],
      closest: () => null
    },
    querySelectorAll: () => [],
    querySelector: () => ({ innerText: '' }),
    createElement: () => ({
      classList: { add: () => {}, remove: () => {} },
      setAttribute: (k, v) => { if (k === 'href') lastDownloadedUri = v; },
      click: () => {},
      remove: () => {}
    }),
    body: { appendChild: () => {}, removeChild: () => {} }
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  encodeURI: encodeURI,
  Date: Date,
  Math: Math,
  parseInt: parseInt,
  parseFloat: parseFloat,
  String: String,
  Array: Array,
  Object: Object
};
domContext.window = domContext;

const scriptMatches = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
const scriptContent = scriptMatches.map(s => s.replace(/<\/?script[\s\S]*?>/gi, '')).join('\n');
const context = vm.createContext(domContext);
vm.runInContext(scriptContent, context);

it('recalculateDashboardMetrics is defined as a function', () => {
  assert.strictEqual(typeof context.recalculateDashboardMetrics, 'function');
});

it('recalculateDashboardMetrics populates real stock and CA metrics', () => {
  context.recalculateDashboardMetrics();
  assert.ok(domElements['dash-stock-cost'].innerText.includes('F'), 'Stock cost not populated');
  assert.ok(domElements['dash-stock-sales'].innerText.includes('F'), 'Stock sales not populated');
  assert.ok(domElements['dash-ca-ttc'].innerText.includes('F'), 'CA TTC not populated');
  assert.ok(domElements['dash-credits-total'].innerText.includes('F'), 'Credits total not populated');
  assert.ok(domElements['dash-suppliers-debt'].innerText.includes('F'), 'Suppliers debt not populated');
});

it('setDashboardPreset updates active class and recalculates metrics', () => {
  context.setDashboardPreset('year');
  assert.ok(domElements['btn-period-year'].className.includes('bg-[var(--primary)]'));
  const yearCA = domElements['dash-ca-ttc'].innerText;
  
  context.setDashboardPreset('today');
  assert.ok(domElements['btn-period-today'].className.includes('bg-[var(--primary)]'));
  const todayCA = domElements['dash-ca-ttc'].innerText;
  assert.notStrictEqual(yearCA, todayCA, 'CA should differ between year and today presets');
});

it('applyCustomDashboardDate unselects preset buttons and recalculates', () => {
  context.applyCustomDashboardDate();
  assert.ok(!domElements['btn-period-today'].className.includes('bg-[var(--primary)]'), 'Today button should no longer be active');
});

it('renderDashboardTopTables populates top products with markup', () => {
  context.renderDashboardTopTables();
  assert.ok(domElements['dash-top-products-tbody'].innerHTML.length > 50, 'Top products tbody empty');
  assert.ok(domElements['dash-top-products-tbody'].innerHTML.includes('tr'), 'Missing table rows in top products');
});

it('renderDashboardTopTables populates top clients with markup', () => {
  context.renderDashboardTopTables();
  assert.ok(domElements['dash-top-clients-tbody'].innerHTML.length > 50, 'Top clients tbody empty');
  assert.ok(domElements['dash-top-clients-tbody'].innerHTML.includes('tr'), 'Missing table rows in top clients');
});

it('showDaySalesInfo triggers informative feedback', () => {
  let toastMsg = '';
  context.showToast = (msg) => { toastMsg = msg; };
  context.showDaySalesInfo('Samedi', 960000, 48);
  assert.ok(toastMsg.includes('Samedi') && toastMsg.includes('960'), 'Toast message missing day details');
});

it('openStockAlertsView navigates to stock view with filter', () => {
  let switchedTo = '';
  context.switchView = (v) => { switchedTo = v; };
  context.openStockAlertsView();
  assert.strictEqual(switchedTo, 'stock');
});

it('exportDashboardReport generates CSV file download', () => {
  lastDownloadedUri = '';
  context.exportDashboardReport();
  assert.ok(lastDownloadedUri.startsWith('data:text/csv'), 'Did not generate CSV data URI');
});

it('switchView is defined and callable for dashboard view', () => {
  assert.strictEqual(typeof context.switchView, 'function');
  context.switchView('dashboard');
  assert.ok(true);
});

console.log('\n================================================================');
console.log(`  MODULE 1 TEST RESULTS: ${passedCount}/${passedCount + failedCount} PASSED (${failedCount} FAILURES)`);
console.log('================================================================\n');

if (failedCount > 0) process.exit(1);
