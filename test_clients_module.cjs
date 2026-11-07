const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 9 - CLIENTS & CRM COMMERCIAL  ');
console.log('====================================================\n');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Minimal DOM Mock for Node VM
class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.innerHTML = '';
    this.innerText = '';
    this.value = '';
    this.style = {};
    this.attributes = {};
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) { this.children = this.children.filter(c => c !== child); }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  click() { if (typeof this.onclick === 'function') this.onclick(); }
}

const domElements = new Map();
function getMockElement(id, tagName = 'div') {
  if (!domElements.has(id)) {
    const el = new MockElement(id, tagName);
    el.classList = {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); },
      toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
    };
    domElements.set(id, el);
  }
  return domElements.get(id);
}

// Pre-populate key DOM elements
const keyIds = [
  'view-clients',
  'crm-kpi-total', 'crm-kpi-b2b', 'crm-kpi-due', 'crm-kpi-spend',
  'crm-tab-ALL', 'crm-tab-B2B', 'crm-tab-B2C', 'crm-tab-RESELLER',
  'crm-search', 'crm-count-label', 'crm-table-body',
  'modal-new-client', 'modal-client-title', 'modal-client-subtitle', 'btn-submit-client',
  'new-client-id', 'new-client-name', 'new-client-category', 'new-client-ifu', 'new-client-phone', 'new-client-whatsapp', 'new-client-city', 'new-client-credit-limit',
  'pos-customer-select',
  'toast-container', 'page-title', 'breadcrumb-active'
];
keyIds.forEach(id => getMockElement(id));

// Add child spans for tab labels
['ALL', 'B2B', 'B2C', 'RESELLER'].forEach(k => {
  const tab = getMockElement('crm-tab-' + k);
  const span = new MockElement('', 'span');
  tab.appendChild(span);
});

const documentMock = {
  getElementById: (id) => getMockElement(id),
  querySelector: (selector) => {
    if (selector.includes('#crm-tab-ALL span')) return getMockElement('crm-tab-ALL').children[0];
    if (selector.includes('#crm-tab-B2B span')) return getMockElement('crm-tab-B2B').children[0];
    if (selector.includes('#crm-tab-B2C span')) return getMockElement('crm-tab-B2C').children[0];
    if (selector.includes('#crm-tab-RESELLER span')) return getMockElement('crm-tab-RESELLER').children[0];
    return null;
  },
  querySelectorAll: (selector) => {
    if (selector === '.page-view') return [getMockElement('view-clients')];
    if (selector === '.nav-btn') return [getMockElement('nav-clients')];
    return [];
  },
  createElement: (tag) => {
    const el = new MockElement('', tag);
    el.classList = {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    };
    return el;
  },
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

let openedWindows = [];
let downloadedBlobs = [];
const windowMock = {
  document: documentMock,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); }
  },
  alert: (msg) => {},
  confirm: () => true,
  open: (url, target, features) => {
    const win = {
      url,
      document: {
        write: (str) => { win.content = str; },
        close: () => {}
      },
      close: () => {},
      content: ''
    };
    openedWindows.push(win);
    return win;
  },
  print: () => {},
  addEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  URL: {
    createObjectURL: (blob) => {
      downloadedBlobs.push(blob);
      return 'blob:mock-url';
    }
  },
  Blob: class MockBlob {
    constructor(parts, opts) {
      this.content = parts.join('');
      this.type = opts ? opts.type : '';
    }
  }
};
windowMock.window = windowMock;

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  localStorage: windowMock.localStorage,
  alert: windowMock.alert,
  confirm: windowMock.confirm,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  URL: windowMock.URL,
  Blob: windowMock.Blob,
  fetch: () => Promise.resolve({ json: () => Promise.resolve({ success: true }) })
});

// Extract <script> code from index.html
const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const inlineScript = scriptMatches.map(m => m[1]).join('\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
  }
}

try {
  vm.runInContext(inlineScript, context);
  console.log('Script parsed and initialized in VM successfully.\n');
} catch (e) {
  console.error('Error parsing script in VM:', e);
  process.exit(1);
}

// 1. Static HTML Checks
console.log('--- 1. Static HTML & ID Verifications ---');
assert(html.includes('id="view-clients"'), 'Section #view-clients exists in HTML');
assert(html.includes('id="crm-kpi-total"'), 'KPI #crm-kpi-total exists');
assert(html.includes('id="crm-kpi-b2b"'), 'KPI #crm-kpi-b2b exists');
assert(html.includes('id="crm-kpi-due"'), 'KPI #crm-kpi-due exists');
assert(html.includes('id="crm-kpi-spend"'), 'KPI #crm-kpi-spend exists');

assert(html.includes('id="crm-tab-ALL"'), 'Subtab button #crm-tab-ALL exists');
assert(html.includes('id="crm-tab-B2B"'), 'Subtab button #crm-tab-B2B exists');
assert(html.includes('id="crm-tab-B2C"'), 'Subtab button #crm-tab-B2C exists');
assert(html.includes('id="crm-tab-RESELLER"'), 'Subtab button #crm-tab-RESELLER exists');

