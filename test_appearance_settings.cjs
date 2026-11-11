const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('================================================================');
console.log('  TEST SUITE: BUREAU & DOCK OS / WALLPAPERS & CUSTOMIZATION     ');
console.log('================================================================\n');

const htmlPath = fs.existsSync('aura-pos/index.html') ? 'aura-pos/index.html' : 'index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Audit DOM Elements
console.log('--- 1. DOM Elements & Templates Audit ---');
assert(html.includes('id="settings-tab-appearance"'), '#settings-tab-appearance exists in tab bar');
console.log('  [PASS] #1: Tab button #settings-tab-appearance exists');

assert(html.includes('id="subview-settings-appearance"'), '#subview-settings-appearance exists');
console.log('  [PASS] #2: Subview #subview-settings-appearance exists');

assert(html.includes('id="dock-opt-bottom"'), '#dock-opt-bottom exists');
assert(html.includes('id="dock-opt-left"'), '#dock-opt-left exists');
assert(html.includes('id="dock-opt-right"'), '#dock-opt-right exists');
assert(html.includes('id="dock-opt-top"'), '#dock-opt-top exists');
console.log('  [PASS] #3: All 4 dock position options exist in settings');

assert(html.includes('id="wallpaper-bigsur-svg"'), '#wallpaper-bigsur-svg exists');
console.log('  [PASS] #4: macOS Big Sur Chromatic Waves SVG artwork embedded');

assert(html.includes('id="dock-pin-caisse"'), '#dock-pin-caisse exists');
assert(html.includes('id="dock-pin-stock"'), '#dock-pin-stock exists');
assert(html.includes('id="dock-pin-clients"'), '#dock-pin-clients exists');
console.log('  [PASS] #5: Dock pinned app toggle checkboxes exist');

assert(html.includes('id="setting-custom-wp-input"'), '#setting-custom-wp-input exists');
console.log('  [PASS] #6: Custom wallpaper file input exists');

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

// Test setAuraDockPosition
assert(typeof sandbox.setAuraDockPosition === 'function', 'setAuraDockPosition is a function');
console.log('  [PASS] #7: setAuraDockPosition is defined');

sandbox.setAuraDockPosition('left');
assert(sandbox.document.body.classList.contains('dock-pos-left'), 'body has dock-pos-left');
assert(!sandbox.document.body.classList.contains('dock-pos-bottom'), 'body does not have dock-pos-bottom');
assert(sandbox.localStorage.getItem('aura_dock_position') === 'left', 'Dock position persisted to localStorage');
console.log('  [PASS] #8: setAuraDockPosition("left") correctly updates body class & localStorage');

sandbox.setAuraDockPosition('top');
assert(sandbox.document.body.classList.contains('dock-pos-top'), 'body has dock-pos-top');
assert(sandbox.localStorage.getItem('aura_dock_position') === 'top', 'Top dock position persisted');
console.log('  [PASS] #9: setAuraDockPosition("top") correctly updates body class & localStorage');

// Test setDockPinnedApp & applyDockPinnedApps
assert(typeof sandbox.setDockPinnedApp === 'function', 'setDockPinnedApp is a function');
console.log('  [PASS] #10: setDockPinnedApp is defined');

sandbox.setDockPinnedApp('stock', false);
assert(elements['dock-btn-stock'].style.display === 'none', 'Unpinned stock button is hidden');
const pinnedConfig = JSON.parse(sandbox.localStorage.getItem('aura_dock_pinned_apps'));
assert(pinnedConfig.stock === false, 'Pinned config persisted to localStorage');
console.log('  [PASS] #11: setDockPinnedApp("stock", false) hides button & updates storage');

sandbox.setDockPinnedApp('stock', true);
assert(elements['dock-btn-stock'].style.display === '', 'Re-pinned stock button is displayed');
console.log('  [PASS] #12: setDockPinnedApp("stock", true) restores button display');

// Test applyAuraWallpaperKey
assert(typeof sandbox.applyAuraWallpaperKey === 'function', 'applyAuraWallpaperKey is defined');
sandbox.applyAuraWallpaperKey('bigsur');
console.log('  [PASS] #13: applyAuraWallpaperKey("bigsur") executed cleanly');

sandbox.applyAuraWallpaperKey('canyon');
console.log('  [PASS] #14: applyAuraWallpaperKey("canyon") executed cleanly');

// Test switchSettingsTab('appearance')
assert(typeof sandbox.switchSettingsTab === 'function', 'switchSettingsTab is defined');
sandbox.switchSettingsTab('appearance');
assert(!elements['subview-settings-appearance'].classList.contains('hidden'), 'Appearance subview is shown');
assert(elements['subview-settings-general'].classList.contains('hidden'), 'General subview is hidden');
console.log('  [PASS] #15: switchSettingsTab("appearance") activates subview 8');

console.log('\n================================================================');
console.log('  ALL APPEARANCE & DOCK CUSTOMIZATION TESTS PASSED! (15/15)     ');
console.log('================================================================');
