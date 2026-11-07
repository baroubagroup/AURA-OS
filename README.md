# 🌌 AURA OS 2.0 — All-In-One Business OS & POS

[![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](https://github.com/baroubagroup/AURA-OS)
[![Interface](https://img.shields.io/badge/UI-macOS%20Big%20Sur%20Glassmorphism-sky.svg)](https://github.com/baroubagroup/AURA-OS)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Mode%20(OS%20%2F%20Standard)-violet.svg)](https://github.com/baroubagroup/AURA-OS)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](https://github.com/baroubagroup/AURA-OS)

**AURA OS** est un système d'exploitation commercial nouvelle génération conçu pour transformer n'importe quel ordinateur ou tablette en un poste de gestion d'entreprise complet, ultra-rapide et ergonomique.

Inspiré par la fluidité et l'esthétique premium de **macOS Big Sur**, AURA OS élimine la lourdeur des logiciels ERP traditionnels pour offrir une expérience fluide, visuelle et instantanée.

---

## 🖥️ Expérience Utilisateur & Double Interface

AURA OS dispose d'une architecture révolutionnaire à double mode d'affichage convertible à tout moment (`Alt + I`) :

### 1. 🪟 Mode Cartes (Bureau Système AURA OS)
* **Bureau & Launchpad plein écran** : Grille d'applications glassmorphes, dossiers interactifs à ouverture fluide et recherche universelle instantanée.
* **Dock macOS 3D Squircles** : Barre de navigation flottante avec icônes en relief 3D, biseau spéculaire et animations de rebond physique Apple.
* **Personnalisation Totale (Paramètres > Bureau & Dock OS)** :
  * 📍 **Positionnement du Dock** : En Bas (horizontal macOS), À Gauche (vertical), À Droite (vertical) ou En Haut.
  * 🎨 **Fonds d'écran Ultra-HD** :
    * 🌊 *macOS Big Sur* (Vagues chromatiques fluides en pur SVG).
    * 🌄 *macOS Sonoma Canyon* (Crépuscule géométrique ambré).
    * 🌲 *macOS Sequoia Aurora* (Ambiance émeraude boréale).
    * 🖼️ *Import Personnalisé* (Chargez la photo de votre boutique ou enseigne locale).
  * 📌 **Raccourcis Épinglés** : Masquez ou affichez vos applications prioritaires sur le dock.

### 2. 🏢 Mode Standard (Entreprise Formel)
* Sidebar latérale classique optimisée pour les postes de comptabilité et de saisie intensive.

---

## 💼 Les 14 Modules Métiers Intégrés

| Module | Fonctionnalités Clés |
| :--- | :--- |
| **🛒 1. Caisse Tactile POS** | Vente rapide comptoir, multi-paniers (Panier 1, 2, 3), recherche code-barres USB/Bluetooth, calcul automatique de monnaie, raccourcis clavier F1/F2/Espace. |
| **📑 2. Facturation & Devis A4** | Édition de factures normalisées, proformas et bordereaux de livraison conformes DGI / e-SINTAX avec QR Code fiscal, cachet et signature numérique. |
| **📦 3. Stocks & Dépôts** | Gestion double dépôt (Rayon de vente vs Réserve), inventaires tournants, alertes de rupture paramétrables et valorisation du stock au CMP. |
| **👥 4. Clients & CRM** | Portefeuille B2B / B2C, suivi des dettes et encours de crédit, balances âgées et relances automatisées directes par WhatsApp. |
| **🔒 5. Shifts & Clôture Z** | Gestion des ouvertures et fermetures de caisse, comptage physique des espèces à l'aveugle (*Blind Shift*), détection des écarts et ticket Z. |
| **👤 6. Équipe & Paie OHADA** | Gestion des employés, édition des bulletins de paie conformes OHADA, calcul des cotisations sociales (CNSS/CNPS), primes et acomptes. |
| **💰 7. Dépenses & Caisse** | Enregistrement des décaissements et menues dépenses par plan comptable SYSCOHADA avec pièces justificatives. |
| **🚚 8. Flotte & Logistique** | Tableau Kanban des livraisons en cours, affectation des livreurs/coursiers et tarification automatique par zone géographique. |
| **🏭 9. Fournisseurs & Achats** | Suivi des commandes fournisseurs, réceptions de marchandises, factures d'achat et échéanciers de paiement fournisseurs. |
| **📊 10. Cockpit & Décisionnel** | Tableau de bord analytique en temps réel : Chiffre d'affaires, marges nettes réelles, top produits et panier moyen. |
| **⚖️ 11. Fiscalité & Déclaration TVA** | Suivi de la TVA collectée et déductible (18%), états préparatoires pour télédéclarations fiscales et exports comptables CSV/Excel. |
| **⚙️ 12. Sécurité & Droits RBAC** | Profils utilisateurs (Super Admin, Gérant, Caissier), codes PIN d'accès, permissions de remise et d'annulation de ticket. |
| **🖨️ 13. Périphériques ESC/POS** | Support natif des imprimantes thermiques 58mm et 80mm, tiroirs-caisses RJ12, massicots et mode diagnostic d'impression. |
| **💾 14. Sauvegarde & Restauration** | Export complet des données en JSON chiffré, réinitialisation usine protégée et fonctionnement autonome hors-ligne (*Local-First*). |

---

## 🚀 Démarrage Rapide

### Prérequis
* [Node.js](https://nodejs.org/) (version 18 ou supérieure)
* `npm` ou `pnpm`

### Installation
```bash
# 1. Cloner le dépôt
git clone https://github.com/baroubagroup/AURA-OS.git
cd AURA-OS

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur backend
node server/server.js

# 4. Lancer le serveur de développement frontend (dans un second terminal)
npm run dev
```

L'application est immédiatement accessible sur `http://localhost:5173/` (Frontend) et communique avec le serveur sur `http://localhost:3001/` (API).

---

## 🧪 Tests & Assurance Qualité

Le projet intègre une suite de tests rigoureuse assurant l'intégrité de l'ensemble des modules :

```bash
# Vérification de l'équilibre structural du DOM
node check_balance.cjs

# Exécution de la suite complète d'intégration maîtresse (104 tests)
node test_master_integration.cjs

# Exécution des tests du module Paramètres & Licence (141 tests)
node test_settings_module.cjs

# Exécution des tests d'ergonomie et personnalisation Dock/Bureau (15 tests)
node test_appearance_settings.cjs

# Test du système de double interface
node test_dual_interface.cjs
```

---

## 🛠️ Stack Technique
* **Frontend** : HTML5 sémantique, Tailwind CSS, Lucide / Canvas / SVG, Vanilla JS haute performance réactif sans framework lourd.
* **Backend** : Node.js, Express REST API, SQLite / IndexedDB Local-First.
* **Impression** : ESC/POS, HTML5 Print Engine, Barcode/QR Code renderers.

---

## 📄 Licence

Propriété exclusive de **BAROUBA GROUP**. Tous droits réservés.
Pour toute demande de licence commerciale ou de déploiement en réseau, contactez : [baroubagroup@gmail.com](mailto:baroubagroup@gmail.com).
