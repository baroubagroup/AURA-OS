const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 11 - LIVRAISONS & FLOTTE       ');
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
    this.checked = true;
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
assert(htmlContent.includes('id="view-deliveries"'), 'Section #view-deliveries exists in HTML');
assert(htmlContent.includes('id="kpi-deliv-total"'), 'KPI #kpi-deliv-total exists');
assert(htmlContent.includes('id="kpi-deliv-transit"'), 'KPI #kpi-deliv-transit exists');
assert(htmlContent.includes('id="kpi-deliv-cod"'), 'KPI #kpi-deliv-cod exists');
assert(htmlContent.includes('id="kpi-deliv-done"'), 'KPI #kpi-deliv-done exists');
assert(htmlContent.includes('id="deliv-tab-ALL"'), 'Subtab button #deliv-tab-ALL exists');
assert(htmlContent.includes('id="deliv-tab-ACTIVE"'), 'Subtab button #deliv-tab-ACTIVE exists');
assert(htmlContent.includes('id="deliv-tab-COD"'), 'Subtab button #deliv-tab-COD exists');
assert(htmlContent.includes('id="deliv-tab-DONE"'), 'Subtab button #deliv-tab-DONE exists');
assert(htmlContent.includes('id="deliveries-search-input"'), 'Search input #deliveries-search-input exists');
assert(htmlContent.includes('id="deliveries-count-label"'), 'Count label #deliveries-count-label exists');
assert(htmlContent.includes('id="kanban-col-prep"'), 'Kanban column prep exists');
assert(htmlContent.includes('id="kanban-col-ready"'), 'Kanban column ready exists');
assert(htmlContent.includes('id="kanban-col-transit"'), 'Kanban column transit exists');
assert(htmlContent.includes('id="kanban-col-done"'), 'Kanban column done exists');
assert(htmlContent.includes('id="kanban-count-prep"'), 'Kanban counter #kanban-count-prep exists');
assert(htmlContent.includes('id="kanban-count-ready"'), 'Kanban counter #kanban-count-ready exists');
assert(htmlContent.includes('id="kanban-count-transit"'), 'Kanban counter #kanban-count-transit exists');
assert(htmlContent.includes('id="kanban-count-done"'), 'Kanban counter #kanban-count-done exists');
assert(htmlContent.includes('id="modal-new-delivery"'), 'Modal #modal-new-delivery exists');
assert(htmlContent.includes('id="modal-zone-calculator"'), 'Modal #modal-zone-calculator exists');
assert(htmlContent.includes('exportDeliveriesCSV()'), 'Export CSV button exists in header');
assert(htmlContent.includes('openZoneCalculatorModal()'), 'Zone calculator button exists in header');
assert(htmlContent.includes('openNewDeliveryModal()'), 'New delivery button exists in header');

// ==========================================
// 2. Global Function Definitions
// ==========================================
console.log('\n--- 2. Delivery Functions in Global Scope ---');
assert(typeof context.recalculateDeliveriesMetrics === 'function', 'recalculateDeliveriesMetrics is defined');
assert(typeof context.filterDeliveriesByTab === 'function', 'filterDeliveriesByTab is defined');
assert(typeof context.filterDeliveriesKanban === 'function', 'filterDeliveriesKanban is defined');
assert(typeof context.renderDeliveriesKanban === 'function', 'renderDeliveriesKanban is defined');
assert(typeof context.advanceDeliveryStage === 'function', 'advanceDeliveryStage is defined');
assert(typeof context.rewindDeliveryStage === 'function', 'rewindDeliveryStage is defined');
assert(typeof context.collectDeliveryCOD === 'function', 'collectDeliveryCOD is defined');
assert(typeof context.deleteDelivery === 'function', 'deleteDelivery is defined');
assert(typeof context.openNewDeliveryModal === 'function', 'openNewDeliveryModal is defined');
assert(typeof context.closeNewDeliveryModal === 'function', 'closeNewDeliveryModal is defined');
assert(typeof context.submitNewDelivery === 'function', 'submitNewDelivery is defined');
assert(typeof context.openZoneCalculatorModal === 'function', 'openZoneCalculatorModal is defined');
assert(typeof context.closeZoneCalculatorModal === 'function', 'closeZoneCalculatorModal is defined');
assert(typeof context.updateZoneCalculatorDisplay === 'function', 'updateZoneCalculatorDisplay is defined');
assert(typeof context.printDeliveryNote === 'function', 'printDeliveryNote is defined');
assert(typeof context.exportDeliveriesCSV === 'function', 'exportDeliveriesCSV is defined');

