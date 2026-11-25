# 📋 AURA Business OS — Registre d'Audit Pré-Déploiement Onglet par Onglet

> **Document de Référence & Traçabilité Opérationnelle**  
> **Auteur & Éditeur** : BAROUBA GROUP  
> **Date de démarrage** : 25 Novembre 2026  
> **Application** : AURA Business OS (ERP Commercial & POS Tout-en-Un)  
> **Norme Visuelle** : Royal Blue Facebook (`#1877F2`), Mode Standard Entreprise Unifié, Zero CDN (Autonomie Locale Totale)

---

## 🎯 Méthodologie & Objectifs de l'Audit

Pour chaque onglet et sous-onglet, l'audit vérifie et documente :
1. **Affichage & Données** : Ce qui est affiché à l'écran (indicateurs clés, métriques, listes, tableaux, filtres, graphiques).
2. **Fonctionnalités & Rôles Métier** : Ce que le module permet de faire concrètement (actions, calculs, impressions A4/ticket, exports, raccourcis clavier).
3. **Épuration des Éléments Parasites** : Suppression des onglets/sections purement décoratifs ou maquettes non fonctionnelles.
4. **Déverrouillage des Options Figées** : Transformation de tout paramètre codé en dur en option personnalisable et dynamique (ex: catégories de primes RH libres, modes de paiement, etc.).
5. **Ergonomie & Contraste** : Cohérence stricte en Mode Sombre et Mode Clair, typographies lisibles, adaptation aux formats d'écran.
6. **Tests & Intégrité** : Validation par la suite automatisée des tests unitaires et d'intégration (19/19 suites).

---

## 🗺️ Cartographie Complète des 16 Modules de l'Application

| N° Audit | Clé Système | Nom du Module | Raccourci | Pôle Métier | Statut Audit |
|:---:|:---|:---|:---:|:---|:---:|
| **1** | `settings` | **Paramètres & Fiscalité** | - | Configuration Globale de l'Entreprise | ✅ **AUDITÉ & VALIDÉ** |
| **2** | `clients` | **Clients & CRM** | - | Ventes & Commerce / Portefeuille | ⏳ *En attente* |
| **3** | `suppliers` | **Fournisseurs & Achats** | - | Stocks & Achats / Approvisionnement | ⏳ *En attente* |
| **4** | `stock` | **Stock & Double Dépôt** | - | Stocks & Achats / Dépôt-Rayon | ⏳ *En attente* |
| **5** | `pos` | **Caisse Comptoir (POS)** | `F2` | Vue Principale / Encaissement Direct | ⏳ *En attente* |
| **6** | `documents` | **Documents & Facturation A4** | - | Ventes & Commerce B2B/B2C | ⏳ *En attente* |
| **7** | `credits` | **Crédits & Recouvrement** | - | Ventes & Commerce / Créances | ⏳ *En attente* |
| **8** | `deliveries` | **Livraisons & Flotte** | - | Logistique & Opérations Externes | ⏳ *En attente* |
| **9** | `shifts` | **Shifts & Clôture Z** | - | Finances & Trésorerie / Caisse | ⏳ *En attente* |
| **10** | `expenses` | **Dépenses d'Exploitation** | - | Finances & Trésorerie / Charges SYSCOHADA | ⏳ *En attente* |
| **11** | `hr` | **Équipe & Paie OHADA** | - | Ressources Humaines & Bulletins A4 | ⏳ *En attente* |
| **12** | `accounting` | **Comptabilité & TVA 18%** | - | Finances & Trésorerie / Bilan & Fiscalité | ⏳ *En attente* |
| **13** | `stats` | **Statistiques & Marges** | - | Analytique & Rentabilité Nette | ⏳ *En attente* |
| **14** | `dashboard` | **Tableau de Bord 360°** | `F1` | Vue Principale / Cockpit Stratégique | ⏳ *En attente* |
| **15** | `audit` | **Journal d'Audit & Log** | - | Système & Traçabilité Immuable | ⏳ *En attente* |
| **16** | `about` | **À Propos (Barouba Group)** | - | Licence, Support & Mentions Éditeur | ⏳ *En attente* |

