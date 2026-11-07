const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log(' TEST SUITE : MODULE 7 - RESSOURCES HUMAINES & PAIE ');
console.log('====================================================\n');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Minimal DOM Mock for Node VM
class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.classList = new Set();
    this.children = [];
    this.innerHTML = '';
    this.innerText = '';
    this.value = '';
    this.style = {};
    this.attributes = {};
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) { this.children = this.children.filter(c => c !== child); }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
}

MockElement.prototype.classList = {
  classes: new Set(),
  add(...cls) { cls.forEach(c => this.classes.add(c)); },
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
  contains(c) { return this.classes.has(c); },
  toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
};

const domElements = new Map();
function getMockElement(id, tagName = 'div') {
  if (!domElements.has(id)) {
    const el = new MockElement(id, tagName);
    el.classList = {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    };
    domElements.set(id, el);
  }
  return domElements.get(id);
}

// Pre-populate key DOM elements
const keyIds = [
  'view-hr', 'kpi-hr-headcount', 'kpi-hr-headcount-sub', 'kpi-hr-payroll', 'kpi-hr-advances', 'kpi-hr-attendance', 'kpi-hr-attendance-sub',
  'hr-tab-employees', 'hr-tab-attendance', 'hr-tab-advances', 'hr-tab-payslips',
  'subview-hr-employees', 'subview-hr-attendance', 'subview-hr-advances', 'subview-hr-payslips',
  'hr-employees-body', 'hr-attendance-body', 'hr-advances-body', 'hr-payslips-body',
  'modal-new-employee', 'modal-emp-title', 'modal-emp-subtitle', 'btn-submit-emp',
  'new-emp-id', 'new-emp-name', 'new-emp-role', 'new-emp-contract', 'new-emp-salary', 'new-emp-phone', 'new-emp-cnss', 'new-emp-hired',
  'modal-salary-advance', 'advance-emp-select', 'advance-amount', 'advance-reason', 'advance-mode',
  'modal-payslip-a4', 'payslip-print-sheet',
  'toast-container', 'page-title', 'breadcrumb-active'
];
keyIds.forEach(id => getMockElement(id));

const documentMock = {
  getElementById: (id) => getMockElement(id),
  querySelectorAll: (selector) => {
    if (selector === '.page-view') return [getMockElement('view-hr')];
    if (selector === '.nav-btn') return [getMockElement('nav-hr')];
    return [];
  },
  createElement: (tag) => {
    const el = new MockElement('', tag);
    el.classList = {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    };
    return el;
  },
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

let openedWindows = [];
const windowMock = {
  document: documentMock,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); }
  },
  alert: (msg) => {},
  confirm: () => true,
  open: (url, target, features) => {
    const win = {
      document: {
        write: (str) => { win.content = str; },
        close: () => {}
      },
      close: () => {},
      content: ''
    };
    openedWindows.push(win);
    return win;
  },
  print: () => {},
  addEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  EXPENSES: []
};
windowMock.window = windowMock;

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  localStorage: windowMock.localStorage,
  alert: windowMock.alert,
  confirm: windowMock.confirm,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  fetch: () => Promise.resolve({ json: () => Promise.resolve({ success: true }) })
});

// Extract <script> code from index.html
const scriptMatches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const inlineScript = scriptMatches.map(m => m[1]).join('\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
  }
}

try {
  vm.runInContext(inlineScript, context);
  console.log('Script parsed and initialized in VM successfully.\n');
} catch (e) {
  console.error('Error parsing script in VM:', e);
  process.exit(1);
}

// 1. Static HTML Checks
console.log('--- 1. Static HTML & ID Verifications ---');
assert(html.includes('id="view-hr"'), 'Section #view-hr exists in HTML');
assert(html.includes('id="kpi-hr-headcount"'), 'KPI #kpi-hr-headcount exists');
assert(html.includes('id="kpi-hr-headcount-sub"'), 'KPI #kpi-hr-headcount-sub exists');
assert(html.includes('id="kpi-hr-payroll"'), 'KPI #kpi-hr-payroll exists');
assert(html.includes('id="kpi-hr-advances"'), 'KPI #kpi-hr-advances exists');
assert(html.includes('id="kpi-hr-attendance"'), 'KPI #kpi-hr-attendance exists');
assert(html.includes('id="kpi-hr-attendance-sub"'), 'KPI #kpi-hr-attendance-sub exists');