assert(html.includes('id="crm-search"'), 'Search input #crm-search exists');
assert(html.includes('id="crm-count-label"'), 'Count label #crm-count-label exists');
assert(html.includes('id="crm-table-body"'), 'Tbody #crm-table-body exists');
assert(html.includes('id="modal-new-client"'), 'Modal #modal-new-client exists');
assert(html.includes('id="new-client-id"'), 'Hidden input #new-client-id exists for edit mode');
assert(html.includes('onclick="exportClientsCSV()"'), 'Export CSV button exists in header');

// 2. JavaScript Functions Availability
console.log('\n--- 2. CRM Functions in Global Scope ---');
assert(typeof context.updateCRMKpiCounters === 'function', 'updateCRMKpiCounters is defined');
assert(typeof context.renderCRMTableData === 'function', 'renderCRMTableData is defined');
assert(typeof context.filterCRMBySegment === 'function', 'filterCRMBySegment is defined');
assert(typeof context.openNewCustomerModal === 'function', 'openNewCustomerModal is defined');
assert(typeof context.openNewClientModal === 'function', 'openNewClientModal is defined');
assert(typeof context.closeNewClientModal === 'function', 'closeNewClientModal is defined');
assert(typeof context.openEditClientModal === 'function', 'openEditClientModal is defined');
assert(typeof context.submitNewClient === 'function', 'submitNewClient is defined');
assert(typeof context.deleteClient === 'function', 'deleteClient is defined');
assert(typeof context.printClientStatement === 'function', 'printClientStatement is defined');
assert(typeof context.sendClientWhatsApp === 'function', 'sendClientWhatsApp is defined');
assert(typeof context.exportClientsCSV === 'function', 'exportClientsCSV is defined');

// 3. Initial Calculations & KPIs
console.log('\n--- 3. Initial CRM Calculations & KPIs ---');
context.updateCRMKpiCounters();
const initialTotal = getMockElement('crm-kpi-total').innerText;
const initialB2B = getMockElement('crm-kpi-b2b').innerText;
const initialDue = getMockElement('crm-kpi-due').innerText;
const initialSpend = getMockElement('crm-kpi-spend').innerText;

assert(initialTotal.includes('5 comptes'), `Total clients matches 5 accounts (${initialTotal})`);
assert(initialB2B.includes('2 sociétés'), `B2B clients matches 2 companies (${initialB2B})`);
assert(initialDue.includes('400') && initialDue.includes('000'), `Total due matches 400 000 F CFA (${initialDue})`);
assert(initialSpend.includes('26') && initialSpend.includes('355'), `Total spend matches 26 355 000 F CFA (${initialSpend})`);

// 4. Rendering CRM Table
console.log('\n--- 4. Rendering CRM Clients Table ---');
context.renderCRMTableData();
const tableHtml = getMockElement('crm-table-body').innerHTML;
assert(tableHtml.includes('ENTREPRISE BATI-PLUS') && tableHtml.includes('Hôtel Somgandé') && tableHtml.includes('Quincaillerie Moderne'), 'Table displays B2B and Reseller clients');
assert(tableHtml.includes('Ibrahim Ouedraogo') && tableHtml.includes('Salif Sanogo'), 'Table displays B2C individual clients');
assert(tableHtml.includes('printClientStatement') && tableHtml.includes('sendClientWhatsApp') && tableHtml.includes('openEditClientModal') && tableHtml.includes('deleteClient'), 'Table renders all 4 action buttons per row');

// 5. Segmentation & Search Filters
console.log('\n--- 5. Dynamic Segmentation & Search Filtering ---');
// Filter B2B
context.filterCRMBySegment('B2B');
let b2bHtml = getMockElement('crm-table-body').innerHTML;
assert(b2bHtml.includes('BATI-PLUS') && b2bHtml.includes('Somgandé') && !b2bHtml.includes('Ibrahim Ouedraogo'), 'Segment filter B2B shows only corporate accounts');

// Filter B2C
context.filterCRMBySegment('B2C');
let b2cHtml = getMockElement('crm-table-body').innerHTML;
assert(b2cHtml.includes('Ibrahim Ouedraogo') && b2cHtml.includes('Salif Sanogo') && !b2cHtml.includes('BATI-PLUS'), 'Segment filter B2C shows only retail accounts');

// Filter RESELLER
context.filterCRMBySegment('RESELLER');
let resHtml = getMockElement('crm-table-body').innerHTML;
assert(resHtml.includes('Quincaillerie Moderne') && !resHtml.includes('BATI-PLUS'), 'Segment filter RESELLER shows only wholesalers');

// Restore ALL
context.filterCRMBySegment('ALL');
let allHtml = getMockElement('crm-table-body').innerHTML;
assert(allHtml.includes('BATI-PLUS') && allHtml.includes('Ibrahim Ouedraogo') && allHtml.includes('Quincaillerie Moderne'), 'Segment filter ALL restores full list');

