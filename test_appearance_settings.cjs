const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('================================================================');
console.log('  TEST SUITE: PARAMÈTRES ASSAINIS & DÉCOMMISSIONNEMENT BUREAU OS ');
console.log('================================================================\n');

const htmlPath = fs.existsSync('aura-pos/index.html') ? 'aura-pos/index.html' : 'index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Audit DOM Elements: Decommissioning Verification
console.log('--- 1. Decommissioning & Cleanup Audit ---');
assert(!html.includes('id="settings-tab-appearance"'), '#settings-tab-appearance is cleanly decommissioned from tab bar');
console.log('  [PASS] #1: Tab button #settings-tab-appearance cleanly removed');

assert(!html.includes('id="subview-settings-appearance"'), '#subview-settings-appearance dead DOM container is cleanly removed');
console.log('  [PASS] #2: Obsolete subview #subview-settings-appearance removed (23KB dead code cleared)');

assert(!html.includes('8. Bureau & Dock OS'), 'Mention "8. Bureau & Dock OS" is removed');
console.log('  [PASS] #3: Obsolete "8. Bureau & Dock OS" text removed');

assert(html.includes('id="payroll-primes-list-container"'), '#payroll-primes-list-container exists for dynamic company primes');
console.log('  [PASS] #4: Dynamic payroll primes container exists in settings');

assert(html.includes('id="new-prime-name"'), '#new-prime-name input exists');
assert(html.includes('id="new-prime-amount"'), '#new-prime-amount input exists');
console.log('  [PASS] #5: Add new prime/indemnity category inputs exist');

assert(html.includes('addCustomPayrollPrimeCategory()'), 'addCustomPayrollPrimeCategory() is wired');
console.log('  [PASS] #6: addCustomPayrollPrimeCategory() action is wired');

// 2. Functional & Logic Verification in VM
console.log('\n--- 2. Functional Logic & Persistence Verification ---');

const elements = {};
function createMockEl(id) {
  return {
    id,
    classList: {
      set: new Set(),
      add(...args) { args.forEach(c => this.set.add(c)); },
      remove(...args) { args.forEach(c => this.set.delete(c)); },
      contains(c) { return this.set.has(c); }
    },
    style: { display: '', background: '' },
    checked: true,
    value: '',
    innerHTML: '',
    innerText: '',
    addEventListener: () => {},
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null
  };
}

const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const mockDoc = {
  body: {
    classList: {
      set: new Set(),
      add(...args) { args.forEach(c => this.set.add(c)); },
      remove(...args) { args.forEach(c => this.set.delete(c)); },
      contains(c) { return this.set.has(c); }
    },
    appendChild: () => {},
    removeChild: () => {}
  },
  createElement(tag) {
    return createMockEl('dyn-' + Math.random());
  },
  getElementById(id) {
    if (!elements[id]) elements[id] = createMockEl(id);
    return elements[id];
  },
  querySelector(sel) {
    return createMockEl('sel-' + Math.random());
  },
  addEventListener: () => {}
};

const sandbox = {
  document: mockDoc,
  localStorage: mockLocalStorage,
  window: {},
  addEventListener: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  showToast: (msg, type) => { sandbox.lastToast = { msg, type }; },
  lastToast: null,
  console: console
};
sandbox.window = sandbox;
sandbox.window.addEventListener = () => {};

// Extract scripts from index.html
const scriptMatches = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
let combinedScript = '';
if (scriptMatches) {
  scriptMatches.forEach(m => {
    const raw = m.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
    combinedScript += raw + '\n';
  });
}

vm.createContext(sandbox);
vm.runInContext(combinedScript, sandbox);

// Test dynamic primes management functions
assert(typeof sandbox.renderPayrollPrimesSettings === 'function', 'renderPayrollPrimesSettings is defined');
console.log('  [PASS] #7: renderPayrollPrimesSettings is a defined function');

assert(typeof sandbox.addCustomPayrollPrimeCategory === 'function', 'addCustomPayrollPrimeCategory is defined');
console.log('  [PASS] #8: addCustomPayrollPrimeCategory is a defined function');

assert(typeof sandbox.removeCustomPayrollPrimeCategory === 'function', 'removeCustomPayrollPrimeCategory is defined');
console.log('  [PASS] #9: removeCustomPayrollPrimeCategory is a defined function');

assert(typeof sandbox.updateCustomPayrollPrimeAmount === 'function', 'updateCustomPayrollPrimeAmount is defined');
console.log('  [PASS] #10: updateCustomPayrollPrimeAmount is a defined function');

// Test adding a custom category (e.g. Prime de Santé)
sandbox.document.getElementById('new-prime-name').value = 'Prime de Santé';
sandbox.document.getElementById('new-prime-amount').value = '15000';
sandbox.addCustomPayrollPrimeCategory();

const currentPrimes = sandbox.SYSTEM_SETTINGS.payrollPrimes;
const santePrime = currentPrimes.find(p => p.name === 'Prime de Santé');
assert(santePrime, 'Prime de Santé successfully added to SYSTEM_SETTINGS.payrollPrimes');
assert(santePrime.amount === 15000, 'Prime de Santé has correct amount 15000');
console.log('  [PASS] #11: addCustomPayrollPrimeCategory correctly added "Prime de Santé" (15 000 F)');

// Test updating prime amount
sandbox.updateCustomPayrollPrimeAmount(santePrime.id, 20000);
assert(santePrime.amount === 20000, 'Prime amount updated to 20000');
console.log('  [PASS] #12: updateCustomPayrollPrimeAmount updated amount to 20 000 F');

// Test removing prime
sandbox.removeCustomPayrollPrimeCategory(santePrime.id);
const stillExists = sandbox.SYSTEM_SETTINGS.payrollPrimes.some(p => p.id === santePrime.id);
assert(!stillExists, 'Prime de Santé successfully removed');
console.log('  [PASS] #13: removeCustomPayrollPrimeCategory successfully removed category');

// Test switchSettingsTab
assert(typeof sandbox.switchSettingsTab === 'function', 'switchSettingsTab is defined');
sandbox.switchSettingsTab('payroll');
assert(!elements['subview-settings-payroll'].classList.contains('hidden'), 'Payroll subview is activated');
assert(elements['subview-settings-general'].classList.contains('hidden'), 'General subview is hidden');
console.log('  [PASS] #14: switchSettingsTab("payroll") activates payroll settings tab cleanly');

sandbox.switchSettingsTab('general');
assert(!elements['subview-settings-general'].classList.contains('hidden'), 'General subview is activated');
console.log('  [PASS] #15: switchSettingsTab("general") activates general settings tab cleanly');

console.log('\n================================================================');
console.log('  ALL SETTINGS ASSAINISSEMENT & DYNAMIC PRIMES TESTS PASSED! (15/15)');
console.log('================================================================');
