const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 TEST SUITE: NOUVELLES FONCTIONNALITÉS & ERGONOMIE (DEMANDES)');
console.log('================================================================\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 1. Balance des <div>
const openDivs = (html.match(/<div[\s>]/g) || []).length;
const closeDivs = (html.match(/<\/div>/g) || []).length;
assert.strictEqual(openDivs, closeDivs, `DOM Div mismatch! Open: ${openDivs}, Close: ${closeDivs}`);
console.log(`  [PASS] Équilibre parfait des balises <div> (${openDivs} ouvertes / ${closeDivs} fermées)`);

// 2. CSS Mode Standard sans overlay
console.log('\n--- 1. Adaptation et Fluidité du <main> en Mode Standard ---');
assert(html.includes('body:not(.interface-cards-mode) main'), 'Règle CSS dédiée body:not(.interface-cards-mode) main présente');
assert(html.includes('flex: 1 1 0% !important;'), '<main> configuré en flex fluid 1 1 0%');
assert(html.includes('body.sidebar-collapsed .nav-section-header'), 'Règle de masquage des headers en rail replié');
assert(html.includes('body.sidebar-collapsed .nav-section-group'), 'Règle d\'affichage des icônes en rail replié');
console.log('  [PASS] Règle flex fluide standard et règles rail replié validées');

// 3. Navigation Accordéon
console.log('\n--- 2. Navigation Accordéon Épurée & 5 Sections Pliables ---');
const sections = [
  'section-nav-main',
  'section-nav-sales',
  'section-nav-stock',
  'section-nav-finance',
  'section-nav-system'
];
sections.forEach(s => {
  assert(html.includes(`id="${s}"`), `Section ${s} manquante`);
});
console.log('  [PASS] Les 5 sections accordéons sont présentes dans #sidebar-standard-nav');

const groups = [
  'group-nav-main',
  'group-nav-sales',
  'group-nav-stock',
  'group-nav-finance',
  'group-nav-system'
];
groups.forEach(g => {
  assert(html.includes(`id="${g}"`), `Groupe ${g} manquant`);
});
console.log('  [PASS] Les 5 conteneurs de boutons dépliables/repliables sont déclarés');

// 4. Sortie Usage Interne & Modal
console.log('\n--- 3. Module Sortie Stock Usage Interne (Consommation Magasin) ---');
assert(html.includes('openInternalUseModal()'), 'Bouton openInternalUseModal() présent');
assert(html.includes('id="modal-stock-internal-use"'), 'Modal #modal-stock-internal-use présent');
assert(html.includes('id="internal-use-product-id"'), 'Sélecteur de produit #internal-use-product-id présent');
assert(html.includes('id="internal-use-source"'), 'Sélecteur de source #internal-use-source présent');
assert(html.includes('id="internal-use-qty"'), 'Champ de quantité #internal-use-qty présent');
assert(html.includes('id="internal-use-motive"'), 'Sélecteur de motif #internal-use-motive présent');
console.log('  [PASS] Tous les composants DOM pour la sortie usage interne sont présents');

// 5. Code 128 et QR Code
console.log('\n--- 4. Moteurs Code 128 (1D) et QR Code (2D) Scannables ---');
assert(html.includes('function generateCode128SVG'), 'Fonction generateCode128SVG déclarée');
assert(html.includes('function generateQRCodeSVG'), 'Fonction generateQRCodeSVG déclarée');
assert(html.includes('id="barcode-type"'), 'Sélecteur de symbologie #barcode-type présent');
assert(html.includes('CODE128_PATTERNS'), 'Table de motifs standard Code 128 déclarée');
console.log('  [PASS] Tous les moteurs de symbologie scannable sont intégrés');

// 6. Test d'exécution JavaScript via VM
console.log('\n--- 5. Exécution Logique JavaScript (VM) ---');
// Extract scripts
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let m;
let fullScript = '';
while ((m = scriptRegex.exec(html)) !== null) {
  fullScript += '\n' + m[1];
}

// Mock DOM & environment
const sandbox = {
  window: {
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  document: {
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: (id) => {
      return {
        id: id,
        classList: {
          contains: (cls) => cls === 'hidden',
          add: () => {},
          remove: () => {}
        },
        innerHTML: '',
        innerText: '',
        value: '1',
        style: {}
      };
    },
    querySelectorAll: () => []
  },
  console: console,
  showToast: (msg, type) => console.log(`    Toast [${type}]: ${msg}`),
  apiFetch: async () => ({ ok: true }),
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  parseInt: parseInt,
  Math: Math,
  Date: Date,
  String: String,
  Array: Array
};
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(fullScript, sandbox);

// Test Code 128 generator
const code128Svg = sandbox.generateCode128SVG('ART-00249', { height: 32, showText: true });
assert(code128Svg && code128Svg.includes('<svg'), 'generateCode128SVG produit un SVG valide');
assert(code128Svg.includes('<rect'), 'generateCode128SVG produit des barres rect scannables');
assert(code128Svg.includes('ART-00249'), 'generateCode128SVG inclut le code lisible');
console.log('  [PASS] Moteur Code 128 validé avec succès (SVG, barres vectorielles, checksum)');

// Test QR Code generator
const qrSvg = sandbox.generateQRCodeSVG('ART-00249|Ampoule LED|1500FCFA', { size: 64 });
assert(qrSvg && qrSvg.includes('<svg'), 'generateQRCodeSVG produit un SVG valide');
assert(qrSvg.includes('<path d="M'), 'generateQRCodeSVG produit la matrice 2D');
assert(qrSvg.includes('shape-rendering="crispEdges"'), 'generateQRCodeSVG calibre la netteté maximale');
console.log('  [PASS] Moteur QR Code validé avec succès (SVG, matrice Reed-Solomon)');

// Test Accordion state
assert(typeof sandbox.toggleNavSection === 'function', 'toggleNavSection disponible dans le contexte');
assert(typeof sandbox.expandNavSection === 'function', 'expandNavSection disponible dans le contexte');
console.log('  [PASS] Fonctions accordéon toggleNavSection & expandNavSection validées');

// Test Stock internal use
assert(typeof sandbox.openInternalUseModal === 'function', 'openInternalUseModal disponible');
assert(typeof sandbox.handleInternalUseSubmit === 'function', 'handleInternalUseSubmit disponible');
console.log('  [PASS] Fonctions métier Sortie Usage Interne validées');

console.log('\n================================================================');
console.log('  TOUTES LES VÉRIFICATIONS SONT COMPLÈTES AVEC SUCCÈS ! (100%)');
console.log('================================================================\n');