// Text search
getMockElement('crm-search').value = 'BATI';
context.renderCRMTableData();
let searchHtml = getMockElement('crm-table-body').innerHTML;
assert(searchHtml.includes('BATI-PLUS') && !searchHtml.includes('Quincaillerie Moderne'), 'Text search filters to BATI-PLUS');

// Reset search
getMockElement('crm-search').value = '';
context.renderCRMTableData();

// 6. Interactive Operations (New Client, Edit, Statement Print, WhatsApp, CSV, Delete)
console.log('\n--- 6. Interactive CRM Operations ---');

// Open and Close Modal
context.openNewCustomerModal();
assert(!getMockElement('modal-new-client').classList.contains('hidden'), 'openNewCustomerModal shows modal');
context.closeNewClientModal();
assert(getMockElement('modal-new-client').classList.contains('hidden'), 'closeNewClientModal hides modal');

// Add New B2B Client
getMockElement('new-client-id').value = '';
getMockElement('new-client-name').value = 'Société Faso Travaux SARL';
getMockElement('new-client-category').value = 'B2B';
getMockElement('new-client-ifu').value = '00159846200B';
getMockElement('new-client-phone').value = '+226 70 99 11 22';
getMockElement('new-client-whatsapp').value = '+226 70 99 11 22';
getMockElement('new-client-city').value = 'Ouagadougou';
getMockElement('new-client-credit-limit').value = '2000000';

context.submitNewClient();

assert(context.window.CRM_CLIENTS_DATA.length === 6, 'CRM_CLIENTS_DATA array incremented to 6');
const totalAfterAdd = getMockElement('crm-kpi-total').innerText;
assert(totalAfterAdd.includes('6 comptes'), `Total accounts KPI updated to 6 (${totalAfterAdd})`);
const b2bAfterAdd = getMockElement('crm-kpi-b2b').innerText;
assert(b2bAfterAdd.includes('3 sociétés'), `B2B accounts KPI updated to 3 (${b2bAfterAdd})`);

// Edit Client Mode
const addedClient = context.window.CRM_CLIENTS_DATA.find(c => c.name === 'Société Faso Travaux SARL');
assert(!!addedClient, 'Added client found in array');

context.openEditClientModal(addedClient.id);
assert(getMockElement('new-client-id').value === addedClient.id, 'openEditClientModal loads client ID into hidden input');
assert(getMockElement('modal-client-title').innerText === 'Modifier la Fiche Client', 'Modal title adapts to edit mode');

// Update credit limit to 3 500 000 F CFA
getMockElement('new-client-credit-limit').value = '3500000';
context.submitNewClient();

assert(addedClient.limit === 3500000, `Client credit limit updated to 3 500 000 F CFA (${addedClient.limit})`);
assert(context.window.CRM_CLIENTS_DATA.length === 6, 'Edition mode updated in place without duplicate');

// Print Client Account Statement A4
const initialWindows = openedWindows.length;
context.printClientStatement(addedClient.id);
assert(openedWindows.length > initialWindows, 'printClientStatement creates printable window');
const lastWin = openedWindows[openedWindows.length - 1];
assert(lastWin.content.includes('RELEVÉ DE COMPTE CLIENT') && lastWin.content.includes('Société Faso Travaux SARL') && lastWin.content.includes('3 500 000'), 'Statement HTML contains company header, client name, and credit limit');

// Send Client WhatsApp
const initialWaWindows = openedWindows.length;
context.sendClientWhatsApp(addedClient.id);
assert(openedWindows.length > initialWaWindows, 'sendClientWhatsApp generates WhatsApp link');
const waWin = openedWindows[openedWindows.length - 1];
assert(waWin.url.includes('wa.me/22670991122'), 'WhatsApp URL targets client phone number');

// Export CSV
const initialBlobs = downloadedBlobs.length;
context.exportClientsCSV();
assert(downloadedBlobs.length > initialBlobs, 'exportClientsCSV creates downloadable CSV file');
const csvBlob = downloadedBlobs[downloadedBlobs.length - 1];
assert(csvBlob.content.includes('Société Faso Travaux SARL') && csvBlob.content.includes('00159846200B'), 'CSV content contains new client record');

// Delete Client
context.deleteClient(addedClient.id);
assert(context.window.CRM_CLIENTS_DATA.length === 5, 'Client removed, count returns to 5');
assert(!context.window.CRM_CLIENTS_DATA.some(c => c.id === addedClient.id), 'Deleted client absent from array');
const totalAfterDel = getMockElement('crm-kpi-total').innerText;
assert(totalAfterDel.includes('5 comptes'), `Total accounts KPI returns to 5 (${totalAfterDel})`);

// View Navigation Test
context.switchView('clients');
assert(getMockElement('page-title').innerText === 'Clients & CRM', 'switchView updates page title');
assert(getMockElement('breadcrumb-active').innerText === 'Clients & CRM', 'switchView updates breadcrumb');

console.log('\n====================================================');
console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (0 ERRORS)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
