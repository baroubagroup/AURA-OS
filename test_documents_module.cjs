const fs = require('fs');
const vm = require('vm');

console.log('=== TEST SUITE: MODULE 3 (view-documents & Studio A4) ===');

const html = fs.readFileSync('aura-pos/index.html', 'utf8');

// Extract all element IDs from index.html
const idRegex = /id=["']([^"']+)["']/g;
const allIds = new Set();
let m;
while ((m = idRegex.exec(html)) !== null) {
  allIds.add(m[1]);
}

// Build lightweight DOM elements
const elements = new Map();

function createElement(id = '', tag = 'div') {
  const classes = new Set();
  const children = [];
  const el = {
    id: id,
    tagName: tag.toUpperCase(),
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
['subview-doc-proformas', 'subview-doc-deliveries', 'subview-doc-orders', 'modal-doc-a4', 'modal-create-doc'].forEach(id => {
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
  querySelectorAll: () => [],
  querySelector: (sel) => {
    if (sel.startsWith('#')) return mockDocument.getElementById(sel.slice(1));
    return null;
  },
  body: createElement('body')
};

const mockWindow = {
  document: mockDocument,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => cb(),
  console: console,
  open: (url) => ({
    document: { write: () => {}, close: () => {} }
  }),
  showToast: (msg, type) => {},
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

// Extract <script> code from index.html
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let scriptMatch;
let mainScript = '';
while ((scriptMatch = scriptRegex.exec(html)) !== null) {
  if (scriptMatch[1].length > 1000) {
    mainScript = scriptMatch[1];
    break;
  }
}

// Execute the ERP code in sandbox
const context = vm.createContext(mockWindow);
vm.runInContext(mainScript, context);

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failed++;
  }
}

console.log('--- STARTING VERIFICATION CHECKS ---');

// Test 1: Collections existence
assert(Array.isArray(context.INVOICES_LIST) && context.INVOICES_LIST.length >= 4, '1.1. INVOICES_LIST populated', `Count: ${context.INVOICES_LIST?.length}`);
assert(Array.isArray(context.PROFORMAS_LIST) && context.PROFORMAS_LIST.length >= 3, '1.2. PROFORMAS_LIST populated', `Count: ${context.PROFORMAS_LIST?.length}`);
assert(Array.isArray(context.DELIVERY_SLIPS) && context.DELIVERY_SLIPS.length >= 2, '1.3. DELIVERY_SLIPS populated', `Count: ${context.DELIVERY_SLIPS?.length}`);
assert(Array.isArray(context.PURCHASE_ORDERS) && context.PURCHASE_ORDERS.length >= 2, '1.4. PURCHASE_ORDERS populated', `Count: ${context.PURCHASE_ORDERS?.length}`);

// Test 2: renderAllDocumentTables()
context.renderAllDocumentTables();
const invBody = mockDocument.getElementById('doc-invoices-body');
const profBody = mockDocument.getElementById('doc-proformas-body');
const delivBody = mockDocument.getElementById('doc-deliveries-body');
const ordBody = mockDocument.getElementById('doc-orders-body');

assert(invBody.children.length === context.INVOICES_LIST.length, '2.1. #doc-invoices-body rendered all invoices', `Count: ${invBody.children.length}`);
assert(profBody.children.length === context.PROFORMAS_LIST.length, '2.2. #doc-proformas-body rendered all proformas', `Count: ${profBody.children.length}`);
assert(delivBody.children.length === context.DELIVERY_SLIPS.length, '2.3. #doc-deliveries-body rendered all deliveries', `Count: ${delivBody.children.length}`);
assert(ordBody.children.length === context.PURCHASE_ORDERS.length, '2.4. #doc-orders-body rendered all orders', `Count: ${ordBody.children.length}`);

// Test 3: KPI counters
context.updateDocumentKPICounters();
const kpiInvoiced = mockDocument.getElementById('kpi-doc-invoiced');
const kpiProformas = mockDocument.getElementById('kpi-doc-proformas');
const kpiUnpaid = mockDocument.getElementById('kpi-doc-unpaid');
const kpiDeliveries = mockDocument.getElementById('kpi-doc-deliveries');

assert(kpiInvoiced.innerText.includes('F CFA') && !kpiInvoiced.innerText.startsWith('0'), '3.1. #kpi-doc-invoiced non-zero & formatted', kpiInvoiced.innerText);
assert(kpiProformas.innerText.includes('F CFA') && !kpiProformas.innerText.startsWith('0'), '3.2. #kpi-doc-proformas non-zero & formatted', kpiProformas.innerText);
assert(kpiUnpaid.innerText.includes('F CFA') && !kpiUnpaid.innerText.startsWith('0'), '3.3. #kpi-doc-unpaid non-zero & formatted', kpiUnpaid.innerText);
assert(kpiDeliveries.innerText.includes('émis'), '3.4. #kpi-doc-deliveries non-zero & formatted', kpiDeliveries.innerText);

// Test 4: switchDocTab
context.switchDocTab('proformas');
assert(!mockDocument.getElementById('subview-doc-proformas').classList.contains('hidden') && mockDocument.getElementById('subview-doc-invoices').classList.contains('hidden'), '4.1. switchDocTab("proformas") activates proformas view');

context.switchDocTab('deliveries');
assert(!mockDocument.getElementById('subview-doc-deliveries').classList.contains('hidden'), '4.2. switchDocTab("deliveries") activates deliveries view');

context.switchDocTab('orders');
assert(!mockDocument.getElementById('subview-doc-orders').classList.contains('hidden'), '4.3. switchDocTab("orders") activates orders view');

context.switchDocTab('invoices');
assert(!mockDocument.getElementById('subview-doc-invoices').classList.contains('hidden'), '4.4. switchDocTab("invoices") activates invoices view');

// Test 5: Invoice filtering by status
context.filterInvoicesByStatus('Payée');
assert(invBody.children.length === 2, '5.1. filterInvoicesByStatus("Payée") renders 2 paid rows', `Got: ${invBody.children.length}`);

context.filterInvoicesByStatus('UNPAID');
assert(invBody.children.length === 2, '5.2. filterInvoicesByStatus("UNPAID") renders 2 unpaid/acompte rows', `Got: ${invBody.children.length}`);

context.filterInvoicesByStatus('ALL');
assert(invBody.children.length === context.INVOICES_LIST.length, '5.3. filterInvoicesByStatus("ALL") restores all rows');

// Test 6: Text searches
const searchInput = mockDocument.getElementById('doc-search-invoices');
searchInput.value = 'BATI-PLUS';
context.applyInvoiceFilters();
assert(invBody.children.length === 1 && invBody.innerHTML.includes('FACT-2026-0894'), '6.1. applyInvoiceFilters searches by client name');
searchInput.value = '';
context.applyInvoiceFilters();

context.filterProformasTable('Koulouba');
assert(profBody.children.length === 1 && profBody.innerHTML.includes('PRO-2026-0890'), '6.2. filterProformasTable searches proformas');
context.filterProformasTable('');
assert(profBody.children.length === context.PROFORMAS_LIST.length, '6.3. filterProformasTable("") restores all proformas');

// Test 7: Convert Proforma to Invoice
const prevInvoiceCount = context.INVOICES_LIST.length;
context.convertProformaToInvoice('PRO-2026-0890');
const convProf = context.PROFORMAS_LIST.find(p => p.id === 'PRO-2026-0890');
assert(convProf && convProf.status === 'Converti en Facture', '7.1. Proforma marked as converted');
assert(context.INVOICES_LIST.length === prevInvoiceCount + 1, '7.2. INVOICES_LIST incremented');
assert(context.currentActiveDocument && context.currentActiveDocument.ref.startsWith('FACT-2026'), '7.3. Studio A4 active doc loaded with new invoice');

// Test 8: Studio A4 loading specific documents
context.openDocumentStudio('invoice', 'FACT-2026-0893');
assert(context.currentActiveDocument.ref === 'FACT-2026-0893', '8.1. loadDocumentIntoStudio loads FACT-2026-0893');
const sheet = mockDocument.getElementById('a4-print-sheet');
assert(sheet.innerHTML.includes('FACT-2026-0893'), '8.2. #a4-print-sheet contains FACT-2026-0893');
assert(sheet.innerHTML.includes('Hôtel Somgandé Prestige'), '8.3. #a4-print-sheet contains client name');

context.openDocumentStudio('proforma', 'PRO-2026-0885');
assert(context.currentActiveDocument.ref === 'PRO-2026-0885', '8.4. loadDocumentIntoStudio loads PRO-2026-0885');
assert(sheet.innerHTML.includes('Société Faso Agro'), '8.5. #a4-print-sheet contains proforma client');

context.openDocumentStudio('delivery', 'BL-2026-0894');
assert(context.currentActiveDocument.ref === 'BL-2026-0894', '8.6. loadDocumentIntoStudio loads BL-2026-0894');
assert(sheet.innerHTML.includes('Issouf S.'), '8.7. #a4-print-sheet contains driver');

context.openDocumentStudio('order', 'BC-2026-0152');
assert(context.currentActiveDocument.ref === 'BC-2026-0152', '8.8. loadDocumentIntoStudio loads BC-2026-0152');
assert(sheet.innerHTML.includes('CIMFASO'), '8.9. #a4-print-sheet contains supplier');

// Test 9: Visual templates
['minimal', 'corporate', 'dgi', 'split', 'prestige'].forEach(tpl => {
  context.switchInvoiceTemplate(tpl);
  assert(context.currentInvoiceTemplate === tpl, `9. switchInvoiceTemplate to ${tpl} works`);
});

// Test 10: Document creation modal
context.openCreateDocumentModal('invoice');
assert(!mockDocument.getElementById('modal-create-doc').classList.contains('hidden'), '10.1. modal-create-doc opened');
context.addCreateDocLine();
assert(context.createDocLinesData.length >= 3, '10.2. addCreateDocLine adds line');
context.submitCreateDocument();
assert(mockDocument.getElementById('modal-create-doc').classList.contains('hidden'), '10.3. modal-create-doc closed');
assert(context.currentActiveDocument.ref.startsWith('FACT-2026'), '10.4. submitCreateDocument generated and activated new invoice');

// Test 11: WhatsApp, Print and Close
context.shareInvoiceWhatsApp('FACT-2026-0894');
assert(true, '11.1. shareInvoiceWhatsApp ran cleanly');
context.shareA4WhatsApp();
assert(true, '11.2. shareA4WhatsApp ran cleanly');
context.downloadDocumentPDF();
assert(true, '11.3. downloadDocumentPDF ran cleanly');
context.closeDocumentStudio();
assert(mockDocument.getElementById('modal-doc-a4').classList.contains('hidden'), '11.4. closeDocumentStudio closes modal');

console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed === 0) {
  console.log('SUCCESS: All checks passed perfectly for Module 3!');
  process.exit(0);
} else {
  process.exit(1);
}
