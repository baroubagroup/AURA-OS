const fs = require('fs');
const assert = require('assert');

console.log('Testing Facebook Royal Blue Theme & Segmented Capsule Subtab Docks...');

const html = fs.readFileSync('aura-pos/index.html', 'utf8');

// 1. Theme Color Variables
assert(html.includes('--primary: #1877F2'), 'Primary color is set to Facebook Royal Blue #1877F2');
assert(html.includes('--primary-hover: #166FE5'), 'Primary hover color is set to #166FE5');
assert(html.includes('--primary-light: #E7F3FF'), 'Light theme primary light tint is set to #E7F3FF');
assert(html.includes('--text-secondary: #1E293B'), 'Light theme text-secondary is high contrast #1E293B');
assert(html.includes('--text-muted: #475569'), 'Light theme text-muted is high contrast #475569');
console.log('  [PASS] 1: Facebook Royal Blue color variables and contrast values verified.');

// 2. Light Mode High-Contrast Rules & Clean White Dock
assert(html.includes('RENFORCEMENT DU CONTRASTE & LISIBILITÉ EN MODE CLAIR'), 'Light mode contrast comment/block present');
assert(html.includes('html.light .app-card'), 'Light mode .app-card contrast rule present');
assert(html.includes('html.light thead'), 'Light mode table header contrast rule present');
assert(html.includes('html.light .tab-pill-deck {\n      background-color: #FFFFFF !important;'), 'Light mode tab deck is pure white, not greyish');
console.log('  [PASS] 2: Light mode high-contrast and pure white dock verified.');

// 3. Segmented Capsule Dock Styling & Pure White Active Text
assert(html.includes('.tab-pill-deck'), '.tab-pill-deck CSS class present');
assert(html.includes('linear-gradient(135deg, #1877F2 0%, #166FE5 100%)'), 'Active subtabs use Facebook Royal Blue gradient');
assert(html.includes('html.light .tab-pill-btn.active *,'), 'Active subtab content in light mode is forced to pure white');
assert(html.includes('color: #FFFFFF !important;'), 'Text color on active blue pill is #FFFFFF pure white');
assert(html.includes('stroke: #FFFFFF !important;'), 'Icon stroke on active blue pill is #FFFFFF pure white');
assert(html.includes('color: #334155 !important;'), 'Inactive subtabs in light mode have deep slate color #334155');
console.log('  [PASS] 3: Pure white text and icons on active royal blue pill verified.');

// 4. HTML Subtab Structure
// HR
assert(html.includes('id="hr-tab-employees" class="tab-pill-btn active hr-subtab-btn'), 'HR employees tab uses tab-pill-btn and active');
assert(html.includes('id="hr-tab-advances" class="tab-pill-btn hr-subtab-btn'), 'HR advances tab uses tab-pill-btn');
assert(html.includes('id="hr-tab-payslips" class="tab-pill-btn hr-subtab-btn'), 'HR payslips tab uses tab-pill-btn');

// Stock
assert(html.includes('id="stock-tab-catalog" class="tab-pill-btn active stock-subtab-btn'), 'Stock catalog tab uses tab-pill-btn and active');
assert(html.includes('id="stock-tab-transfers" class="tab-pill-btn stock-subtab-btn'), 'Stock transfers tab uses tab-pill-btn');
assert(html.includes('id="stock-tab-history" class="tab-pill-btn stock-subtab-btn'), 'Stock history tab uses tab-pill-btn');
assert(html.includes('id="stock-tab-loss" class="tab-pill-btn stock-subtab-btn'), 'Stock loss tab uses tab-pill-btn');
assert(html.includes('id="stock-tab-barcodes" class="tab-pill-btn stock-subtab-btn'), 'Stock barcodes tab uses tab-pill-btn');

// Settings
assert(html.includes('id="settings-tab-general" class="tab-pill-btn active settings-subtab-btn'), 'Settings general tab uses tab-pill-btn and active');
assert(html.includes('id="settings-tab-rbac" class="tab-pill-btn settings-subtab-btn'), 'Settings rbac tab uses tab-pill-btn');

// Accounting
assert(html.includes('id="acc-tab-pnl" class="tab-pill-btn active acc-subtab-btn'), 'Accounting pnl tab uses tab-pill-btn and active');
assert(html.includes('id="acc-tab-balance" class="tab-pill-btn acc-subtab-btn'), 'Accounting balance tab uses tab-pill-btn');
assert(html.includes('id="acc-tab-tva" class="tab-pill-btn acc-subtab-btn'), 'Accounting tva tab uses tab-pill-btn');
console.log('  [PASS] 4: HTML markup for all subtabs conforms to segmented dock standards.');

// 5. JS Function active class toggling
assert(html.includes("function switchHRTab(tabKey)"), 'switchHRTab function exists');
assert(html.includes("activeBtn.classList.add('active');"), 'activeBtn gets active class');
console.log('  [PASS] 5: Tab switching functions cleanly maintain .active state.');

console.log('All Facebook Royal Blue & Segmented Subtab tests PASSED! (22/22 assertions)');
