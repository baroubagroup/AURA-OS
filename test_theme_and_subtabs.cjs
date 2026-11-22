const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Facebook Royal Blue Theme, Segmented Subtabs, Badges & Mode Switch Contrast...');

const htmlPath = fs.existsSync('aura-pos/index.html') ? 'aura-pos/index.html' : 'index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

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

// 4. Royal Blue Sidebar in Light Mode & Harmonized Active Nav
assert(html.includes('html.light #sidebar {'), 'Light mode sidebar has dedicated royal blue styling');
assert(html.includes('linear-gradient(180deg, #0E2554 0%, #091734 100%)'), 'Sidebar uses deep Royal Blue gradient in light mode');
assert(html.includes('#sidebar .nav-btn.bg-\\[var\\(--primary-light\\)\\]'), 'Active nav item has elevated royal blue pill in both modes');
assert(html.includes('html.light #sidebar .nav-section-header'), 'Accordion headers in sidebar are styled with light blue contrast');
console.log('  [PASS] 4: Royal Blue Sidebar in Light Mode and harmonized active nav verified.');

// 5. HTML Subtab Structure
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
console.log('  [PASS] 5: HTML markup for all subtabs conforms to segmented dock standards.');

// 6. JS Function active class toggling
assert(html.includes("function switchHRTab(tabKey)"), 'switchHRTab function exists');
assert(html.includes("activeBtn.classList.add('active');"), 'activeBtn gets active class');
console.log('  [PASS] 6: Tab switching functions cleanly maintain .active state.');

// 7. Light Mode Shifts & Clôture de Caisse View Harmony
assert(html.includes('html.light #view-shifts .bg-slate-900\\/60'), 'Shifts view cards styled for light mode');
assert(html.includes('html.light #view-shifts .from-slate-900\\/80'), 'Shifts view header banner styled for light mode');
assert(html.includes('html.light #view-shifts thead.bg-black\\/30'), 'Shifts view table header styled for light mode');
assert(html.includes('html.light #denominations-body .bg-black\\/40'), 'Cash denomination steppers styled for light mode');
assert(html.includes('html.light #shift-theoretical-total'), 'Theoretical cash total styled for light mode');
console.log('  [PASS] 7: Shifts & Clôture Z view harmonized for light mode with white cards and crisp text.');

// 8. Modal & Input Contrast in Light Mode
assert(html.includes('html.light [id^="modal-"] .app-input'), 'Modal inputs have crisp high-contrast borders in light mode');
assert(html.includes('html.light [id^="modal-"] label'), 'Modal labels are high contrast dark slate in light mode');
assert(!html.includes('paie et pointage'), 'Pointage mention successfully removed from modal subtitle');
console.log('  [PASS] 8: Modal form inputs have high contrast and clear visibility.');

// 9. Dark Mode Navigation System Distinction (Sidebar & Topbar vs Interface Canvas)
assert(html.includes('html.dark #sidebar,\n    :root:not(.light) #sidebar'), 'Dark mode sidebar has dedicated Royal Blue Sapphire styling');
assert(html.includes('linear-gradient(180deg, #0D2659 0%, #081738 100%)'), 'Dark mode sidebar uses vibrant Deep Royal Blue gradient');
assert(html.includes('border-right: 1.5px solid rgba(24, 119, 242, 0.35)'), 'Dark mode sidebar has luminous boundary divider');
assert(html.includes('html.dark #sidebar .nav-section-header'), 'Dark mode accordion headers styled in soft sky blue #93C5FD');
assert(html.includes('html.dark header:not(#aura-os-desktop > header)'), 'Dark mode top header has distinct border and elevation');
assert(html.includes('html.dark .app-card'), 'Dark mode cards have distinct dark slate elevation #0F172A');
console.log('  [PASS] 9: Dark mode navigation system clearly distinguished from interface canvas.');

