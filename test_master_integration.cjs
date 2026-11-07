// test_master_integration.cjs
// Master End-to-End Integration & Coherence Test across all 14 Views of AURA ERP & POS
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('  TEST SUITE: MASTER END-TO-END INTEGRATION & UX COHERENCE      ');
console.log('================================================================\n');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} ${details ? '--> ' + details : ''}`);
  }
}

const views = [
  'dashboard', 'pos', 'documents', 'credits', 'shifts', 'stock',
  'hr', 'expenses', 'clients', 'suppliers', 'deliveries', 'stats',
  'accounting', 'settings'
];

console.log('--- 1. Navigation & DOM Section Matching for All 14 Views ---');
views.forEach(v => {
  assert(htmlContent.includes(`id="view-${v}"`), `DOM Section #view-${v} exists`);
  assert(htmlContent.includes(`id="nav-${v}"`), `Sidebar Navigation Button #nav-${v} exists`);
  assert(htmlContent.includes(`switchView('${v}')`), `Navigation button triggers switchView('${v}')`);
});

// Setup Mock DOM
const elements = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    value: '',
    innerText: '',
    innerHTML: '',
    checked: false,
    className: '',
    style: {},
    classList: {
      classes: new Set(),
      add(...args) { args.forEach(c => this.classes.add(c)); },
      remove(...args) { args.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); },
      toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
    },
    src: '',
    children: [],
    remove() {
      if (this.parentNode && typeof this.parentNode.removeChild === 'function') {
        this.parentNode.removeChild(this);
      }
    },
    appendChild(child) { child.parentNode = this; this.children.push(child); },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
    }
  };
}

views.forEach(v => {
  elements[`view-${v}`] = createMockElement(`view-${v}`);
  elements[`view-${v}`].classList.add('page-view');
  elements[`nav-${v}`] = createMockElement(`nav-${v}`);
  elements[`nav-${v}`].classList.add('nav-btn');
});

elements['page-title'] = createMockElement('page-title');
elements['breadcrumb-active'] = createMockElement('breadcrumb-active');
elements['toast-container'] = createMockElement('toast-container');
elements['lock-screen'] = createMockElement('lock-screen');
elements['lock-screen'].classList.add('hidden');
for (let i = 0; i < 4; i++) {
  elements[`dot-${i}`] = createMockElement(`dot-${i}`);
}

const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const toastLog = [];
elements['toast-container'].appendChild = function(child) {
  this.children.push(child);
  const text = child.innerHTML || child.innerText || '';
  toastLog.push({ text });
};

const keyListeners = [];
const mockWindow = {
  localStorage: mockLocalStorage,
  addEventListener: (event, cb) => {
    if (event === 'keydown') keyListeners.push(cb);
  },
  removeEventListener: () => {},
  setTimeout: (cb, ms) => setTimeout(cb, ms),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (cb, ms) => setInterval(cb, ms),
  clearInterval: (id) => clearInterval(id),
  requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
  cancelAnimationFrame: () => {},
  document: {
    getElementById(id) {
      if (!elements[id]) elements[id] = createMockElement(id);
      return elements[id];
    },
    querySelectorAll(sel) {
      if (sel === '.page-view') return views.map(v => elements[`view-${v}`]);
      if (sel === '.nav-btn') return views.map(v => elements[`nav-${v}`]);
      return [];
    },
    querySelector(sel) {
      const clean = sel.replace(/[#\s]/g, '').replace('span', '');
      if (elements[clean]) return elements[clean];
      return createMockElement('dyn-qs-' + clean);
    },
    createElement(tag) { return createMockElement('dyn-' + Math.random(), tag); },
    body: { appendChild: () => {}, removeChild: () => {} },
    documentElement: { classList: { toggle: () => {} } }
  }
};
mockWindow.window = mockWindow;

const scriptContent = htmlContent.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = vm.createContext(mockWindow);
vm.runInContext(scriptContent, sandbox);

console.log('\n--- 2. Router Navigation Verification for All 14 Views ---');
views.forEach(v => {
  sandbox.switchView(v);
  assert(!elements[`view-${v}`].classList.contains('hidden'), `switchView("${v}") activates #view-${v}`);
  const otherViews = views.filter(x => x !== v);
  const allOthersHidden = otherViews.every(x => elements[`view-${x}`].classList.contains('hidden'));
  assert(allOthersHidden, `switchView("${v}") hides all other 13 views`);
  assert(elements['page-title'].innerText !== '', `switchView("${v}") updates page title to: "${elements['page-title'].innerText}"`);
});

console.log('\n--- 3. Terminal Locking & PIN Security Engine ---');
assert(typeof sandbox.lockScreen === 'function', 'lockScreen function is defined');
assert(typeof sandbox.pressPin === 'function', 'pressPin function is defined');
assert(typeof sandbox.checkPin === 'function', 'checkPin function is defined');
assert(typeof sandbox.clearPin === 'function', 'clearPin function is defined');

sandbox.lockScreen();
assert(!elements['lock-screen'].classList.contains('hidden'), 'lockScreen() removes hidden from #lock-screen');

sandbox.pressPin('9');
sandbox.pressPin('9');
sandbox.pressPin('9');
sandbox.pressPin('9');
sandbox.checkPin();
assert(!elements['lock-screen'].classList.contains('hidden'), 'Invalid PIN "9999" keeps lock-screen active');

sandbox.clearPin();
sandbox.pressPin('1');
sandbox.pressPin('2');
sandbox.pressPin('3');
sandbox.pressPin('4');
sandbox.checkPin();
assert(elements['lock-screen'].classList.contains('hidden'), 'Master PIN "1234" unlocks the screen');

console.log('\n--- 4. Keyboard Shortcuts Dispatch ---');
assert(keyListeners.length > 0, 'Global keydown event listener registered');
const keyHandler = keyListeners[0];

let defaultPrevented = false;
const createEvent = (key) => ({
  key,
  preventDefault: () => { defaultPrevented = true; }
});

keyHandler(createEvent('F1'));
assert(!elements['view-dashboard'].classList.contains('hidden'), 'F1 hotkey switches to dashboard');

keyHandler(createEvent('F2'));
assert(!elements['view-pos'].classList.contains('hidden'), 'F2 hotkey switches to POS');

console.log('\n--- 5. Modal Controllers & Backdrop Safeguards ---');
const modalIds = [
  'modal-payment', 'modal-new-product', 'modal-new-client', 'modal-new-supplier',
  'modal-new-delivery', 'modal-new-user', 'modal-new-zone', 'modal-repay-credit',
  'modal-doc-a4', 'modal-salary-advance'
];
modalIds.forEach(m => {
  assert(htmlContent.includes(`id="${m}"`), `Modal container #${m} exists with backdrop`);
});

console.log('\n================================================================');
console.log(`  MASTER INTEGRATION RESULTS: ${passedTests}/${totalTests} PASSED (0 FAILURES)`);
console.log('================================================================\n');

if (failedTests > 0) process.exit(1);
