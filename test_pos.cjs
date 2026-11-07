const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('aura-pos/index.html', 'utf8');

// Simple DOM element mock
class MockElement {
  constructor(id = '', tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.innerHTML = '';
    this.innerText = '';
    this.value = '';
    this.checked = false;
    this._className = '';
    this.classList = {
      _classes: new Set(),
      add: (...cls) => cls.forEach(c => {
        this.classList._classes.add(c);
        this._className = [...this.classList._classes].join(' ');
      }),
      remove: (...cls) => cls.forEach(c => {
        this.classList._classes.delete(c);
        this._className = [...this.classList._classes].join(' ');
      }),
      contains: (c) => this.classList._classes.has(c)
    };
    this.style = {};
  }
  set className(val) {
    this._className = val || '';
    this.classList._classes = new Set(this._className.split(' ').filter(Boolean));
  }
  get className() {
    return this._className || '';
  }
  appendChild(child) {
    return child;
  }
  remove() {}
}

const elements = new Map();
function getEl(id) {
  if (!elements.has(id)) {
    elements.set(id, new MockElement(id));
  }
  return elements.get(id);
}

// Extract ids from html
const idMatches = [...html.matchAll(/id=["']([^"']+)["']/g)];
idMatches.forEach(m => getEl(m[1]));

// Setup global mock
const bodyEl = new MockElement('body', 'body');
const windowMock = {
  document: {
    body: bodyEl,
    getElementById: (id) => getEl(id),
    createElement: (tag) => new MockElement('', tag),
    querySelectorAll: (sel) => {
      const arr = [];
      for (const [id, el] of elements.entries()) {
        if (sel === '.page-view' && id.startsWith('view-')) arr.push(el);
        if (sel === '.nav-btn' && id.startsWith('nav-')) arr.push(el);
        if (sel === '.pay-mode-btn' && id.startsWith('pay-mode-')) arr.push(el);
        if (sel === '[id^="modal-"]' && id.startsWith('modal-')) arr.push(el);
      }
      return arr;
    },
    addEventListener: () => {}
  },
  addEventListener: () => {},
  requestAnimationFrame: (cb) => cb(),
  cancelAnimationFrame: () => {},
  showToast: (msg, type) => console.log(`   [TOAST ${type || 'info'}]: ${msg}`),
  open: () => ({ document: { write: () => {}, close: () => {} } }),
  print: () => {},
  prompt: () => '+22670123456',
  confirm: () => true,
  alert: (msg) => console.log(`   [ALERT]: ${msg}`),
  setTimeout: (fn) => fn(),
  fetch: async (url, opts) => ({
    ok: true,
    json: async () => ({ success: true, data: { id: Date.now() } })
  })
};

// Extract main inline script
const scriptMatch = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('No inline script found!');
  process.exit(1);
}

const context = {
  ...windowMock,
  window: windowMock,
  document: windowMock.document,
  console: console,
  showToast: windowMock.showToast,
  setTimeout: windowMock.setTimeout,
  alert: windowMock.alert,
  confirm: windowMock.confirm,
  prompt: windowMock.prompt,
  requestAnimationFrame: windowMock.requestAnimationFrame,
  fetch: windowMock.fetch
};

// Execute script inside VM context
vm.createContext(context);

try {
  vm.runInContext(scriptMatch[1], context);
  console.log('✓ Script evaluated successfully in VM context\n');
} catch (e) {
  console.error('Script runtime execution failed:', e);
  process.exit(1);
}

function evalInCtx(expr) {
  return vm.runInContext(expr, context);
}

// TEST SUITE FOR MODULE 2: POS
console.log('=== TESTING MODULE 2: CAISSE COMPTOIR & POS TACTILE ===');

let testsPassed = 0;
let testsTotal = 0;

function assert(desc, condition) {
  testsTotal++;
  if (condition) {
    console.log(`✓ ${desc}`);
    testsPassed++;
  } else {
    console.error(`✗ FAILED: ${desc}`);
  }
}

// 1. Navigation to POS
evalInCtx('switchView("pos")');
assert('switchView("pos") activates view-pos and renders categories and products', 
  !getEl('view-pos').classList.contains('hidden') && 
  getEl('pos-categories-bar').innerHTML.length > 0 &&
  getEl('pos-products-grid').innerHTML.length > 0
);

// 2. POS Categories Filter
evalInCtx('filterPOSByCat("Quincaillerie")');
assert('filterPOSByCat filters products and updates active category', 
  evalInCtx('currentPOSCat') === 'Quincaillerie' &&
  getEl('pos-products-grid').innerHTML.includes('Ciment')
);

// 3. Search Filter
evalInCtx('filterPOSProducts("fer")');
assert('filterPOSProducts filters products by text query', 
  getEl('pos-products-grid').innerHTML.includes('Fer') || getEl('pos-products-grid').innerHTML.includes('fer')
);

// Reset category to Tous
evalInCtx('filterPOSByCat("Tous")');

// 4. Add to Cart
const prods = evalInCtx('PRODUCTS');
const firstProd = prods[0];
const initialShelf = firstProd.stockShelf;
evalInCtx(`addToCart('${firstProd.id}')`);
const carts = evalInCtx('CARTS');
const curIdx = evalInCtx('currentCartIndex');

assert('addToCart adds item to active cart', 
  carts[curIdx].length === 1 &&
  String(carts[curIdx][0].id) === String(firstProd.id) &&
  carts[curIdx][0].qty === 1
);

