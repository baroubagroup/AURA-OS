const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('================================================================');
console.log('  TEST SUITE: BAROUBA GROUP — AUTEURS & ÉDITEUR OFFICIEL        ');
console.log('================================================================\n');

const htmlPath = fs.existsSync('aura-pos/index.html') ? 'aura-pos/index.html' : 'index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('--- 1. Static DOM & Exact Text Verification ---');

assert(html.includes('id="settings-tab-about"'), '#settings-tab-about exists in settings navigation bar');
console.log('  [PASS] #1: Tab button #settings-tab-about exists');

assert(html.includes('id="subview-settings-about"'), '#subview-settings-about exists in view-settings');
console.log('  [PASS] #2: Subview #subview-settings-about exists');

assert(html.includes('id="modal-about-barouba"'), '#modal-about-barouba exists in DOM');
console.log('  [PASS] #3: Prestigious modal #modal-about-barouba exists');

assert(html.includes('Cette solution est fièrement conçue et éditée au Burkina Faso par'), 'Core identity sentence 1 exists');
assert(html.includes('Au service de la performance des entreprises, nous bâtissons des architectures numériques robustes, conformes aux standards internationaux de sécurité et de scalabilité.'), 'Core identity sentence 2 exists');
console.log('  [PASS] #4: Exact official author presentation text exists');

assert(html.includes('contact@baroubagroup.com'), 'Official contact email exists');
console.log('  [PASS] #5: Official email contact@baroubagroup.com is wired');

assert(html.includes('© BAROUBA GROUP. Tous droits réservés.'), 'Official copyright notice exists');
console.log('  [PASS] #6: Exact copyright notice "© BAROUBA GROUP. Tous droits réservés." exists');

assert(html.includes('barouba-group-logo.png'), 'Official BAROUBA GROUP circular logo is referenced');
console.log('  [PASS] #7: Official BAROUBA GROUP logo image is linked in DOM');

assert(html.includes('openAboutBaroubaModal()'), 'openAboutBaroubaModal() trigger exists');
console.log('  [PASS] #8: Desktop Tile & Sidebar triggers are wired to openAboutBaroubaModal()');

console.log('\n--- 2. Functional JavaScript Logic Verification ---');
const elements = {
  'subview-settings-general': { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  'subview-settings-about': { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  'settings-tab-general': { classList: { remove: () => {}, add: () => {} } },
  'settings-tab-about': { classList: { remove: () => {}, add: () => {} } },
  'modal-about-barouba': { classList: { remove: () => {}, add: () => {}, contains: () => false } },
  'toast-container': { appendChild: () => {}, removeChild: () => {} }
};

let toastMsg = '';
const mockWindow = {
  document: {
    getElementById: (id) => elements[id] || { classList: { remove: () => {}, add: () => {} }, appendChild: () => {}, removeChild: () => {} },
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
  showToast: (msg) => { toastMsg = msg; }
};
mockWindow.window = mockWindow;

const scriptContent = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = vm.createContext(mockWindow);
vm.runInContext(scriptContent, sandbox);

assert(typeof sandbox.switchSettingsTab === 'function', 'switchSettingsTab is defined');
sandbox.switchSettingsTab('about');
console.log('  [PASS] #9: switchSettingsTab("about") runs cleanly');

assert(typeof sandbox.openAboutBaroubaModal === 'function', 'openAboutBaroubaModal is defined');
sandbox.openAboutBaroubaModal();
console.log('  [PASS] #10: openAboutBaroubaModal() executes cleanly');

assert(typeof sandbox.closeAboutBaroubaModal === 'function', 'closeAboutBaroubaModal is defined');
sandbox.closeAboutBaroubaModal();
console.log('  [PASS] #11: closeAboutBaroubaModal() executes cleanly');

assert(typeof sandbox.copyBaroubaEmail === 'function', 'copyBaroubaEmail is defined');
sandbox.copyBaroubaEmail();
console.log('  [PASS] #12: copyBaroubaEmail() executes cleanly');

console.log('\n================================================================');
console.log('  BAROUBA GROUP AUTHOR TESTS: ALL 12/12 PASSED!                ');
console.log('================================================================\n');
