const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log(' TEST SUITE : BALANCE 6 CHIFFRES & JOURNAL D\'AUDIT  ');
console.log('====================================================\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function assert(cond, msg) {
  if (!cond) {
    console.error('[FAIL] ' + msg);
    process.exit(1);
  }
  console.log('[PASS] ' + msg);
}

// 1. Static HTML checks
assert(html.includes('id="subview-acc-six-digits-balance"'), 'subview-acc-six-digits-balance container exists in HTML');
assert(html.includes('id="six-digits-balance-tbody"'), 'six-digits-balance-tbody table body exists');
assert(html.includes('id="six-digits-balance-tfoot"'), 'six-digits-balance-tfoot table footer exists');
assert(html.includes('id="acc-tab-six-digits-balance"'), 'acc-tab-six-digits-balance button exists');
assert(html.includes('id="view-audit"'), 'view-audit section exists');
assert(html.includes('id="audit-logs-body"'), 'audit-logs-body table body exists');
assert(html.includes('id="audit-search"'), 'audit-search input exists');
assert(html.includes('id="audit-filter-cat"'), 'audit-filter-cat select exists');

// 2. Behavioral DOM mock tests
const elements = {};
function getOrCreate(id) {
  if (!elements[id]) {
    elements[id] = {
      id: id,
      classList: {
        classes: new Set(),
        add: function(...c) { c.forEach(x => this.classes.add(x)); },
        remove: function(...c) { c.forEach(x => this.classes.delete(x)); },
        contains: function(c) { return this.classes.has(c); }
      },
      value: '',
      innerText: '',
      innerHTML: '',
      style: {}
    };
  }
  return elements[id];
}

const mockDoc = {
  getElementById: function(id) {
    return getOrCreate(id);
  },
  querySelectorAll: function(sel) {
    return [];
  },
  readyState: 'complete',
  addEventListener: function() {},
  body: {
    classList: {
      classes: new Set(),
      add: function(c) { this.classes.add(c); },
      remove: function(c) { this.classes.delete(c); },
      contains: function(c) { return this.classes.has(c); }
    }
  }
};

const context = {
  document: mockDoc,
  window: {},
  addEventListener: function() {},
  console: console,
  setTimeout: setTimeout,
  setInterval: () => 1,
  clearTimeout: clearTimeout,
  clearInterval: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};
context.window = context;
context.window.addEventListener = function() {};

// Extract script from index.html
const scriptMatch = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
assert(scriptMatch && scriptMatch.length > 0, 'Inline scripts extracted from index.html');

const allScripts = scriptMatch.map(s => s.replace(/<\/?script[^>]*>/gi, '')).join('\n');

try {
  vm.createContext(context);
  vm.runInContext(allScripts, context);
  console.log('[PASS] Full script executed without error in VM context');
} catch (e) {
  console.error('[FAIL] Script execution error:', e);
  process.exit(1);
}

// 3. Test switchAccountingTab('six-digits-balance')
assert(typeof context.switchAccountingTab === 'function', 'switchAccountingTab is defined');
assert(typeof context.renderSixDigitsBalance === 'function', 'renderSixDigitsBalance is defined');

context.switchAccountingTab('six-digits-balance');
const sixView = getOrCreate('subview-acc-six-digits-balance');
assert(!sixView.classList.contains('hidden'), 'subview-acc-six-digits-balance is visible after switchAccountingTab');
assert(getOrCreate('six-digits-balance-tbody').innerHTML.includes('101100'), 'six-digits-balance-tbody rendered account 101100');
assert(getOrCreate('six-digits-balance-tbody').innerHTML.includes('571100'), 'six-digits-balance-tbody rendered account 571100');
assert(getOrCreate('six-digits-balance-tfoot').innerHTML.includes('TOTAUX ÉQUILIBRÉS'), 'six-digits-balance-tfoot confirms balanced totals');

// 4. Test renderAuditTable and filterAuditLogs
assert(typeof context.renderAuditTable === 'function', 'renderAuditTable is defined');
assert(typeof context.filterAuditLogs === 'function', 'filterAuditLogs is defined');
assert(Array.isArray(context.SYSTEM_AUDIT_LOGS) && context.SYSTEM_AUDIT_LOGS.length > 5, 'SYSTEM_AUDIT_LOGS populated with events');

context.renderAuditTable();
const auditBody = getOrCreate('audit-logs-body');
assert(auditBody.innerHTML.includes('ENCAISSEMENT_VENTE'), 'audit-logs-body rendered sales actions');
assert(auditBody.innerHTML.includes('Aminata Sanogo') || auditBody.innerHTML.includes('Ousmane Z.'), 'audit-logs-body rendered operators');

// Test text filter
getOrCreate('audit-search').value = 'ciment';
context.filterAuditLogs();
assert(getOrCreate('audit-logs-body').innerHTML.includes('Ciment'), 'Filtering audit logs by "ciment" matches ciment stock action');

// Reset search and test category filter
getOrCreate('audit-search').value = '';
getOrCreate('audit-filter-cat').value = 'Sécurité';
context.filterAuditLogs();
assert(getOrCreate('audit-logs-body').innerHTML.includes('CONNEXION_PIN'), 'Filtering by category Sécurité displays PIN connections');

// Reset filter
getOrCreate('audit-filter-cat').value = 'ALL';
context.renderAuditTable();

// 5. Test switchView('audit')
assert(typeof context.switchView === 'function', 'switchView is defined');
context.switchView('audit');
const titleEl = getOrCreate('page-title');
assert(titleEl.innerText.includes('Journal d\'Audit'), 'switchView("audit") sets page title to Journal d\'Audit (got: "' + titleEl.innerText + '")');
assert(!titleEl.innerText.includes('Plateforme'), 'switchView("audit") does NOT default to Plateforme');

console.log('\n====================================================');
console.log(' ALL 20/20 TESTS PASSED (BALANCE 6 & AUDIT)');
console.log('====================================================');
process.exit(0);
