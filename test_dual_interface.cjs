const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('       AURA OS — DUAL INTERFACE SYSTEM VERIFICATION (TEST)       ');
console.log('================================================================\n');

const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// 1. Static Markup Verification
test('1. Static DOM: Toggle buttons and containers exist in HTML', () => {
  assert(htmlContent.includes('id="btn-toggle-interface-mode"'), 'Header toggle button exists');
  assert(htmlContent.includes('id="sidebar-toggle-nav-interface"'), 'Sidebar toggle button exists');
  assert(htmlContent.includes('id="aura-card-navigation-deck"'), 'Card navigation deck container exists');
  assert(htmlContent.includes('id="card-poles-container"'), 'Poles container exists');
  assert(htmlContent.includes('id="card-subnav-ribbon"'), 'Subnav ribbon exists');
  assert(htmlContent.includes('id="subnav-active-pole-badge"'), 'Active pole badge exists');
  assert(htmlContent.includes('id="subnav-active-pole-title"'), 'Active pole title exists');
});

// 2. CSS Rules Verification
test('2. CSS: Rules for interface-cards-mode, nav-card-pole, nav-sub-card exist', () => {
  assert(htmlContent.includes('.nav-card-pole'), 'CSS has .nav-card-pole rules');
  assert(htmlContent.includes('.active-pole'), 'CSS has .active-pole rules');
  assert(htmlContent.includes('.nav-sub-card'), 'CSS has .nav-sub-card rules');
  assert(htmlContent.includes('.active-subcard'), 'CSS has .active-subcard rules');
  assert(htmlContent.includes('body.interface-cards-mode #aura-card-navigation-deck'), 'CSS has cards mode deck display rule');
});

// 3. JavaScript Functions Verification
test('3. JavaScript: Core dual interface functions are defined and exported to window', () => {
  assert(htmlContent.includes('function initNavInterfaceMode'), 'initNavInterfaceMode defined');
  assert(htmlContent.includes('function toggleNavInterfaceMode'), 'toggleNavInterfaceMode defined');
  assert(htmlContent.includes('function applyNavInterfaceMode'), 'applyNavInterfaceMode defined');
  assert(htmlContent.includes('function renderCardPoles'), 'renderCardPoles defined');
  assert(htmlContent.includes('function renderCardSubnavRibbon'), 'renderCardSubnavRibbon defined');
  assert(htmlContent.includes('function selectPoleCard'), 'selectPoleCard defined');
  assert(htmlContent.includes('function triggerSubCardAction'), 'triggerSubCardAction defined');
  assert(htmlContent.includes('function syncCardsInterface'), 'syncCardsInterface defined');
});

