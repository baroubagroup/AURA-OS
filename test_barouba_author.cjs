const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('================================================================');
console.log('  TEST SUITE: BAROUBA GROUP — VUE DÉDIÉE & ÉDITEUR OFFICIEL     ');
console.log('================================================================\n');

const htmlPath = fs.existsSync('aura-pos/index.html') ? 'aura-pos/index.html' : 'index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('--- 1. Static DOM & Architecture Verification ---');

assert(html.includes('id="view-about"'), '#view-about exists as an independent top-level page-view section');
console.log('  [PASS] #1: Independent top-level view #view-about exists');

assert(html.includes('id="nav-about"'), '#nav-about exists in sidebar navigation');
console.log('  [PASS] #2: Sidebar navigation button #nav-about exists');

assert(!html.includes('id="settings-tab-about"'), '#settings-tab-about removed from settings (independent view)');
console.log('  [PASS] #3: Settings subtab correctly removed (now independent top-level view)');

assert(!html.includes('id="subview-settings-about"'), '#subview-settings-about removed from inside view-settings');
console.log('  [PASS] #4: Settings subview correctly decoupled');

assert(html.includes('id="modal-about-barouba"'), '#modal-about-barouba exists in DOM');
console.log('  [PASS] #5: Prestigious modal #modal-about-barouba exists');

assert(html.includes('Cette solution est fièrement conçue et éditée au Burkina Faso par'), 'Core identity sentence 1 exists');
assert(html.includes('Au service de la performance des entreprises, nous bâtissons des architectures numériques robustes, conformes aux standards internationaux de sécurité et de scalabilité.'), 'Core identity sentence 2 exists');
console.log('  [PASS] #6: Exact official author presentation text exists verbatim');

assert(html.includes('contact@baroubagroup.com'), 'Official contact email exists');
console.log('  [PASS] #7: Official email contact@baroubagroup.com is wired');

assert(html.includes('© BAROUBA GROUP. Tous droits réservés.'), 'Official copyright notice exists');
console.log('  [PASS] #8: Exact copyright notice "© BAROUBA GROUP. Tous droits réservés." exists');

assert(html.includes('barouba-group-logo.png'), 'Official BAROUBA GROUP circular logo is referenced');
console.log('  [PASS] #9: Official restored BAROUBA GROUP logo image is linked in DOM');

assert(html.includes("switchView('about')"), "switchView('about') trigger exists in sidebar & launchpad");
console.log('  [PASS] #10: Desktop Tile & Sidebar trigger switchView("about") directly');

console.log('\n--- 2. Functional JavaScript Logic Verification ---');
const elements = {
  'view-about': { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  'nav-about': { classList: { remove: () => {}, add: () => {} } },
  'modal-about-barouba': { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  'toast-container': { appendChild: () => {}, removeChild: () => {} },
  'page-title': { innerText: '' },
  'breadcrumb-active': { innerText: '' }
};

let toastMsg = '';
const mockWindow = {
  document: {
    getElementById: (id) => elements[id] || { classList: { remove: () => {}, add: () => {} }, appendChild: () => {}, removeChild: () => {} },
    querySelectorAll: () => [],
    createElement: () => ({ select: () => {}, style: {}, appendChild: () => {}, classList: { add: () => {} } }),
    body: { appendChild: () => {}, removeChild: () => {} },
    addEventListener: () => {}
  },
  navigator: {
    clipboard: {
      writeText: (t) => Promise.resolve(t)
    }
  },
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  showToast: (msg) => { toastMsg = msg; },
  CURRENT_OPERATOR: { role: 'Caissier' },
  ROLE_PERMISSIONS: { 'Caissier': ['pos', 'dashboard'] }
};
mockWindow.window = mockWindow;

const scriptContent = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = vm.createContext(mockWindow);
vm.runInContext(scriptContent, sandbox);

assert(typeof sandbox.canUserAccessView === 'function', 'canUserAccessView is defined');
assert.strictEqual(sandbox.canUserAccessView('about'), true, 'canUserAccessView("about") allows all operators');
console.log('  [PASS] #11: canUserAccessView("about") grants public visibility');

assert(typeof sandbox.switchView === 'function', 'switchView is defined');
sandbox.switchView('about');
assert(elements['page-title'].innerText.includes('BAROUBA GROUP'), 'Page title updated for about view');
console.log('  [PASS] #12: switchView("about") executes cleanly and sets page title');

assert(typeof sandbox.openAboutBaroubaModal === 'function', 'openAboutBaroubaModal is defined');
sandbox.openAboutBaroubaModal();
console.log('  [PASS] #13: openAboutBaroubaModal() executes cleanly');

assert(typeof sandbox.closeAboutBaroubaModal === 'function', 'closeAboutBaroubaModal is defined');
sandbox.closeAboutBaroubaModal();
console.log('  [PASS] #14: closeAboutBaroubaModal() executes cleanly');

assert(typeof sandbox.copyBaroubaEmail === 'function', 'copyBaroubaEmail is defined');
sandbox.copyBaroubaEmail();
console.log('  [PASS] #15: copyBaroubaEmail() executes cleanly');

console.log('\n================================================================');
console.log('  BAROUBA GROUP INDEPENDENT VIEW TESTS: ALL 15/15 PASSED!       ');
console.log('================================================================\n');
process.exit(0);