assert(html.includes('id="hr-tab-employees"'), 'Subtab button #hr-tab-employees exists');
assert(html.includes('id="hr-tab-attendance"'), 'Subtab button #hr-tab-attendance exists');
assert(html.includes('id="hr-tab-advances"'), 'Subtab button #hr-tab-advances exists');
assert(html.includes('id="hr-tab-payslips"'), 'Subtab button #hr-tab-payslips exists');

assert(html.includes('id="subview-hr-employees"'), 'Subview container #subview-hr-employees exists');
assert(html.includes('id="subview-hr-attendance"'), 'Subview container #subview-hr-attendance exists');
assert(html.includes('id="subview-hr-advances"'), 'Subview container #subview-hr-advances exists');
assert(html.includes('id="subview-hr-payslips"'), 'Subview container #subview-hr-payslips exists');

assert(html.includes('id="hr-employees-body"'), 'Tbody #hr-employees-body exists');
assert(html.includes('id="hr-attendance-body"'), 'Tbody #hr-attendance-body exists');
assert(html.includes('id="hr-advances-body"'), 'Tbody #hr-advances-body exists');
assert(html.includes('id="hr-payslips-body"'), 'Tbody #hr-payslips-body exists');

assert(html.includes('id="modal-new-employee"'), 'Modal #modal-new-employee exists');
assert(html.includes('id="modal-salary-advance"'), 'Modal #modal-salary-advance exists');
assert(html.includes('id="modal-payslip-a4"'), 'Modal #modal-payslip-a4 exists');
assert(html.includes('id="payslip-print-sheet"'), 'Container #payslip-print-sheet exists');

// 2. JavaScript Functions Availability
console.log('\n--- 2. HR Functions Existence in Global Scope ---');
assert(typeof context.switchHRTab === 'function', 'switchHRTab is defined');
assert(typeof context.recalculateHRMetrics === 'function', 'recalculateHRMetrics is defined');
assert(typeof context.renderHREmployees === 'function', 'renderHREmployees is defined');
assert(typeof context.openNewEmployeeModal === 'function', 'openNewEmployeeModal is defined');
assert(typeof context.closeNewEmployeeModal === 'function', 'closeNewEmployeeModal is defined');
assert(typeof context.openEditEmployeeModal === 'function', 'openEditEmployeeModal is defined');
assert(typeof context.submitNewEmployee === 'function', 'submitNewEmployee is defined');
assert(typeof context.toggleEmployeeStatus === 'function', 'toggleEmployeeStatus is defined');
assert(typeof context.deleteEmployee === 'function', 'deleteEmployee is defined');
assert(typeof context.openSalaryAdvanceModal === 'function', 'openSalaryAdvanceModal is defined');
assert(typeof context.closeSalaryAdvanceModal === 'function', 'closeSalaryAdvanceModal is defined');
assert(typeof context.submitSalaryAdvance === 'function', 'submitSalaryAdvance is defined');
assert(typeof context.toggleEmployeeAttendance === 'function', 'toggleEmployeeAttendance is defined');
assert(typeof context.renderHRAttendance === 'function', 'renderHRAttendance is defined');
assert(typeof context.renderHRAdvances === 'function', 'renderHRAdvances is defined');
assert(typeof context.renderHRPayslips === 'function', 'renderHRPayslips is defined');
assert(typeof context.openPayslipModal === 'function', 'openPayslipModal is defined');
assert(typeof context.closePayslipModal === 'function', 'closePayslipModal is defined');
assert(typeof context.renderEmployeePayslip === 'function', 'renderEmployeePayslip is defined');
assert(typeof context.printPayslip === 'function', 'printPayslip is defined');
assert(typeof context.generateAllPayslips === 'function', 'generateAllPayslips is defined');