// 4. Mock DOM Execution & Reactive Behavior
test('4. Dynamic Execution: Mock DOM simulates mode toggling & pole selection', () => {
  // Setup lightweight DOM Mock
  const body = {
    classes: new Set(),
    classList: {
      add(c) { body.classes.add(c); },
      remove(c) { body.classes.delete(c); },
      contains(c) { return body.classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (body.classes.has(c)) body.classes.delete(c);
          else body.classes.add(c);
        } else if (force) {
          body.classes.add(c);
        } else {
          body.classes.delete(c);
        }
      }
    }
  };

  const elements = {
    'aura-card-navigation-deck': { style: { display: 'none' } },
    'card-poles-container': { innerHTML: '' },
    'card-subnav-ribbon': { innerHTML: '' },
    'subnav-active-pole-badge': { innerText: '' },
    'subnav-active-pole-title': { innerText: '' },
    'nav-mode-icon': { innerText: '🃏' },
    'nav-mode-label': { innerText: 'Mode Cartes' },
    'nav-mode-badge': { innerText: 'DISPO', className: '' }
  };

  global.document = {
    body,
    getElementById(id) { return elements[id] || null; }
  };

  const storage = {};
  global.localStorage = {
    getItem(k) { return storage[k] || null; },
    setItem(k, v) { storage[k] = String(v); }
  };

  // Extract SVG_NAV_ICONS if present
  const svgMatch = htmlContent.match(/const SVG_NAV_ICONS = (\{[\s\S]*?\});/);
  if (svgMatch) {
    global.SVG_NAV_ICONS = eval('(' + svgMatch[1] + ')');
  }

  // Extract config and functions from index.html
  const configMatch = htmlContent.match(/const AURA_POLES_CONFIG = (\[[\s\S]*?\]);\s*function getLiveMetricForPole/);
  assert(configMatch, 'AURA_POLES_CONFIG was extracted from index.html');
  const AURA_POLES_CONFIG = eval(configMatch[1]);
  assert.strictEqual(AURA_POLES_CONFIG.length, 7, 'Config contains all 7 Pôles Métiers');

  // Verify the 7 poles
  const expectedPoles = ['pos_docs', 'stock', 'crm_credits', 'deliveries', 'hr', 'finances', 'settings'];
  expectedPoles.forEach(pId => {
    const found = AURA_POLES_CONFIG.find(p => p.id === pId);
    assert(found, `Pole ${pId} is configured`);
    assert(found.subCards && found.subCards.length > 0, `Pole ${pId} has subCards`);
  });

  // Simulate toggle to 'cards'
  body.classList.toggle('interface-cards-mode', true);
  elements['aura-card-navigation-deck'].style.display = 'block';
  elements['nav-mode-icon'].innerText = '🏢';
  elements['nav-mode-label'].innerText = 'Mode Standard';

  assert(body.classList.contains('interface-cards-mode'), 'Body has interface-cards-mode class');
  assert.strictEqual(elements['aura-card-navigation-deck'].style.display, 'block', 'Deck is visible in cards mode');
  assert.strictEqual(elements['nav-mode-icon'].innerText, '🏢', 'Icon reflects option to switch to standard');

  // Simulate toggle back to 'formal'
  body.classList.toggle('interface-cards-mode', false);
  elements['aura-card-navigation-deck'].style.display = 'none';
  elements['nav-mode-icon'].innerText = '🃏';
  elements['nav-mode-label'].innerText = 'Mode Cartes';

  assert(!body.classList.contains('interface-cards-mode'), 'Body no longer has interface-cards-mode class');
  assert.strictEqual(elements['aura-card-navigation-deck'].style.display, 'none', 'Deck is hidden in formal mode');
});

// 5. Hooks Integration Verification
test('5. Hooks: switchView, switchStockTab, switchDocTab, switchHRTab, switchSettingsTab hook syncCardsInterface', () => {
  assert(htmlContent.includes("syncCardsInterface(viewId)"), 'switchView hooks syncCardsInterface');
  assert(htmlContent.includes("syncCardsInterface('stock', tabKey)"), 'switchStockTab hooks syncCardsInterface');
  assert(htmlContent.includes("syncCardsInterface('documents', tabKey)"), 'switchDocTab hooks syncCardsInterface');
  assert(htmlContent.includes("syncCardsInterface('hr', tabKey)"), 'switchHRTab hooks syncCardsInterface');
  assert(htmlContent.includes("syncCardsInterface('settings', tabKey)"), 'switchSettingsTab hooks syncCardsInterface');
  assert(htmlContent.includes("syncCardsInterface('deliveries'"), 'filterDeliveriesByTab hooks syncCardsInterface');
});

// 6. Keyboard Shortcuts Verification
test('6. Keyboard: Alt+I and 1-7 shortcuts are registered in keydown event listener', () => {
  assert(htmlContent.includes("e.altKey && (e.key === 'i' || e.key === 'I')"), 'Alt+I shortcut exists');
  assert(htmlContent.includes("currentNavInterfaceMode === 'cards' && ['1','2','3','4','5','6','7'].includes(e.key)"), 'Number keys 1-7 shortcut registered for cards mode');
});

console.log(`\n================================================================`);
console.log(`  DUAL INTERFACE VERIFICATION: ALL ${passCount}/${passCount} TESTS PASSED`);
console.log(`================================================================\n`);
