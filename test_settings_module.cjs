// test_settings_module.cjs
// Verification suite for Module 14: Settings & System Configuration (view-settings)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('  TEST SUITE: MODULE 14 - PARAMÈTRES & CONFIGURATION SYSTÈME    ');
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

// -----------------------------------------------------------------------------
// PART 1: DOM & HTML STRUCTURE AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 1. DOM Structure & HTML Elements Audit ---');

assert(htmlContent.includes('id="view-settings"'), 'Section #view-settings exists in DOM');
assert(htmlContent.includes('id="settings-tab-general"'), 'Tab button #settings-tab-general exists');
assert(htmlContent.includes('id="settings-tab-rbac"'), 'Tab button #settings-tab-rbac exists');
assert(htmlContent.includes('id="settings-tab-printers"'), 'Tab button #settings-tab-printers exists');
assert(htmlContent.includes('id="settings-tab-tickets"'), 'Tab button #settings-tab-tickets exists');
assert(htmlContent.includes('id="settings-tab-zones"'), 'Tab button #settings-tab-zones exists');
assert(htmlContent.includes('id="settings-tab-backups"'), 'Tab button #settings-tab-backups exists');

assert(htmlContent.includes('id="subview-settings-general"'), 'Subview #subview-settings-general exists');
assert(htmlContent.includes('id="subview-settings-rbac"'), 'Subview #subview-settings-rbac exists');
assert(htmlContent.includes('id="subview-settings-printers"'), 'Subview #subview-settings-printers exists');
assert(htmlContent.includes('id="subview-settings-tickets"'), 'Subview #subview-settings-tickets exists');
assert(htmlContent.includes('id="subview-settings-zones"'), 'Subview #subview-settings-zones exists');
assert(htmlContent.includes('id="subview-settings-backups"'), 'Subview #subview-settings-backups exists');

// General settings inputs
assert(htmlContent.includes('id="setting-store-name"'), 'Input #setting-store-name exists');
assert(htmlContent.includes('id="setting-ifu"'), 'Input #setting-ifu exists');
assert(htmlContent.includes('id="setting-rccm"'), 'Input #setting-rccm exists');
assert(htmlContent.includes('id="setting-address"'), 'Input #setting-address exists');
assert(htmlContent.includes('id="setting-phone"'), 'Input #setting-phone exists');
assert(htmlContent.includes('id="setting-whatsapp"'), 'Input #setting-whatsapp exists');
assert(htmlContent.includes('id="setting-currency"'), 'Select #setting-currency exists');
assert(htmlContent.includes('id="setting-rounding"'), 'Select #setting-rounding exists');
assert(htmlContent.includes('id="setting-blind-shift"'), 'Checkbox #setting-blind-shift exists');
assert(htmlContent.includes('id="setting-negative-stock"'), 'Checkbox #setting-negative-stock exists');
assert(htmlContent.includes('id="setting-multidepot"'), 'Checkbox #setting-multidepot exists');
assert(htmlContent.includes('id="setting-default-tva"'), 'Select #setting-default-tva exists');
assert(htmlContent.includes('id="setting-esintax-active"'), 'Checkbox #setting-esintax-active exists');

// RBAC
assert(htmlContent.includes('id="rbac-users-count"'), 'Badge #rbac-users-count exists');
assert(htmlContent.includes('id="rbac-users-body"'), 'Tbody #rbac-users-body exists');
assert(htmlContent.includes('id="modal-new-user"'), 'Modal #modal-new-user exists');
assert(htmlContent.includes('id="user-edit-id"'), 'Input #user-edit-id exists');
assert(htmlContent.includes('id="user-input-name"'), 'Input #user-input-name exists');
assert(htmlContent.includes('id="user-input-role"'), 'Select #user-input-role exists');
assert(htmlContent.includes('id="user-input-pin"'), 'Input #user-input-pin exists');
assert(htmlContent.includes('id="user-input-status"'), 'Select #user-input-status exists');
assert(htmlContent.includes('id="user-perm-modPrice"'), 'Checkbox #user-perm-modPrice exists');
assert(htmlContent.includes('id="user-perm-highDisc"'), 'Checkbox #user-perm-highDisc exists');
assert(htmlContent.includes('id="user-perm-cancelSale"'), 'Checkbox #user-perm-cancelSale exists');
assert(htmlContent.includes('id="user-perm-closeShift"'), 'Checkbox #user-perm-closeShift exists');
assert(htmlContent.includes('id="user-perm-viewMargin"'), 'Checkbox #user-perm-viewMargin exists');