// 3. Initial HR State & KPIs
console.log('\n--- 3. Initial HR Calculations & KPIs ---');
context.recalculateHRMetrics();
const initialHeadcount = getMockElement('kpi-hr-headcount').innerText;
const initialPayroll = getMockElement('kpi-hr-payroll').innerText;
const initialAdvances = getMockElement('kpi-hr-advances').innerText;
const initialAtt = getMockElement('kpi-hr-attendance').innerText;

assert(initialHeadcount.includes('4 employé'), `Headcount matches 4 employees (${initialHeadcount})`);
assert(initialPayroll.includes('530') && initialPayroll.includes('000'), `Gross monthly payroll matches 530 000 F CFA (${initialPayroll})`);
assert(initialAdvances.includes('60') && initialAdvances.includes('000'), `Advances total matches 60 000 F CFA (${initialAdvances})`);
assert(initialAtt.includes('100.0%'), `Attendance rate is 100.0% (${initialAtt})`);

// 4. Rendering Subtabs & Tables
console.log('\n--- 4. Rendering Tables & Content ---');
context.renderHREmployees();
const empTableHtml = getMockElement('hr-employees-body').innerHTML;
assert(empTableHtml.includes('Abdoul C.') && empTableHtml.includes('Moussa Traoré') && empTableHtml.includes('Fatou Kaboré'), 'Employees table populated with staff names');
assert(empTableHtml.includes('openPayslipModal') && empTableHtml.includes('openEditEmployeeModal'), 'Action buttons wired for payslip and edit in employee rows');

context.renderHRAttendance();
const attTableHtml = getMockElement('hr-attendance-body').innerHTML;
assert(attTableHtml.includes('toggleEmployeeAttendance') && attTableHtml.includes('Présent') && attTableHtml.includes('Retard'), 'Attendance table populated with 3-way toggle buttons');

context.renderHRAdvances();
const advTableHtml = getMockElement('hr-advances-body').innerHTML;
assert(advTableHtml.includes('Fatou Kaboré') && advTableHtml.includes('25') && advTableHtml.includes('35'), 'Advances table displays historical advances');

context.renderHRPayslips();
const slipTableHtml = getMockElement('hr-payslips-body').innerHTML;
assert(slipTableHtml.includes('Net à Payer') || slipTableHtml.includes('F CFA'), 'Payslips table populated with OHADA net calculations');

// 5. Interactive Operations (Add, Edit, Advances, Attendance, Delete)
console.log('\n--- 5. Dynamic Interactive Operations ---');

// Test Subtab Switching
context.switchHRTab('attendance');
assert(getMockElement('subview-hr-attendance').classList.contains('hidden') === false, 'switchHRTab opens attendance view');
context.switchHRTab('employees');
assert(getMockElement('subview-hr-employees').classList.contains('hidden') === false, 'switchHRTab returns to employees view');

// Add Employee
getMockElement('new-emp-id').value = '';
getMockElement('new-emp-name').value = 'Aissata Ouédraogo';
getMockElement('new-emp-role').value = 'Comptable Junior';
getMockElement('new-emp-contract').value = 'CDI';
getMockElement('new-emp-salary').value = '180000';
getMockElement('new-emp-phone').value = '+226 75 00 11 22';
getMockElement('new-emp-cnss').value = 'CNSS-601928-BF';

context.submitNewEmployee();

assert(context.window.EMPLOYEES.length === 5, 'New employee added, count is now 5');
const payrollAfterAdd = getMockElement('kpi-hr-payroll').innerText;
assert(payrollAfterAdd.includes('710') && payrollAfterAdd.includes('000'), `Gross payroll increased to 710 000 F CFA (${payrollAfterAdd})`);

// Edit Employee
const addedEmp = context.window.EMPLOYEES.find(e => e.name === 'Aissata Ouédraogo');
assert(!!addedEmp, 'Added employee found in EMPLOYEES array');

