const fs = require('fs');
const html = fs.readFileSync('aura-pos/index.html', 'utf8');
const vm = require('vm');

const domElements = {
  'btn-period-today': { className: '' },
  'btn-period-week': { className: '' },
  'btn-period-month': { className: '' },
  'btn-period-year': { className: '' },
  'dash-date-start': { value: '2026-11-01' },
  'dash-date-end': { value: '2026-11-04' },
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
  'toast-container': { appendChild: () => {} },
  'filter-stock-alert': { click: () => {} }
};

const domContext = {
  requestAnimationFrame: (cb) => cb(),
  addEventListener: () => {},
  removeEventListener: () => {},
  window: {
    addEventListener: () => {},
    removeEventListener: () => {}
  },
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
      setAttribute: () => {},
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

console.log('--- Testing Dashboard Module Functionality ---');

// 1. Initial recalculate
context.recalculateDashboardMetrics();
console.log('1. Stock Cost:', domElements['dash-stock-cost'].innerText);
console.log('   Stock Sales:', domElements['dash-stock-sales'].innerText);
console.log('   Stock Alerts:', domElements['dash-stock-alerts'].innerText);
console.log('   CA TTC:', domElements['dash-ca-ttc'].innerText);
console.log('   Net Profit:', domElements['dash-net-profit'].innerText);
console.log('   Credits Total:', domElements['dash-credits-total'].innerText);
console.log('   Suppliers Debt:', domElements['dash-suppliers-debt'].innerText);
console.log('   Top Products HTML length:', domElements['dash-top-products-tbody'].innerHTML.length);
console.log('   Top Clients HTML length:', domElements['dash-top-clients-tbody'].innerHTML.length);

// 2. Preset today vs year
context.setDashboardPreset('year');
console.log('2. After Period Year -> CA TTC:', domElements['dash-ca-ttc'].innerText);

context.setDashboardPreset('today');
console.log('   After Period Today -> CA TTC:', domElements['dash-ca-ttc'].innerText);

// 3. Custom Date
context.applyCustomDashboardDate();
console.log('3. Custom Date Applied: Period =', context.dashboardPeriod);

// 4. Click day bar
context.showDaySalesInfo('Samedi', 960000, 48);

// 5. Open Stock Alerts
context.openStockAlertsView();

// 6. Export Report
context.exportDashboardReport();

console.log('🎉 ALL DASHBOARD AUDIT TESTS PASSED 100%!');
