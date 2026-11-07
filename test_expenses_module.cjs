const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 8 - DÉPENSES D\'EXPLOITATION   ');
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
  'view-expenses',
  'kpi-expenses-total', 'kpi-expenses-count',
  'kpi-expenses-cash', 'kpi-expenses-cash-sub',
  'kpi-expenses-bank', 'kpi-expenses-bank-sub',
  'kpi-expenses-top', 'kpi-expenses-top-sub',
  'expenses-search-input', 'expenses-filter-cat', 'expenses-filter-mode',
  'expenses-table-body',
  'modal-new-expense', 'modal-quick-expense',
  'quick-exp-category', 'quick-exp-beneficiary', 'quick-exp-desc', 'quick-exp-amount', 'quick-exp-mode',
  'toast-container', 'page-title', 'breadcrumb-active'
];
keyIds.forEach(id => getMockElement(id));

const documentMock = {
  getElementById: (id) => getMockElement(id),
  querySelectorAll: (selector) => {
    if (selector === '.page-view') return [getMockElement('view-expenses')];
    if (selector === '.nav-btn') return [getMockElement('nav-expenses')];
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
  },
  ACTIVE_SHIFT: { cashExpenses: 25000 }
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
assert(html.includes('id="view-expenses"'), 'Section #view-expenses exists in HTML');
assert(html.includes('id="kpi-expenses-total"'), 'KPI #kpi-expenses-total exists');
assert(html.includes('id="kpi-expenses-count"'), 'KPI #kpi-expenses-count exists');
assert(html.includes('id="kpi-expenses-cash"'), 'KPI #kpi-expenses-cash exists');
assert(html.includes('id="kpi-expenses-cash-sub"'), 'KPI #kpi-expenses-cash-sub exists');
assert(html.includes('id="kpi-expenses-bank"'), 'KPI #kpi-expenses-bank exists');
assert(html.includes('id="kpi-expenses-bank-sub"'), 'KPI #kpi-expenses-bank-sub exists');
assert(html.includes('id="kpi-expenses-top"'), 'KPI #kpi-expenses-top exists');
assert(html.includes('id="kpi-expenses-top-sub"'), 'KPI #kpi-expenses-top-sub exists');

assert(html.includes('id="expenses-search-input"'), 'Filter input #expenses-search-input exists');
assert(html.includes('id="expenses-filter-cat"'), 'Category select #expenses-filter-cat exists');
assert(html.includes('id="expenses-filter-mode"'), 'Mode select #expenses-filter-mode exists');
assert(html.includes('id="expenses-table-body"'), 'Tbody #expenses-table-body exists');
assert(html.includes('id="modal-new-expense"'), 'Modal #modal-new-expense exists');
assert(html.includes('onclick="exportExpensesCSV()"'), 'Export CSV button exists in header');

// 2. JavaScript Functions Availability
console.log('\n--- 2. Expenses Functions in Global Scope ---');
assert(typeof context.recalculateExpensesMetrics === 'function', 'recalculateExpensesMetrics is defined');
assert(typeof context.renderExpensesTable === 'function', 'renderExpensesTable is defined');
assert(typeof context.filterExpensesTable === 'function', 'filterExpensesTable is defined');
assert(typeof context.openNewExpenseModal === 'function', 'openNewExpenseModal is defined');
assert(typeof context.closeNewExpenseModal === 'function', 'closeNewExpenseModal is defined');
assert(typeof context.submitNewExpense === 'function', 'submitNewExpense is defined');
assert(typeof context.deleteExpense === 'function', 'deleteExpense is defined');
assert(typeof context.printExpenseVoucher === 'function', 'printExpenseVoucher is defined');
assert(typeof context.exportExpensesCSV === 'function', 'exportExpensesCSV is defined');

// 3. Initial Calculations & KPIs
console.log('\n--- 3. Initial Calculations & Reactive KPIs ---');
context.recalculateExpensesMetrics();
const initialTotal = getMockElement('kpi-expenses-total').innerText;
const initialCash = getMockElement('kpi-expenses-cash').innerText;
const initialBank = getMockElement('kpi-expenses-bank').innerText;
const initialCount = getMockElement('kpi-expenses-count').innerText;

assert(initialTotal.includes('560') && initialTotal.includes('000'), `Total expenses matches 560 000 F CFA (${initialTotal})`);
assert(initialCash.includes('25') && initialCash.includes('000'), `Cash expenses matches 25 000 F CFA (${initialCash})`);
assert(initialBank.includes('535') && initialBank.includes('000'), `Bank/Mobile expenses matches 535 000 F CFA (${initialBank})`);
assert(initialCount.includes('4 opération'), `Count displays 4 operations (${initialCount})`);

// 4. Rendering Table & Actions
console.log('\n--- 4. Rendering Expenses Table ---');
context.renderExpensesTable();
const tableHtml = getMockElement('expenses-table-body').innerHTML;
assert(tableHtml.includes('ampoules LED') && tableHtml.includes('SONABEL') && tableHtml.includes('Loyer Mensuel'), 'Table displays all initial expenses');
assert(tableHtml.includes('printExpenseVoucher') && tableHtml.includes('deleteExpense'), 'Action buttons for Voucher print and Delete are rendered in rows');

// 5. Dynamic Filtering
console.log('\n--- 5. Dynamic Multi-Criteria Filtering ---');
// Filter by text
getMockElement('expenses-search-input').value = 'SONABEL';
context.filterExpensesTable();
let filteredHtml = getMockElement('expenses-table-body').innerHTML;
assert(filteredHtml.includes('SONABEL') && !filteredHtml.includes('Loyer Mensuel'), 'Text filter limits to SONABEL');

// Reset search and filter by category
getMockElement('expenses-search-input').value = '';
getMockElement('expenses-filter-cat').value = '61';
context.filterExpensesTable();
filteredHtml = getMockElement('expenses-table-body').innerHTML;
assert(filteredHtml.includes('Loyer Mensuel') && !filteredHtml.includes('SONABEL'), 'Category filter limits to 61-Loyer');

// Reset category and filter by mode
getMockElement('expenses-filter-cat').value = 'ALL';
getMockElement('expenses-filter-mode').value = 'Caisse';
context.filterExpensesTable();
filteredHtml = getMockElement('expenses-table-body').innerHTML;
assert(filteredHtml.includes('ampoules LED') && filteredHtml.includes('Carburant') && !filteredHtml.includes('SONABEL'), 'Mode filter limits to Caisse Espèces');

// Reset all
getMockElement('expenses-filter-mode').value = 'ALL';
context.filterExpensesTable();
filteredHtml = getMockElement('expenses-table-body').innerHTML;
assert(filteredHtml.includes('ampoules LED') && filteredHtml.includes('SONABEL'), 'Restoring filters shows all records');

// 6. Interactive Operations (New Expense, Shift Impact, Voucher Print, Delete)
console.log('\n--- 6. Interactive Business Operations ---');

// Open and Close Modal
context.openNewExpenseModal();
assert(!getMockElement('modal-new-expense').classList.contains('hidden'), 'openNewExpenseModal shows modal');
context.closeNewExpenseModal();
assert(getMockElement('modal-new-expense').classList.contains('hidden'), 'closeNewExpenseModal hides modal');

// Add New Cash Expense
getMockElement('quick-exp-category').value = '605-Carburant & Transport';
getMockElement('quick-exp-beneficiary').value = 'TOTAL Énergies Gounghin';
getMockElement('quick-exp-desc').value = 'Carburant groupe électrogène secours';
getMockElement('quick-exp-amount').value = '30000';
getMockElement('quick-exp-mode').value = 'Caisse Espèces';

context.submitNewExpense();

assert(context.window.EXPENSES.length === 5, 'EXPENSES array incremented to 5');
const totalAfterAdd = getMockElement('kpi-expenses-total').innerText;
assert(totalAfterAdd.includes('590') && totalAfterAdd.includes('000'), `Total updated to 590 000 F CFA (${totalAfterAdd})`);
const cashAfterAdd = getMockElement('kpi-expenses-cash').innerText;
assert(cashAfterAdd.includes('55') && cashAfterAdd.includes('000'), `Cash expenses updated to 55 000 F CFA (${cashAfterAdd})`);
assert(context.window.ACTIVE_SHIFT.cashExpenses === 55000, 'Active shift cashExpenses updated with new cash payout');

// Add New Bank Expense (Wave)
getMockElement('quick-exp-category').value = '62-Fournitures & Petit outillage';
getMockElement('quick-exp-beneficiary').value = 'Imprimerie Moderne Ouaga';
getMockElement('quick-exp-desc').value = 'Impression blocs bons de commande A5';
getMockElement('quick-exp-amount').value = '50000';
getMockElement('quick-exp-mode').value = 'Wave Pro';

context.submitNewExpense();

assert(context.window.EXPENSES.length === 6, 'EXPENSES array incremented to 6');
const totalAfterWave = getMockElement('kpi-expenses-total').innerText;
assert(totalAfterWave.includes('640') && totalAfterWave.includes('000'), `Total updated to 640 000 F CFA (${totalAfterWave})`);
const bankAfterWave = getMockElement('kpi-expenses-bank').innerText;
assert(bankAfterWave.includes('585') && bankAfterWave.includes('000'), `Bank/Wave expenses updated to 585 000 F CFA (${bankAfterWave})`);

// Print Cash Voucher
const addedCashExp = context.window.EXPENSES.find(e => e.label === 'Carburant groupe électrogène secours');
assert(!!addedCashExp, 'Added cash expense located');

const initialWindows = openedWindows.length;
context.printExpenseVoucher(addedCashExp.id);
assert(openedWindows.length > initialWindows, 'printExpenseVoucher opens print preview window');
const lastWin = openedWindows[openedWindows.length - 1];
assert(lastWin.content.includes('PIÈCE DE CAISSE') && lastWin.content.includes('30') && lastWin.content.includes('TOTAL Énergies Gounghin'), 'Voucher HTML contains correct reference, beneficiary and amount');

// Export CSV
const initialBlobs = downloadedBlobs.length;
context.exportExpensesCSV();
assert(downloadedBlobs.length > initialBlobs, 'exportExpensesCSV creates downloadable CSV file');
const csvBlob = downloadedBlobs[downloadedBlobs.length - 1];
assert(csvBlob.content.includes('Carburant groupe électrogène secours') && csvBlob.content.includes('30000'), 'CSV content contains newly recorded expenses');

// Delete Expense
context.deleteExpense(addedCashExp.id);
assert(context.window.EXPENSES.length === 5, 'Expense removed, count returns to 5');
assert(!context.window.EXPENSES.some(e => e.id === addedCashExp.id), 'Deleted expense absent from EXPENSES');
const totalAfterDel = getMockElement('kpi-expenses-total').innerText;
assert(totalAfterDel.includes('610') && totalAfterDel.includes('000'), `Total updated to 610 000 F CFA after deletion (${totalAfterDel})`);

// View Navigation Test
context.switchView('expenses');
assert(getMockElement('page-title').innerText === 'Dépenses d\'Exploitation', 'switchView updates page title');
assert(getMockElement('breadcrumb-active').innerText === 'Dépenses d\'Exploitation', 'switchView updates breadcrumb');

console.log('\n====================================================');
console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (0 ERRORS)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