---

## 🔍 Fiches d'Audit Détaillées par Onglet

---

### 🟢 FICHE D'AUDIT N°1 — ONGLET 15 : PARAMÈTRES & FISCALITÉ (`settings`)

#### 1. Rôle Métier & Description
Module névralgique de paramétrage central d'AURA Business OS. Il définit l'identité juridique et fiscale de l'entreprise, les règles d'arrondi monétaire, les protocoles matériels (imprimantes de caisse ESC/POS), les droits d'accès des employés (RBAC), les modèles de factures et tickets, les zones tarifaires de livraison, les politiques de sécurité (sauvegardes JSON, restauration), le moteur d'intelligence artificielle locale, et l'ensemble des règles de calcul de la Paie et des cotisations sociales.

#### 2. Architecture des Sous-Onglets (8 Sous-Onglets Actifs)
Le système de navigation par sous-onglets segmentés regroupe :
1. **1. Général & Boutique** (`settings-tab-general`)
2. **2. Utilisateurs & Droits RBAC** (`settings-tab-rbac`)
3. **3. Imprimantes & Matériel** (`settings-tab-printers`)
4. **4. Logo, Cachet & Documents A4** (`settings-tab-tickets`)
5. **5. Zones de Livraison** (`settings-tab-zones`)
6. **6. Sauvegardes & Licence** (`settings-tab-backups`)
7. **7. Paie, Cotisations & RH** (`settings-tab-payroll`)
8. **8. Agent IA & Copilot** (`settings-tab-ai`)