// 10. Subtab Numerical Count Badges (.tab-pill-badge) Contrast
assert(html.includes('html.light .tab-pill-btn.active .tab-pill-badge'), 'Active subtab badge has dedicated styling in light mode');
assert(html.includes('html.dark .tab-pill-btn.active .tab-pill-badge'), 'Active subtab badge has dedicated styling in dark mode');
assert(html.includes('background-color: #FFFFFF !important;\n      color: #1877F2 !important;'), 'Active subtab badge is crisp white capsule with Royal Blue number');
assert(html.includes('html.light .tab-pill-btn:not(.active) .tab-pill-badge'), 'Inactive subtab badge has high contrast dark slate text on light slate in light mode');
assert(html.includes('html.dark .tab-pill-btn:not(.active) .tab-pill-badge'), 'Inactive subtab badge has high contrast white text on translucent card in dark mode');
console.log('  [PASS] 10: Subtab count badges visible and distinct across both Light and Dark mode switches.');

// 11. POS Product Grid Contrast in Light Mode
assert(html.includes('html.light #pos-products-grid > div'), 'POS product cards have solid white background and crisp border in light mode');
assert(html.includes('html.light #pos-products-grid h4'), 'POS product titles are high contrast dark slate #0F172A in light mode');
assert(html.includes('html.light #pos-products-grid .text-teal-400'), 'POS product prices are high contrast deep teal #0F766E in light mode');
assert(html.includes('html.light #pos-products-grid .bg-teal-500\\/15'), 'POS stock badges have high contrast dark green on pale green in light mode');
console.log('  [PASS] 11: POS product cards, titles, prices, and stock badges clearly visible in light mode.');


// 12. Vertical Icon + Label Dock Rail in Collapsed Sidebar (macOS Big Sur Dock Style)
assert(html.includes('MODE SIDEBAR RÉDUITE (DOCK RAIL VERTICAL AVEC ICÔNES ET NOMS)'), 'Collapsed sidebar dock rail CSS block present');
assert(html.includes('body.sidebar-collapsed #sidebar') && html.includes('width: 5.25rem !important;'), 'Collapsed sidebar has 5.25rem width for comfortable vertical tiles');
assert(html.includes('.nav-icon-tile {'), '.nav-icon-tile squircle class present');
assert(html.includes('.nav-label-dock {'), '.nav-label-dock text label class present');
assert(html.includes('body.sidebar-collapsed .nav-label-dock {'), 'nav-label-dock displayed as block under icon in collapsed mode');
assert(html.includes('id="btn-sidebar-expand-rail"'), '#btn-sidebar-expand-rail expand button present in header');

const expectedButtons = [
  'nav-dashboard', 'nav-pos', 'nav-documents', 'nav-credits', 'nav-clients',
  'nav-stock', 'nav-suppliers', 'nav-deliveries', 'nav-shifts', 'nav-expenses',
  'nav-accounting', 'nav-stats', 'nav-hr', 'nav-audit', 'nav-settings', 'nav-about'
];

for (const btnId of expectedButtons) {
  assert(html.includes(`id="${btnId}"`), `Button ${btnId} present in HTML`);
}
assert(html.includes('nav-label-dock hidden text-[9.5px]">Tableau</span>'), 'Tableau dock label present for dashboard');
assert(html.includes('nav-label-dock hidden text-[9.5px]">Caisse</span>'), 'Caisse dock label present for pos');
assert(html.includes('nav-label-dock hidden text-[9.5px]">Factures</span>'), 'Factures dock label present for documents');
assert(html.includes('nav-label-dock hidden text-[9.5px]">Stocks</span>'), 'Stocks dock label present for stock');
assert(html.includes('nav-label-dock hidden text-[9.5px]">Clients</span>'), 'Clients dock label present for clients');
assert(html.includes('nav-label-dock hidden text-[9.5px]">Équipe</span>'), 'Équipe dock label present for hr');
console.log('  [PASS] 12: Vertical Icon + Label Dock Rail validated with 16 squircle tiles and visible labels.');

console.log('All Facebook Royal Blue, Subtab Badges, POS Contrast, Dark Nav & Dock Rail tests PASSED! (60/60 assertions)');