// ==========================================
// 3. Initial Calculations & KPIs
// ==========================================
console.log('\n--- 3. Initial Deliveries Calculations & KPIs ---');
context.renderDeliveriesKanban();

const kpiTotal = getOrCreateElement('kpi-deliv-total').innerText;
const kpiTransit = getOrCreateElement('kpi-deliv-transit').innerText;
const kpiCod = getOrCreateElement('kpi-deliv-cod').innerText;
const kpiDone = getOrCreateElement('kpi-deliv-done').innerText;

assert(kpiTotal.includes('4'), `Total deliveries KPI matches 4 runs (${kpiTotal})`);
assert(kpiTransit.includes('1'), `Deliveries in transit KPI matches 1 on the road (${kpiTransit})`);
assert(kpiCod.includes('135') && kpiCod.includes('000'), `Pending COD collection matches 135 000 F CFA (${kpiCod})`);
assert(kpiDone.includes('1'), `Delivered & completed KPI matches 1 (${kpiDone})`);

const countPrep = getOrCreateElement('kanban-count-prep').innerText;
const countReady = getOrCreateElement('kanban-count-ready').innerText;
const countTransit = getOrCreateElement('kanban-count-transit').innerText;
const countDone = getOrCreateElement('kanban-count-done').innerText;

assert(countPrep === '1' && countReady === '1' && countTransit === '1' && countDone === '1', 'Kanban column counters match 1 each across 4 stages');

// ==========================================
// 4. Kanban Rendering & Filtering
// ==========================================
console.log('\n--- 4. Kanban Rendering & Multi-Criteria Filtering ---');
const prepHtml = getOrCreateElement('kanban-col-prep').innerHTML;
const readyHtml = getOrCreateElement('kanban-col-ready').innerHTML;
const transitHtml = getOrCreateElement('kanban-col-transit').innerHTML;
const doneHtml = getOrCreateElement('kanban-col-done').innerHTML;

assert(prepHtml.includes('CMD-0941') && prepHtml.includes('Société Faso Agro'), 'Prep column renders CMD-0941');
assert(readyHtml.includes('CMD-0942') && readyHtml.includes('Salif Sanogo'), 'Ready column renders CMD-0942');
assert(transitHtml.includes('CMD-0940') && transitHtml.includes('Patte'), 'Transit column renders CMD-0940');
assert(doneHtml.includes('CMD-0938') && doneHtml.includes('Koulouba'), 'Done column renders CMD-0938');

context.filterDeliveriesByTab('COD');
let currentHtml = getOrCreateElement('kanban-col-done').innerHTML;
assert(!currentHtml.includes('CMD-0938'), 'Tab COD filters out already completed non-COD run');

context.filterDeliveriesByTab('ALL');
getOrCreateElement('deliveries-search-input').value = 'Faso Agro';
context.filterDeliveriesKanban();
let searchPrep = getOrCreateElement('kanban-col-prep').innerHTML;
let searchReady = getOrCreateElement('kanban-col-ready').innerHTML;
assert(searchPrep.includes('Faso Agro') && !searchReady.includes('Salif Sanogo'), 'Search input isolates Faso Agro');

// Reset search
getOrCreateElement('deliveries-search-input').value = '';
context.filterDeliveriesKanban();

// ==========================================
// 5. Interactive Pipeline Operations
// ==========================================
console.log('\n--- 5. Interactive Pipeline Operations ---');

// A. Advance stage: prep -> ready
context.advanceDeliveryStage(1); // CMD-0941
const deliv1 = context.DELIVERIES.find(d => d.id === 1);
assert(deliv1.stage === 'ready', `advanceDeliveryStage advanced CMD-0941 to 'ready' (now: ${deliv1.stage})`);
assert(getOrCreateElement('kanban-count-ready').innerText === '2', 'Ready column counter incremented to 2');

// B. Rewind stage: ready -> prep
context.rewindDeliveryStage(1);
assert(deliv1.stage === 'prep', `rewindDeliveryStage replanted CMD-0941 back to 'prep' (now: ${deliv1.stage})`);
assert(getOrCreateElement('kanban-count-prep').innerText === '1', 'Prep column counter restored to 1');