#### 3. Ce que chaque sous-onglet Affiche & Permet de Faire :
- **Sous-onglet 1 : Général & Boutique**
  - *Affichage* : Formulaire complet d'identité commerciale (Nom d'enseigne, N° IFU/NIF, N° RCCM, Adresse physique, Téléphone commercial, WhatsApp), Sélecteur de Devise de référence (`XOF`, `EUR`, `USD`, `GNF`), Règle d'arrondi monétaire (à l'unité, à 5 F, ou à 10 F), Taux de TVA par défaut (18% UEMOA ou 0% exonéré), Options de caisse (comptage à l'aveugle, interdiction du stock négatif, activation du double dépôt).
  - *Actions* : Modification immédiate avec persistance atomique locale, interrupteur d'activation de la certification e-SINTAX / DGI.
- **Sous-onglet 2 : Utilisateurs & Droits RBAC**
  - *Affichage* : Tableau récapitulatif de tous les collaborateurs avec rôles (`Administrateur`, `Gérant`, `Caissier`), badges de statut (`Actif`, `Suspendu`), matrice de droits granulaires (modification des prix au comptoir, remise maximale autorisée, annulation de vente, clôture de shift, consultation des marges nettes).
  - *Actions* : Création d'un nouvel utilisateur avec code PIN de caisse, édition d'un profil existant, suspension ou réactivation en un clic.
- **Sous-onglet 3 : Imprimantes & Matériel (ESC/POS)**
  - *Affichage* : Configuration du matériel de caisse physique. Protocoles : Bluetooth ESC/POS (BLE direct sans driver), USB direct (WebUSB POS), Réseau local IP/Wi-Fi (Port 9100 Raw), Dialogue standard navigateur. Largeur rouleau (58 mm standard ticket ou 80 mm large).
  - *Actions* : Réglages d'ouverture automatique du tiroir-caisse RJ11 (ESC p 0 25 250), découpe automatique du papier (GS V 66 0), impression immédiate à la validation. Bouton fonctionnel **« Tester l'Impression Diagnostique »** générant un ticket d'épreuve réel avec canevas 384px, code-barres et simulation thermique.
- **Sous-onglet 4 : Logo, Cachet & Documents A4**
  - *Affichage* : Prévisualiseur temps réel du ticket thermique et des factures normalisées. Zones de téléversement d'images pour : Logo de l'entreprise, Cachet humide numérique, Signature du gérant. Coordonnées bancaires (RIB/IBAN) et numéros marchands Mobile Money (Wave, Orange Money).
  - *Actions* : Personnalisation des en-têtes et pieds de page, activation/désactivation de l'impression du QR Code fiscal e-SINTAX et du Code-128 sur les documents.
- **Sous-onglet 5 : Zones de Livraison**
  - *Affichage* : Liste des secteurs et communes desservis avec frais de livraison forfaitaires en F CFA, délais moyens estimés, et statut d'activité.
  - *Actions* : Modal d'ajout de nouvelle zone, modification des tarifs par quartier, désactivation temporaire de zones non desservies.
- **Sous-onglet 6 : Sauvegardes & Licence**
  - *Affichage* : Statistiques de la base locale (nombre d'articles, clients, ventes, logs), statut de la licence hors-ligne.
  - *Actions* : **« Exporter la Sauvegarde JSON Complète »** (téléchargement immédiat sans cloud), **« Restaurer une Sauvegarde »** (importation sécurisée avec vérification d'intégrité), bouton de réinitialisation usine protégée par confirmation de sécurité.
- **Sous-onglet 7 : Paie, Cotisations & RH**
  - *Affichage* : Paramétrage social et fiscal des salaires : activation des cotisations sociales (CNSS), saisie des taux ouvrier (5.5%) et patronal (16.0%), impôt sur traitements (IUTS / IRPP) avec choix entre barème progressif officiel DGI ou taux forfaitaire libre.
  - *Actions & Nouveauté Déverrouillée* : **Gestionnaire Dynamique des Primes & Indemnités d'Entreprise** (voir ci-dessous).
- **Sous-onglet 8 : Agent IA & Copilot**
  - *Affichage* : Configuration du Copilot conversationnel local, saisie sécurisée de la clé API Gemini (sauvegardée en local uniquement), modèle de langage sélectionné, niveau d'autonomie et consignes contextuelles pour l'assistance à la vente.

#### 4. Assainissement & Nettoyages Opérés
- ❌ **Suppression définitive du sous-onglet orphelin « Bureau & Dock OS »** : Cet onglet était une relique de l'ancien Mode Cartes supprimé. Plus de 23,6 Ko de code mort (gestion du dock flottant macOS, sélecteurs de fonds d'écran dynamiques) ont été purgés du DOM.
- 🔄 **Renumérotation propre** : L'onglet Agent IA & Copilot est passé proprement au rang **8** (sur 8 sous-onglets).
- 🧹 **Nettoyage de la fonction `switchSettingsTab`** : Suppression de toute référence à `'appearance'`, fiabilisant la navigation.

#### 5. Déverrouillage des Options Figées (Spécification Utilisateur Réalisée)
- 🚀 **Système Dynamique des Primes & Indemnités d'Entreprise** :
  - *Avant* : Seules 3 primes étaient codées en dur (Transport, Logement, Panier repas) avec des champs fixes non modifiables dans leur structure.
  - *Maintenant* : Un gestionnaire de rubriques dynamique complet permet à l'entreprise d'ajouter **n'importe quelle prime ou indemnité sur-mesure** propre à son activité (ex: *Prime de Santé*, *Allocation Enfant*, *Prime d'Assiduité*, *Prime de Caisse*, *Prime de Risque*, etc.).
  - Chaque prime dispose d'un montant par défaut ajustable en direct et d'un bouton de suppression.
  - La fonction de génération des bulletins de paie A4 (`renderEmployeePayslip`) calcule et affiche automatiquement ces rubriques personnalisées avec leur intitulé exact et leur valeur sur le document officiel.

#### 6. Résultat des Tests Automatisés
- Suite Paramètres (`test_settings_module.cjs`) : **141/141 assertions [PASS]**
- Suite Décommissionnement & Primes Dynamiques (`test_appearance_settings.cjs`) : **15/15 assertions [PASS]**
- Suite Globale Master (`run_all_tests.cjs`) : **19/19 suites [PASS] (287+ assertions, 0 régression)**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---