// 5. Increment Qty
evalInCtx(`updateCartItemQty('${firstProd.id}', 1)`);
assert('updateCartItemQty increments quantity', 
  carts[curIdx][0].qty === 2
);

// 6. Line Discount
evalInCtx(`openLineDiscountModal('${firstProd.id}')`);
getEl('discount-val-input').value = '10';
evalInCtx('setDiscountType("percent")');
evalInCtx('applyLineDiscount()');
assert('applyLineDiscount applies 10% discount on cart item', 
  carts[curIdx][0].discount > 0
);

// 7. Global Discount
getEl('global-discount-val').value = '2000';
evalInCtx('setGlobalDiscountType("fixed")');
evalInCtx('applyGlobalDiscount()');
assert('applyGlobalDiscount applies fixed discount on ticket', 
  evalInCtx('globalDiscount') === 2000
);

// 8. Tax Toggle
getEl('tax-toggle').checked = true;
evalInCtx('toggleTax()');
assert('toggleTax activates 18% VAT and updates totals', 
  evalInCtx('isTaxEnabled') === true &&
  getEl('cart-tax').innerText.includes('F CFA')
);

// 9. Multi-cart Switch
evalInCtx('switchCart(1)');
assert('switchCart(1) switches to empty cart 2', 
  evalInCtx('currentCartIndex') === 1 &&
  carts[1].length === 0
);
evalInCtx(`addToCart('${prods[1].id}')`);
assert('addToCart in cart 2 adds item independently', 
  carts[1].length === 1
);
evalInCtx('switchCart(0)');
assert('switchCart(0) returns to cart 1 with original items intact', 
  evalInCtx('currentCartIndex') === 0 &&
  carts[0].length === 1
);

// 10. Held Cart (Mise en attente)
const heldCountBefore = evalInCtx('HELD_CARTS').length;
evalInCtx('saveAsDraft()');
assert('saveAsDraft puts cart into HELD_CARTS and empties active cart', 
  evalInCtx('HELD_CARTS').length === heldCountBefore + 1 &&
  carts[0].length === 0
);

// Restore held cart
evalInCtx('restoreHeldCart(0)');
assert('restoreHeldCart restores items back into active cart', 
  carts[0].length === 1 &&
  evalInCtx('HELD_CARTS').length === heldCountBefore
);

// 11. Checkout / Payment Modal
evalInCtx('openPaymentModal()');
assert('openPaymentModal opens modal-payment with smart cash suggestions', 
  !getEl('modal-payment').classList.contains('hidden') &&
  getEl('modal-pay-total').innerText.includes('F CFA') &&
  getEl('smart-cash-chips-container').innerHTML.includes('cash-tender-chip')
);

// 12. Split Payment Mode
evalInCtx('selectPaymentMode("split")');
assert('selectPaymentMode("split") shows split payment section and splits 50/50', 
  !getEl('split-payment-section').classList.contains('hidden') &&
  Number(getEl('split-cash-input').value) > 0 &&
  Number(getEl('split-mobile-input').value) > 0
);

// 13. Cash Payment & Change Calculation
evalInCtx('selectPaymentMode("cash")');
getEl('cash-received-input').value = '100000';
evalInCtx('calculateChangeReturn()');
assert('calculateChangeReturn computes change return correctly', 
  getEl('cash-change-return').innerText.includes('F CFA') &&
  getEl('cash-change-return').classList.contains('text-emerald-600')
);

// 14. Finalize Checkout
const cartItemsToSell = JSON.parse(JSON.stringify(carts[0]));
const prodToSell = prods.find(p => String(p.id) === String(cartItemsToSell[0].id));
const shelfBeforeSale = prodToSell.stockShelf;
const qtySold = cartItemsToSell[0].qty;

evalInCtx('confirmPaymentAndFinalize()');

assert('confirmPaymentAndFinalize decrements product shelf stock', 
  prodToSell.stockShelf === Math.max(0, shelfBeforeSale - qtySold)
);
assert('confirmPaymentAndFinalize stores window.lastCompletedSale', 
  context.window.lastCompletedSale &&
  context.window.lastCompletedSale.items.length === 1 &&
  context.window.lastCompletedSale.total > 0
);
assert('confirmPaymentAndFinalize empties cart and opens receipt modal', 
  carts[0].length === 0 &&
  !getEl('modal-receipt-preview').classList.contains('hidden')
);

// 15. Dynamic Receipt Content
evalInCtx('renderReceiptContent()');
const receiptHtml = getEl('receipt-paper-content').innerHTML;
assert('renderReceiptContent renders dynamic ticket lines and company info', 
  receiptHtml.includes('AURA COMMERCE') &&
  receiptHtml.includes(cartItemsToSell[0].name) &&
  receiptHtml.includes('TOTAL NET À PAYER')
);

// 16. Proforma Transfer
evalInCtx(`addToCart('${prods[2].id}')`);
evalInCtx('generateProformaA4()');
assert('generateProformaA4 transfers cart items into createDocLinesData and opens proforma studio', 
  evalInCtx('createDocLinesData').length === 1 &&
  evalInCtx('createDocLinesData')[0].desc === prods[2].name
);

console.log(`\n=== RESULTS: ${testsPassed}/${testsTotal} TESTS PASSED ===`);
if (testsPassed === testsTotal) {
  console.log('✓ ALL MODULE 2 (POS TACTILE) TESTS PASSED WITH ZERO ERRORS!');
} else {
  console.error('SOME TESTS FAILED');
  process.exit(1);
}