// Printers & ESC/POS
assert(htmlContent.includes('id="setting-printer-type"'), 'Select #setting-printer-type exists');
assert(htmlContent.includes('id="setting-paper-width"'), 'Select #setting-paper-width exists');
assert(htmlContent.includes('id="setting-print-copies"'), 'Input #setting-print-copies exists');
assert(htmlContent.includes('id="setting-auto-cut"'), 'Checkbox #setting-auto-cut exists');
assert(htmlContent.includes('id="setting-cash-drawer"'), 'Checkbox #setting-cash-drawer exists');
assert(htmlContent.includes('id="setting-auto-print"'), 'Checkbox #setting-auto-print exists');
assert(htmlContent.includes('testDiagnosticPrint()'), 'Button testDiagnosticPrint() is wired in HTML');

// Tickets & A4 Branding
assert(htmlContent.includes('id="logo-preview-img"'), 'Img #logo-preview-img exists');
assert(htmlContent.includes('id="stamp-preview-container"'), 'Container #stamp-preview-container exists');
assert(htmlContent.includes('id="signature-preview-container"'), 'Container #signature-preview-container exists');
assert(htmlContent.includes('handleLogoUpload(event)'), 'handleLogoUpload is wired to input file');
assert(htmlContent.includes('handleStampUpload(event)'), 'handleStampUpload is wired to input file');
assert(htmlContent.includes('handleSignatureUpload(event)'), 'handleSignatureUpload is wired to input file');
assert(htmlContent.includes('id="setting-stamp-invoice"'), 'Checkbox #setting-stamp-invoice exists');
assert(htmlContent.includes('id="setting-stamp-proforma"'), 'Checkbox #setting-stamp-proforma exists');
assert(htmlContent.includes('id="setting-stamp-delivery"'), 'Checkbox #setting-stamp-delivery exists');
assert(htmlContent.includes('id="setting-ticket-header"'), 'Input #setting-ticket-header exists');
assert(htmlContent.includes('id="setting-ticket-sub"'), 'Input #setting-ticket-sub exists');
assert(htmlContent.includes('id="setting-ticket-footer"'), 'Textarea #setting-ticket-footer exists');
assert(htmlContent.includes('id="setting-show-qr"'), 'Checkbox #setting-show-qr exists');
assert(htmlContent.includes('id="setting-show-barcode"'), 'Checkbox #setting-show-barcode exists');
assert(htmlContent.includes('id="live-ticket-preview"'), 'Preview container #live-ticket-preview exists');

// Delivery Zones
assert(htmlContent.includes('id="zones-count-label"'), 'Badge #zones-count-label exists');
assert(htmlContent.includes('id="zones-table-body"'), 'Tbody #zones-table-body exists');
assert(htmlContent.includes('id="modal-new-zone"'), 'Modal #modal-new-zone exists');
assert(htmlContent.includes('id="zone-edit-id"'), 'Input #zone-edit-id exists');
assert(htmlContent.includes('id="zone-input-name"'), 'Input #zone-input-name exists');
assert(htmlContent.includes('id="zone-input-city"'), 'Input #zone-input-city exists');
assert(htmlContent.includes('id="zone-input-fee"'), 'Input #zone-input-fee exists');
assert(htmlContent.includes('id="zone-input-eta"'), 'Input #zone-input-eta exists');
assert(htmlContent.includes('id="zone-input-status"'), 'Select #zone-input-status exists');

// Backups & Maintenance
assert(htmlContent.includes('id="backup-restore-input"'), 'Hidden input #backup-restore-input exists');
assert(htmlContent.includes('downloadCompleteBackupJSON()'), 'downloadCompleteBackupJSON button is wired');
assert(htmlContent.includes('openRestoreBackupModal()'), 'openRestoreBackupModal button is wired');
assert(htmlContent.includes('checkSystemUpdates()'), 'checkSystemUpdates button is wired');
assert(htmlContent.includes('resetSystemFactoryDefaults()'), 'resetSystemFactoryDefaults button is wired');

