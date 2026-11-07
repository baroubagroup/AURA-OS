const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 10 - FOURNISSEURS & ACHATS     ');
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
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
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
assert(htmlContent.includes('id="view-suppliers"'), 'Section #view-suppliers exists in HTML');
assert(htmlContent.includes('id="kpi-suppliers-count"'), 'KPI #kpi-suppliers-count exists');
assert(htmlContent.includes('id="kpi-suppliers-pending-orders"'), 'KPI #kpi-suppliers-pending-orders exists');
assert(htmlContent.includes('id="kpi-suppliers-debt"'), 'KPI #kpi-suppliers-debt exists');
assert(htmlContent.includes('id="kpi-suppliers-spent"'), 'KPI #kpi-suppliers-spent exists');
assert(htmlContent.includes('id="suppliers-tab-ALL"'), 'Subtab button #suppliers-tab-ALL exists');
assert(htmlContent.includes('id="suppliers-tab-DUE"'), 'Subtab button #suppliers-tab-DUE exists');
assert(htmlContent.includes('id="suppliers-tab-ORDERS"'), 'Subtab button #suppliers-tab-ORDERS exists');
assert(htmlContent.includes('id="suppliers-search-input"'), 'Search input #suppliers-search-input exists');
assert(htmlContent.includes('id="suppliers-count-label"'), 'Count label #suppliers-count-label exists');
assert(htmlContent.includes('id="suppliers-table-body"'), 'Table body #suppliers-table-body exists');
assert(htmlContent.includes('id="suppliers-orders-table-body"'), 'Orders table body #suppliers-orders-table-body exists');
assert(htmlContent.includes('id="modal-new-supplier"'), 'Modal #modal-new-supplier exists');
assert(htmlContent.includes('id="modal-pay-supplier"'), 'Modal #modal-pay-supplier exists');
assert(htmlContent.includes('id="new-supp-id"'), 'Hidden input #new-supp-id exists for edit mode');
assert(htmlContent.includes('exportSuppliersCSV()'), 'Export CSV button exists in suppliers header');
assert(htmlContent.includes("openCreateDocumentModal('order')"), 'Purchase order BC button exists in header');

// ==========================================
// 2. Global Function Definitions
// ==========================================
console.log('\n--- 2. Supplier Functions in Global Scope ---');
assert(typeof context.recalculateSuppliersMetrics === 'function', 'recalculateSuppliersMetrics is defined');
assert(typeof context.filterSuppliersByTab === 'function', 'filterSuppliersByTab is defined');
assert(typeof context.filterSuppliersTable === 'function', 'filterSuppliersTable is defined');
assert(typeof context.renderSuppliersTable === 'function', 'renderSuppliersTable is defined');
assert(typeof context.renderSupplierOrdersTable === 'function', 'renderSupplierOrdersTable is defined');
assert(typeof context.receivePurchaseOrder === 'function', 'receivePurchaseOrder is defined');
assert(typeof context.prepareSupplierOrder === 'function', 'prepareSupplierOrder is defined');
assert(typeof context.openNewSupplierModal === 'function', 'openNewSupplierModal is defined');
assert(typeof context.openEditSupplierModal === 'function', 'openEditSupplierModal is defined');
assert(typeof context.closeNewSupplierModal === 'function', 'closeNewSupplierModal is defined');
assert(typeof context.openSupplierPaymentModal === 'function', 'openSupplierPaymentModal is defined');
assert(typeof context.closeSupplierPaymentModal === 'function', 'closeSupplierPaymentModal is defined');
assert(typeof context.submitSupplierPayment === 'function', 'submitSupplierPayment is defined');
assert(typeof context.submitNewSupplier === 'function', 'submitNewSupplier is defined');
assert(typeof context.deleteSupplier === 'function', 'deleteSupplier is defined');
assert(typeof context.printSupplierStatement === 'function', 'printSupplierStatement is defined');
assert(typeof context.exportSuppliersCSV === 'function', 'exportSuppliersCSV is defined');

// ==========================================
// 3. Initial Calculations & KPIs
// ==========================================
console.log('\n--- 3. Initial Supplier Calculations & KPIs ---');
context.renderSuppliersTable();