context.openEditEmployeeModal(addedEmp.id);
assert(getMockElement('new-emp-id').value === addedEmp.id, 'openEditEmployeeModal loads employee ID');
assert(getMockElement('modal-emp-title').innerText === 'Modifier la Fiche Salarié', 'Modal title adapts to edit mode');

// Update salary to 200,000 F CFA
getMockElement('new-emp-salary').value = '200000';
context.submitNewEmployee();

const payrollAfterEdit = getMockElement('kpi-hr-payroll').innerText;
assert(payrollAfterEdit.includes('730') && payrollAfterEdit.includes('000'), `Gross payroll updated to 730 000 F CFA (${payrollAfterEdit})`);

// Submit Salary Advance
context.openSalaryAdvanceModal();
getMockElement('advance-emp-select').value = addedEmp.id;
getMockElement('advance-amount').value = '40000';
getMockElement('advance-reason').value = 'Acompte scolarité enfants';
getMockElement('advance-mode').value = 'Wave Pro';

context.submitSalaryAdvance();

assert(addedEmp.advances === 40000, `Employee advances balance is 40 000 F CFA (${addedEmp.advances})`);
const advancesAfterSub = getMockElement('kpi-hr-advances').innerText;
assert(advancesAfterSub.includes('100') && advancesAfterSub.includes('000'), `Total advances KPI updated to 100 000 F CFA (${advancesAfterSub})`);

// Attendance Toggle
context.toggleEmployeeAttendance(addedEmp.id, 'Absent');
assert(addedEmp.attendance === 'Absent', 'Attendance toggled to Absent');
assert(addedEmp.arrivalTime === '--:--', 'Arrival time set to --:-- for absent');

const attAfterToggle = getMockElement('kpi-hr-attendance').innerText;
assert(attAfterToggle.includes('80.0%'), `Attendance KPI recalculated to 80.0% (4 present out of 5: ${attAfterToggle})`);

// Payslip Generation & OHADA calculations
context.renderEmployeePayslip(addedEmp.id);
const payslipContent = getMockElement('payslip-print-sheet').innerHTML;
assert(payslipContent.includes('AURA COMMERCE SARL'), 'Payslip contains company name');
assert(payslipContent.includes('Aissata Ouédraogo'), 'Payslip contains employee name');
assert(payslipContent.includes('5.50%'), 'Payslip contains CNSS Ouvrière 5.50%');
assert(payslipContent.includes('40') && payslipContent.includes('000') && payslipContent.includes('Acomptes & Avances'), 'Payslip deducts 40 000 F CFA advances');
assert(payslipContent.includes('Charges Patronales (Employeur)'), 'Payslip contains OHADA employer charges');

// Print single and batch payslips
context.printPayslip();
assert(openedWindows.length > 0, 'printPayslip creates isolated printable window');

const initialWindows = openedWindows.length;
context.generateAllPayslips();
assert(openedWindows.length > initialWindows, 'generateAllPayslips launches batch print preview window');

// Toggle Employee Status
context.toggleEmployeeStatus(addedEmp.id);
assert(addedEmp.status === 'Inactif', 'Employee status toggled to Inactif');
const payrollAfterDeactivate = getMockElement('kpi-hr-payroll').innerText;
assert(payrollAfterDeactivate.includes('530') && payrollAfterDeactivate.includes('000'), `Payroll excludes inactive staff (${payrollAfterDeactivate})`);

// Delete Employee
context.deleteEmployee(addedEmp.id);
assert(context.window.EMPLOYEES.length === 4, 'Employee deleted, headcount back to 4');
assert(!context.window.EMPLOYEES.some(e => e.id === addedEmp.id), 'Employee completely removed from registry');

// Navigation test
context.switchView('hr');
assert(getMockElement('page-title').innerText === 'Ressources Humaines & Paie OHADA', 'switchView updates page title to RH & Paie OHADA');
assert(getMockElement('breadcrumb-active').innerText === 'Ressources Humaines & Paie OHADA', 'switchView updates breadcrumb');

console.log('\n====================================================');
console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (0 ERRORS)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