// -----------------------------------------------------------------------------
// PART 2: JAVASCRIPT LOGIC & ENVIRONMENT SIMULATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. JavaScript Logic & Functional Tests ---');

// Setup mock DOM elements and context
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
    classList: {
      classes: new Set(),
      add(...args) { args.forEach(c => this.classes.add(c)); },
      remove(...args) { args.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); },
      toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
    },
    src: '',
    clickCalled: false,
    click() { this.clickCalled = true; },
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

const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const toastLog = [];
function mockShowToast(msg, type = 'success') {
  toastLog.push({ msg, type });
}

const mockWindow = {
  localStorage: mockLocalStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: (cb, ms) => { if (typeof cb === 'function') return setTimeout(cb, ms); },
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (cb, ms) => setInterval(cb, ms),
  clearInterval: (id) => clearInterval(id),
  requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
  cancelAnimationFrame: () => {},
  showToast: mockShowToast,
  open: (url, target, features) => {
    return {
      document: {
        write: (h) => { mockWindow._lastPrintedHtml = h; },
        close: () => {}
      }
    };
  },
  _lastPrintedHtml: null
};

// Populate known mock DOM IDs
const domIds = [
  'view-settings', 'subview-settings-general', 'subview-settings-rbac', 'subview-settings-printers',
  'subview-settings-tickets', 'subview-settings-zones', 'subview-settings-backups',
  'settings-tab-general', 'settings-tab-rbac', 'settings-tab-printers', 'settings-tab-tickets',
  'settings-tab-zones', 'settings-tab-backups',
  'setting-store-name', 'setting-ifu', 'setting-rccm', 'setting-address', 'setting-phone', 'setting-whatsapp',
  'setting-currency', 'setting-rounding', 'setting-blind-shift', 'setting-negative-stock', 'setting-multidepot',
  'setting-default-tva', 'setting-esintax-active',
  'rbac-users-count', 'rbac-users-body', 'modal-new-user', 'modal-user-title', 'user-edit-id',
  'user-input-name', 'user-input-role', 'user-input-pin', 'user-input-status',
  'user-perm-modPrice', 'user-perm-highDisc', 'user-perm-cancelSale', 'user-perm-closeShift', 'user-perm-viewMargin',
  'btn-save-user',
  'setting-printer-type', 'setting-paper-width', 'setting-print-copies', 'setting-auto-cut', 'setting-cash-drawer', 'setting-auto-print',
  'logo-preview-img', 'a4-company-logo', 'stamp-preview-container', 'signature-preview-container',
  'setting-stamp-invoice', 'setting-stamp-proforma', 'setting-stamp-delivery',
  'setting-ticket-header', 'setting-ticket-sub', 'setting-ticket-footer', 'setting-show-qr', 'setting-show-barcode',
  'live-ticket-preview', 'setting-bank-details', 'setting-mobile-details',
  'zones-count-label', 'zones-table-body', 'modal-new-zone', 'modal-zone-title', 'zone-edit-id',
  'zone-input-name', 'zone-input-city', 'zone-input-fee', 'zone-input-eta', 'zone-input-status',
  'btn-save-zone', 'backup-restore-input', 'toast-container'
];

domIds.forEach(id => {
  elements[id] = createMockElement(id);
});

elements['toast-container'].appendChild = function(child) {
  this.children.push(child);
  const text = child.innerHTML || child.innerText || '';
  let type = 'success';
  if (child.className.includes('bg-rose')) type = 'error';
  else if (child.className.includes('bg-indigo')) type = 'info';
  else if (child.className.includes('bg-amber')) type = 'warning';
  toastLog.push({ msg: text, type, raw: text });
};