const kpiCount = getOrCreateElement('kpi-suppliers-count').innerText;
const kpiOrders = getOrCreateElement('kpi-suppliers-pending-orders').innerText;
const kpiDebt = getOrCreateElement('kpi-suppliers-debt').innerText;
const kpiSpent = getOrCreateElement('kpi-suppliers-spent').innerText;
const dashDebt = getOrCreateElement('dash-suppliers-debt').innerText;

assert(kpiCount.includes('3'), `Total suppliers KPI matches 3 partners (${kpiCount})`);
assert(kpiOrders.includes('1'), `Pending orders KPI matches 1 in progress (${kpiOrders})`);
assert(kpiDebt.includes('1') && kpiDebt.includes('700') && kpiDebt.includes('000'), `Total debt KPI matches 1 700 000 F CFA (${kpiDebt})`);
assert(dashDebt.includes('1') && dashDebt.includes('700') && dashDebt.includes('000'), `Dashboard debt widget synchronized with 1 700 000 F (${dashDebt})`);
assert(kpiSpent.includes('8') && kpiSpent.includes('050') && kpiSpent.includes('000'), `Total purchases spent matches 8 050 000 F CFA (${kpiSpent})`);

// ==========================================
// 4. Table Rendering
// ==========================================
console.log('\n--- 4. Rendering Suppliers & Orders Tables ---');
const suppTbody = getOrCreateElement('suppliers-table-body').innerHTML;
assert(suppTbody.includes('CIMFASO') && suppTbody.includes('SODIBO') && suppTbody.includes('Sahel Tech'), 'Suppliers table renders all 3 suppliers');
assert(suppTbody.includes('Commander') && suppTbody.includes('Régler') && suppTbody.includes('Relevé A4'), 'Table renders action buttons (Commander, Régler, Relevé)');

const ordersTbody = getOrCreateElement('suppliers-orders-table-body').innerHTML;
assert(ordersTbody.includes('BC-2026-0152') && ordersTbody.includes('BC-2026-0150'), 'Orders table renders recent purchase orders');
assert(ordersTbody.includes('Réceptionner en Réserve'), 'Pending order displays direct stock intake button');

// ==========================================
// 5. Dynamic Filtering & Search
// ==========================================
console.log('\n--- 5. Dynamic Segmentation & Search Filtering ---');
context.filterSuppliersByTab('DUE');
let filteredHtml = getOrCreateElement('suppliers-table-body').innerHTML;
assert(filteredHtml.includes('CIMFASO') && filteredHtml.includes('SODIBO') && !filteredHtml.includes('Sahel Tech'), 'Filter DUE shows only suppliers with outstanding debts');

context.filterSuppliersByTab('ALL');
getOrCreateElement('suppliers-search-input').value = 'SODIBO';
context.filterSuppliersTable();
filteredHtml = getOrCreateElement('suppliers-table-body').innerHTML;
assert(filteredHtml.includes('SODIBO') && !filteredHtml.includes('CIMFASO'), 'Search filters to SODIBO by query');

// Reset search
getOrCreateElement('suppliers-search-input').value = '';
context.filterSuppliersTable();

// ==========================================
// 6. Interactive Operations
// ==========================================
console.log('\n--- 6. Interactive Supplier Operations ---');

// A. Stock Intake on Order Reception
context.receivePurchaseOrder('BC-2026-0152');
const updatedOrdersKpi = getOrCreateElement('kpi-suppliers-pending-orders').innerText;
assert(updatedOrdersKpi.includes('0'), `Pending orders decremented to 0 after reception (${updatedOrdersKpi})`);
assert(context.STOCK_MOVEMENTS[0].ref === 'BC-2026-0152', 'STOCK_MOVEMENTS journal logged stock intake event');

// B. New Supplier Creation
context.openNewSupplierModal();
assert(!getOrCreateElement('modal-new-supplier').classList.contains('hidden'), 'openNewSupplierModal opens modal');

getOrCreateElement('new-supp-name').value = 'Faso Plast S.A.';
getOrCreateElement('new-supp-category').value = 'Agroalimentaire & Épicerie';
getOrCreateElement('new-supp-contact').value = 'Mme Sanou';
getOrCreateElement('new-supp-phone').value = '+226 70 88 99 00';
getOrCreateElement('new-supp-due').value = '300000';
getOrCreateElement('new-supp-address').value = 'Bobo-Dioulasso';
getOrCreateElement('new-supp-ifu').value = '00159988A';