// C. Collect COD directly
const prevCash = context.ACTIVE_SHIFT ? (context.ACTIVE_SHIFT.cashPayments || 0) : 0;
context.collectDeliveryCOD(3); // CMD-0940 (amount: 42000, cod: true)
const deliv3 = context.DELIVERIES.find(d => d.id === 3);
assert(deliv3.stage === 'done', `collectDeliveryCOD finalized CMD-0940 into 'done' (now: ${deliv3.stage})`);

const updatedCodKpi = getOrCreateElement('kpi-deliv-cod').innerText;
assert(updatedCodKpi.includes('93') && updatedCodKpi.includes('000'), `COD to collect reduced to 93 000 F CFA (${updatedCodKpi})`);

if (context.ACTIVE_SHIFT) {
  assert(context.ACTIVE_SHIFT.cashPayments === prevCash + 42000, 'Shift cash payments increased by COD amount');
}

// D. Zone Calculator Modal
context.openZoneCalculatorModal();
assert(!getOrCreateElement('modal-zone-calculator').classList.contains('hidden'), 'openZoneCalculatorModal opens modal');
const feeText = getOrCreateElement('calc-zone-fee').innerText;
assert(feeText.includes('F CFA'), `Calculator calculates zone delivery fee (${feeText})`);
context.closeZoneCalculatorModal();
assert(getOrCreateElement('modal-zone-calculator').classList.contains('hidden'), 'closeZoneCalculatorModal closes modal');

// E. Create New Delivery
context.openNewDeliveryModal();
assert(!getOrCreateElement('modal-new-delivery').classList.contains('hidden'), 'openNewDeliveryModal opens modal');

getOrCreateElement('new-deliv-client').value = 'Clinique Sandof';
getOrCreateElement('new-deliv-phone').value = '+226 78 12 34 56';
getOrCreateElement('new-deliv-zone').value = 'Somgandé / Kossodo';
getOrCreateElement('new-deliv-address').value = 'Avenue Kadiogo, Clinique Sandof';
getOrCreateElement('new-deliv-amount').value = '65000';
getOrCreateElement('new-deliv-fee').value = '2000';
getOrCreateElement('new-deliv-cod').checked = true;
getOrCreateElement('new-deliv-driver').value = 'Oumar Diallo';

context.submitNewDelivery();
assert(context.DELIVERIES.length === 5, 'DELIVERIES array incremented to 5');
const updatedTotalKpi = getOrCreateElement('kpi-deliv-total').innerText;
assert(updatedTotalKpi.includes('5'), `Total deliveries KPI updated to 5 (${updatedTotalKpi})`);

// F. A4 Delivery Slip Printing
context.printDeliveryNote(1);
assert(printedHtml.includes('ABDOULPRINT SARL') && printedHtml.includes('CMD-0941'), 'printDeliveryNote generates printable A4 sheet');
assert(printedHtml.includes('Bordereau d\'Expédition') && printedHtml.includes('PAIEMENT À LA LIVRAISON'), 'Bordereau contains delivery title and COD status');

// G. CSV Export
let csvDownloaded = false;
mockWindow.document.createElement = (tag) => {
  const el = new MockElement(tag);
  if (tag.toLowerCase() === 'a') {
    el.click = () => { csvDownloaded = true; };
  }
  return el;
};
context.exportDeliveriesCSV();
assert(csvDownloaded, 'exportDeliveriesCSV generates and triggers CSV download');

// H. Deletion
const createdId = context.DELIVERIES[0].id;
context.deleteDelivery(createdId);
assert(context.DELIVERIES.length === 4, 'Delivery deleted, count returns to 4');

// I. View Navigation Hook
context.switchView('deliveries');
const pageTitle = getOrCreateElement('page-title').innerText;
const breadcrumb = getOrCreateElement('breadcrumb-active').innerText;
assert(pageTitle === 'Livraisons & Flotte', `switchView updates page title to 'Livraisons & Flotte' (${pageTitle})`);
assert(breadcrumb === 'Livraisons & Flotte', `switchView updates breadcrumb (${breadcrumb})`);

console.log('\n====================================================');
console.log(` RESULTS: ${testsPassed} / ${testsPassed + testsFailed} TESTS PASSED (${testsFailed} ERRORS)`);
console.log('====================================================\n');

if (testsFailed > 0) process.exit(1);