mockWindow.document = {
  getElementById(id) {
    if (!elements[id]) {
      elements[id] = createMockElement(id);
    }
    return elements[id];
  },
  querySelectorAll(sel) {
    if (sel === '.page-view') {
      return [elements['view-settings']];
    }
    if (sel === '.nav-btn') {
      return [];
    }
    return [];
  },
  createElement(tag) {
    return createMockElement('dyn-' + Math.random(), tag);
  },
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

mockWindow.window = mockWindow;

// Extract script
const scriptContent = htmlContent.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = vm.createContext(mockWindow);
vm.runInContext(scriptContent, sandbox);

// Test subtab switching
assert(typeof sandbox.switchSettingsTab === 'function', 'switchSettingsTab is defined as a global function');

sandbox.switchSettingsTab('rbac');
assert(!elements['subview-settings-rbac'].classList.contains('hidden'), 'switchSettingsTab("rbac") unhides #subview-settings-rbac');
assert(elements['subview-settings-general'].classList.contains('hidden'), 'switchSettingsTab("rbac") hides #subview-settings-general');

sandbox.switchSettingsTab('zones');
assert(!elements['subview-settings-zones'].classList.contains('hidden'), 'switchSettingsTab("zones") unhides #subview-settings-zones');
assert(elements['subview-settings-rbac'].classList.contains('hidden'), 'switchSettingsTab("zones") hides previous tab');

sandbox.switchSettingsTab('general');
assert(!elements['subview-settings-general'].classList.contains('hidden'), 'switchSettingsTab("general") restores #subview-settings-general');

// Test renderSettingsView
assert(typeof sandbox.renderSettingsView === 'function', 'renderSettingsView function is defined');
sandbox.renderSettingsView();
assert(elements['setting-store-name'].value === 'AURA Multi-Commerce & Distribution' || elements['setting-store-name'].value === 'AURA Commerce & Quincaillerie Générale', 'renderSettingsView populates #setting-store-name');
assert(elements['setting-ifu'].value === '00124856019M', 'renderSettingsView populates #setting-ifu');
assert(elements['setting-currency'].value === 'XOF', 'renderSettingsView populates #setting-currency');
assert(elements['setting-blind-shift'].checked === true, 'renderSettingsView sets #setting-blind-shift checked');
assert(elements['setting-default-tva'].value === '18', 'renderSettingsView sets #setting-default-tva to 18');
assert(elements['setting-esintax-active'].checked === true, 'renderSettingsView sets #setting-esintax-active to true');

// Test saveAllSettings
assert(typeof sandbox.saveAllSettings === 'function', 'saveAllSettings function is defined');
elements['setting-store-name'].value = 'AURA Burkinabe Mega Store';
elements['setting-phone'].value = '+226 25 99 99 99';
elements['setting-negative-stock'].checked = true;
elements['setting-default-tva'].value = '0';

toastLog.length = 0;
sandbox.saveAllSettings();
assert(sandbox.SYSTEM_SETTINGS.storeName === 'AURA Burkinabe Mega Store', 'saveAllSettings updates SYSTEM_SETTINGS.storeName');
assert(sandbox.SYSTEM_SETTINGS.phone === '+226 25 99 99 99', 'saveAllSettings updates SYSTEM_SETTINGS.phone');
assert(sandbox.SYSTEM_SETTINGS.negativeStock === true, 'saveAllSettings updates SYSTEM_SETTINGS.negativeStock');
assert(sandbox.SYSTEM_SETTINGS.defaultTva === '0', 'saveAllSettings updates SYSTEM_SETTINGS.defaultTva');
assert(mockLocalStorage.getItem('aura_system_settings').includes('AURA Burkinabe Mega Store'), 'saveAllSettings persists to localStorage');
assert(toastLog.some(t => t.type === 'success' && t.msg.includes('enregistrées')), 'saveAllSettings displays success toast');

// Test RBAC rendering & CRUD
assert(typeof sandbox.renderRBACUsers === 'function', 'renderRBACUsers is defined');
sandbox.renderRBACUsers();
assert(elements['rbac-users-body'].innerHTML.includes('Abdoul C.'), 'renderRBACUsers outputs Abdoul C.');
assert(elements['rbac-users-body'].innerHTML.includes('Moussa Traoré'), 'renderRBACUsers outputs Moussa Traoré');
assert(elements['rbac-users-count'].innerText.includes('collaborateurs'), 'renderRBACUsers updates #rbac-users-count');

// Test openNewUserModal
assert(typeof sandbox.openNewUserModal === 'function', 'openNewUserModal is defined');
sandbox.openNewUserModal();
assert(!elements['modal-new-user'].classList.contains('hidden'), 'openNewUserModal opens #modal-new-user');
assert(elements['user-edit-id'].value === '', 'openNewUserModal resets #user-edit-id');

// Test submitNewUser (Create)
elements['user-input-name'].value = 'Kadiatou Ouedraogo';
elements['user-input-role'].value = 'Caissier(ère) Vendeur(se)';
elements['user-input-pin'].value = '7788';
elements['user-perm-modPrice'].checked = true;
elements['user-perm-highDisc'].checked = false;
elements['user-input-status'].value = 'Actif';

toastLog.length = 0;
sandbox.submitNewUser();
assert(elements['modal-new-user'].classList.contains('hidden'), 'submitNewUser closes #modal-new-user');
assert(sandbox.RBAC_USERS.some(u => u.name === 'Kadiatou Ouedraogo' && u.pin === '7788'), 'submitNewUser added Kadiatou Ouedraogo to RBAC_USERS');
assert(toastLog.some(t => t.type === 'success' && t.msg.includes('Kadiatou Ouedraogo')), 'submitNewUser emits success toast');

// Test openEditUserModal & submitNewUser (Update)
const createdUser = sandbox.RBAC_USERS.find(u => u.name === 'Kadiatou Ouedraogo');
sandbox.openEditUserModal(createdUser.id);
assert(!elements['modal-new-user'].classList.contains('hidden'), 'openEditUserModal opens modal for editing');
assert(elements['user-edit-id'].value === String(createdUser.id), 'openEditUserModal populates user ID');
assert(elements['user-input-name'].value === 'Kadiatou Ouedraogo', 'openEditUserModal populates user name');

elements['user-input-role'].value = 'Responsable Magasin';
elements['user-perm-highDisc'].checked = true;
sandbox.submitNewUser();
assert(createdUser.role === 'Responsable Magasin', 'submitNewUser updated user role');
assert(createdUser.highDisc === true, 'submitNewUser updated highDisc permission');

// Test toggleUserPermission
sandbox.toggleUserPermission(createdUser.id, 'cancelSale');
assert(createdUser.cancelSale === true, 'toggleUserPermission toggled cancelSale to true');

// Test toggleUserStatus
sandbox.toggleUserStatus(createdUser.id);
assert(createdUser.status === 'Suspendu', 'toggleUserStatus switched status to Suspendu');
sandbox.toggleUserStatus(createdUser.id);
assert(createdUser.status === 'Actif', 'toggleUserStatus switched status back to Actif');

// Test deleteUser
const countBeforeDelete = sandbox.RBAC_USERS.length;
sandbox.deleteUser(createdUser.id);
assert(sandbox.RBAC_USERS.length === countBeforeDelete - 1, 'deleteUser removes user from array');
assert(!sandbox.RBAC_USERS.some(u => u.id === createdUser.id), 'deleteUser verified removed ID');

// Test Delivery Zones rendering & CRUD
assert(typeof sandbox.renderZonesTable === 'function', 'renderZonesTable is defined');
sandbox.renderZonesTable();
assert(elements['zones-table-body'].innerHTML.includes('Centre-ville / Koulouba'), 'renderZonesTable renders Centre-ville zone');
assert(elements['zones-count-label'].innerText.includes('zones'), 'renderZonesTable updates #zones-count-label');

// Test openNewZoneModal & submitNewZone (Create)
sandbox.openNewZoneModal();
assert(!elements['modal-new-zone'].classList.contains('hidden'), 'openNewZoneModal opens #modal-new-zone');
elements['zone-input-name'].value = 'Tampouy / Marcoussis';
elements['zone-input-city'].value = 'Ouagadougou';
elements['zone-input-fee'].value = '2500';
elements['zone-input-eta'].value = '1h';
elements['zone-input-status'].value = 'true';

toastLog.length = 0;
sandbox.submitNewZone();
assert(elements['modal-new-zone'].classList.contains('hidden'), 'submitNewZone closes modal');
assert(sandbox.ZONES.some(z => z.name === 'Tampouy / Marcoussis' && z.fee === 2500), 'submitNewZone added Tampouy zone to ZONES');
assert(toastLog.some(t => t.type === 'success' && t.msg.includes('Tampouy')), 'submitNewZone emitted success toast');

// Test openEditZoneModal & submitNewZone (Update)
const createdZone = sandbox.ZONES.find(z => z.name === 'Tampouy / Marcoussis');
sandbox.openEditZoneModal(createdZone.id);
assert(!elements['modal-new-zone'].classList.contains('hidden'), 'openEditZoneModal opened modal');
assert(elements['zone-edit-id'].value === String(createdZone.id), 'openEditZoneModal populated zone ID');
elements['zone-input-fee'].value = '3000';
sandbox.submitNewZone();
assert(createdZone.fee === 3000, 'submitNewZone updated zone fee to 3000');

// Test toggleZoneStatus
sandbox.toggleZoneStatus(createdZone.id);
assert(createdZone.active === false, 'toggleZoneStatus toggled zone active to false');
sandbox.toggleZoneStatus(createdZone.id);
assert(createdZone.active === true, 'toggleZoneStatus toggled zone active back to true');

// Test deleteZone
const zoneCountBefore = sandbox.ZONES.length;
sandbox.deleteZone(createdZone.id);
assert(sandbox.ZONES.length === zoneCountBefore - 1, 'deleteZone removed zone from array');
assert(!sandbox.ZONES.some(z => z.id === createdZone.id), 'deleteZone verified removed ID');

// Test testDiagnosticPrint
assert(typeof sandbox.testDiagnosticPrint === 'function', 'testDiagnosticPrint is defined');
toastLog.length = 0;
mockWindow._lastPrintedHtml = null;
sandbox.testDiagnosticPrint();
assert(toastLog.some(t => t.type === 'success' && t.msg.includes('diagnostique')), 'testDiagnosticPrint emitted success toast');
assert(mockWindow._lastPrintedHtml && mockWindow._lastPrintedHtml.includes('TEST DIAGNOSTIC POS'), 'testDiagnosticPrint generated valid diagnostic ticket slip');

// Test Backup & Restore functions
assert(typeof sandbox.downloadCompleteBackupJSON === 'function', 'downloadCompleteBackupJSON is defined');
assert(typeof sandbox.openRestoreBackupModal === 'function', 'openRestoreBackupModal is defined');
assert(typeof sandbox.handleRestoreBackupFile === 'function', 'handleRestoreBackupFile is defined');

// Test openRestoreBackupModal clicks file input
elements['backup-restore-input'].clickCalled = false;
sandbox.openRestoreBackupModal();
assert(elements['backup-restore-input'].clickCalled === true, 'openRestoreBackupModal triggered click on #backup-restore-input');

// Test checkSystemUpdates & resetSystemFactoryDefaults
toastLog.length = 0;
sandbox.checkSystemUpdates();
assert(toastLog.some(t => t.type === 'info' && t.msg.includes('AURA OS v5.2 Enterprise')), 'checkSystemUpdates emitted version check info');

sandbox.resetSystemFactoryDefaults();
assert(toastLog.some(t => t.type === 'warning' && t.msg.includes('réinitialisés')), 'resetSystemFactoryDefaults emitted reset warning toast');
assert(sandbox.SYSTEM_SETTINGS.storeName === 'AURA Multi-Commerce & Distribution' || sandbox.SYSTEM_SETTINGS.storeName === 'AURA Commerce & Quincaillerie Générale', 'resetSystemFactoryDefaults restored default store name');

// Test router integration switchView('settings')
assert(typeof sandbox.switchView === 'function', 'switchView is defined');
sandbox.switchView('settings');
assert(!elements['view-settings'].classList.contains('hidden'), 'switchView("settings") unhides #view-settings');

console.log('\n================================================================');
console.log(`  MODULE 14 TEST RESULTS: ${passedTests}/${totalTests} PASSED (0 FAILURES)`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