context.submitNewSupplier();
assert(context.SUPPLIERS.length === 4, 'SUPPLIERS array incremented to 4');
const newCountKpi = getOrCreateElement('kpi-suppliers-count').innerText;
assert(newCountKpi.includes('4'), `Total suppliers KPI updated to 4 (${newCountKpi})`);

const newDebtKpi = getOrCreateElement('kpi-suppliers-debt').innerText;
assert(newDebtKpi.includes('2') && newDebtKpi.includes('000') && newDebtKpi.includes('000'), `Total debt increased with new balance (${newDebtKpi})`);

// C. Supplier Edition
context.openEditSupplierModal('supp_' + (context.SUPPLIERS[0].id.replace('supp_', '')));
assert(getOrCreateElement('modal-supp-title').innerText.includes('Modifier'), 'Modal switches to edit mode');

getOrCreateElement('new-supp-address').value = 'Zone Industrielle Kossodo';
context.submitNewSupplier();
const edited = context.SUPPLIERS.find(s => s.name === 'Faso Plast S.A.');
assert(edited && edited.address === 'Zone Industrielle Kossodo', 'Supplier modified in-place without duplicate');

// D. Supplier Payment / Acompte
context.openSupplierPaymentModal(1); // CIMFASO (debt = 1 250 000)
assert(!getOrCreateElement('modal-pay-supplier').classList.contains('hidden'), 'openSupplierPaymentModal opens payment modal');

getOrCreateElement('pay-supp-amount').value = '250000';
getOrCreateElement('pay-supp-method').value = 'Espèces';
getOrCreateElement('pay-supp-ref').value = 'VIR-2026-TEST';

const prevCashExpenses = context.ACTIVE_SHIFT ? (context.ACTIVE_SHIFT.cashExpenses || 0) : 0;
context.submitSupplierPayment();

const cimfaso = context.SUPPLIERS.find(s => s.id === 1);
assert(cimfaso.due === 1000000, `CIMFASO debt reduced from 1 250 000 to 1 000 000 F CFA (now: ${cimfaso.due})`);

if (context.ACTIVE_SHIFT) {
  assert(context.ACTIVE_SHIFT.cashExpenses === prevCashExpenses + 250000, 'Shift cash expenses incremented by supplier payment amount');
}
assert(context.EXPENSES[0].category === 'Approvisionnements & Achats', 'New expense registered for accounting audit');

// E. A4 Statement Printing
context.printSupplierStatement(1);
assert(printedHtml.includes('ABDOULPRINT SARL') && printedHtml.includes('CIMFASO'), 'printSupplierStatement creates printable A4 sheet');
assert(printedHtml.includes('COMPTE 401') && printedHtml.includes('SOLDE GLOBAL'), 'Statement contains SYSCOHADA Compte 401 and totals');

// F. CSV Export
let csvDownloaded = false;
mockWindow.document.createElement = (tag) => {
  const el = new MockElement(tag);
  if (tag.toLowerCase() === 'a') {
    el.click = () => { csvDownloaded = true; };
  }
  return el;
};
context.exportSuppliersCSV();
assert(csvDownloaded, 'exportSuppliersCSV generates and triggers CSV download');

// G. Deletion
const addedId = context.SUPPLIERS[0].id;
context.deleteSupplier(addedId);
assert(context.SUPPLIERS.length === 3, 'Supplier removed, count returns to 3');

// H. SwitchView hook
context.switchView('suppliers');
const pageTitle = getOrCreateElement('page-title').innerText;
const breadcrumb = getOrCreateElement('breadcrumb-active').innerText;
assert(pageTitle === 'Fournisseurs & Commandes', `switchView updates page title to 'Fournisseurs & Commandes' (${pageTitle})`);
assert(breadcrumb === 'Fournisseurs & Commandes', `switchView updates breadcrumb (${breadcrumb})`);

console.log('\n====================================================');
console.log(` RESULTS: ${testsPassed} / ${testsPassed + testsFailed} TESTS PASSED (${testsFailed} ERRORS)`);
console.log('====================================================\n');

if (testsFailed > 0) process.exit(1);
