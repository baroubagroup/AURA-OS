/**
 * test_top_nav_layout.cjs
 * Test suite for the Top Horizontal Navigation Bar Layout Mode & Instant Toggle
 */

const fs = require('fs');
const assert = require('assert');

console.log('--- TEST SUITE: Top Horizontal Navigation Bar Mode ---');

const html = fs.readFileSync('aura-pos/index.html', 'utf8');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    process.exit(1);
  }
}

test('1. Element #aura-top-navbar exists and is properly structured', () => {
  assert(html.includes('id="aura-top-navbar"'), '#aura-top-navbar must be present in index.html');
  assert(html.includes('aria-label="Navigation Principale Supérieure"'), 'Accessibility label must be present');
});

test('2. All 16 topnav navigation buttons exist with onclick switchView', () => {
  const requiredButtons = [
    'topnav-dashboard',
    'topnav-pos',
    'topnav-documents',
    'topnav-credits',
    'topnav-clients',
    'topnav-stock',
    'topnav-suppliers',
    'topnav-deliveries',
    'topnav-shifts',
    'topnav-expenses',
    'topnav-accounting',
    'topnav-stats',
    'topnav-hr',
    'topnav-audit',
    'topnav-settings',
    'topnav-about'
  ];

  requiredButtons.forEach(btnId => {
    assert(html.includes(`id="${btnId}"`), `Button #${btnId} must be present in #aura-top-navbar`);
    const viewName = btnId.replace('topnav-', '');
    assert(html.includes(`switchView('${viewName}')`), `Button #${btnId} must call switchView('${viewName}')`);
  });
});

test('3. Toggle button #btn-toggle-nav-layout exists in top header', () => {
  assert(html.includes('id="btn-toggle-nav-layout"'), '#btn-toggle-nav-layout must exist');
  assert(html.includes('onclick="toggleNavLayout()"'), 'Should trigger toggleNavLayout()');
  assert(html.includes('id="nav-layout-icon"'), '#nav-layout-icon must exist');
  assert(html.includes('id="nav-layout-label"'), '#nav-layout-label must exist');
});

test('4. #topbar-brand and #topbar-user-profile exist in top header', () => {
  assert(html.includes('id="topbar-brand"'), '#topbar-brand must exist for top nav mode');
  assert(html.includes('id="topbar-store-selector"'), '#topbar-store-selector must exist');
  assert(html.includes('id="topbar-user-profile"'), '#topbar-user-profile must exist for top nav mode');
});

test('5. Settings radio options exist for nav layout in Settings view', () => {
  assert(html.includes('id="setting-nav-layout-sidebar"'), '#setting-nav-layout-sidebar radio must exist');
  assert(html.includes('id="setting-nav-layout-top"'), '#setting-nav-layout-top radio must exist');
});

test('6. JavaScript functions getNavLayout, setNavLayout, toggleNavLayout, syncTopNavActive exist', () => {
  assert(html.includes('function getNavLayout('), 'getNavLayout function must be defined');
  assert(html.includes('function setNavLayout('), 'setNavLayout function must be defined');
  assert(html.includes('function toggleNavLayout('), 'toggleNavLayout function must be defined');
  assert(html.includes('function syncTopNavActive('), 'syncTopNavActive function must be defined');
  assert(html.includes('function syncStoreSelector('), 'syncStoreSelector function must be defined');
});

test('7. CSS rules for body.layout-top-nav are defined', () => {
  assert(html.includes('body.layout-top-nav #sidebar'), 'CSS for body.layout-top-nav #sidebar must be defined');
  assert(html.includes('body.layout-top-nav #aura-top-navbar'), 'CSS for body.layout-top-nav #aura-top-navbar must be defined');
  assert(html.includes('body.layout-top-nav #topbar-brand'), 'CSS for body.layout-top-nav #topbar-brand must be defined');
  assert(html.includes('body.layout-top-nav #topbar-user-profile'), 'CSS for body.layout-top-nav #topbar-user-profile must be defined');
});

test('8. SYSTEM_SETTINGS includes navLayout and syncs with settings view', () => {
  assert(html.includes("navLayout: 'sidebar'"), 'DEFAULT_SYSTEM_SETTINGS must declare navLayout');
  assert(html.includes('SYSTEM_SETTINGS.navLayout'), 'SYSTEM_SETTINGS.navLayout must be referenced in settings');
});

test('9. switchView updates syncTopNavActive', () => {
  assert(html.includes('syncTopNavActive(viewId)'), 'switchView must call syncTopNavActive(viewId)');
});

console.log(`\nAll ${passed} assertions passed successfully!`);
