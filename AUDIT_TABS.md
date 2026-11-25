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
| **2** | `dashboard` | **Tableau de Bord 360°** | `F1` | Vue Principale / Cockpit Stratégique | ✅ **AUDITÉ & VALIDÉ** |
| **3** | `pos` | **Caisse Comptoir (POS)** | `F2` | Vue Principale / Encaissement Direct | ✅ **AUDITÉ & VALIDÉ** |
| **4** | `documents` | **Documents & Facturation A4** | - | Ventes & Commerce B2B/B2C | ✅ **AUDITÉ & VALIDÉ** |
| **5** | `credits` | **Crédits & Recouvrement** | - | Ventes & Commerce / Créances | ✅ **AUDITÉ & VALIDÉ** |
| **6** | `clients` | **Clients & CRM** | - | Ventes & Commerce / Portefeuille | ✅ **AUDITÉ & VALIDÉ** |
| **7** | `stock` | **Stock & Double Dépôt** | - | Stocks & Achats / Dépôt-Rayon | ✅ **AUDITÉ & VALIDÉ** |
| **8** | `suppliers` | **Fournisseurs & Achats** | - | Stocks & Achats / Approvisionnement | ✅ **AUDITÉ & VALIDÉ** |
| **9** | `deliveries` | **Livraisons & Flotte** | - | Logistique & Opérations Externes | ⏳ *En cours / Suivant* |
| **10** | `shifts` | **Shifts & Clôture Z** | - | Finances & Trésorerie / Caisse | ⏳ *À venir* |
| **11** | `expenses` | **Dépenses d'Exploitation** | - | Finances & Trésorerie / Charges SYSCOHADA | ⏳ *À venir* |
| **12** | `hr` | **Équipe & Paie OHADA** | - | Ressources Humaines & Bulletins A4 | ⏳ *À venir* |
| **13** | `accounting` | **Comptabilité & TVA 18%** | - | Finances & Trésorerie / Bilan & Fiscalité | ⏳ *À venir* |
| **14** | `stats` | **Statistiques & Marges** | - | Analytique & Rentabilité Nette | ⏳ *À venir* |
| **15** | `audit` | **Journal d'Audit & Log** | - | Système & Traçabilité Immuable | ⏳ *À venir* |
| **16** | `about` | **À Propos (Barouba Group)** | - | Licence, Support & Mentions Éditeur | ⏳ *À venir* |

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
- Suite Globale Master (`run_all_tests.cjs`) : **20/20 suites [PASS] (302+ assertions, 0 régression)**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°2 — ONGLET 14 : TABLEAU DE BORD 360° (`dashboard` / Raccourci `F1`)

#### 1. Rôle Métier & Description
Cockpit exécutif et financier central conçu selon les normes comptables OHADA. Il consolide en temps réel les flux d'exploitation du magasin : chiffre d'affaires brut et hors-taxe, rentabilité nette réelle déduite des charges, créances clients à recouvrer, dettes fournisseurs, valorisation du stock au coût d'achat et au prix de vente, trésorerie multi-canaux et alertes de rupture.

#### 2. Ce que l'onglet Affiche & Permet de Faire :
- **En-tête & Filtres Temporels Riches** :
  - *Affichage* : Boutons de presets temporels instantanés : `Aujourd'hui`, `7 Jours`, `Ce Mois`, `Année 2026`, complétés par deux champs dateurs libres (`Du [date] au [date]`).
  - *Actions* : Recalcul instantané et dynamique de l'ensemble des 8 indicateurs et du graphique selon la période choisie (`setDashboardPreset`, `applyCustomDashboardDate`).
- **8 Cartes Maîtresses du Cockpit (Navigation Contextuelle en 1 clic)** :
  1. *Chiffre d'Affaires Brut* (TTC et HT) ➔ Clic ouvre la Caisse POS (`switchView('pos')`).
  2. *Bénéfice Net Réel* (après charges d'exploitation) ➔ Clic ouvre l'analyse des marges (`switchView('stats')`).
  3. *Crédits Dehors / Créances* (créances échues) ➔ Clic ouvre le recouvrement (`switchView('credits')`).
  4. *Dettes Fournisseurs* (engagements partenaires) ➔ Clic ouvre les achats (`switchView('suppliers')`).
  5. *Valeur Stock Achat* (capital immobilisé rayon + réserve) ➔ Clic ouvre l'inventaire (`switchView('stock')`).
  6. *Valeur Stock Vente* (potentiel de vente magasin + marge estimée) ➔ Clic ouvre la valorisation (`switchView('stock')`).
  7. *Trésorerie Globale Disponible* (Caisse physique + Wave + Orange Money + Banques) ➔ Clic ouvre les clôtures (`switchView('shifts')`).
  8. *Alertes & Ruptures* (articles sous seuil de réapprovisionnement) ➔ Clic ouvre immédiatement la liste filtrée (`openStockAlertsView()`).
- **Section Analytique & Graphiques Stratégiques** :
  - *Graphique Courbe & Affluence Caisse* : Barres interactives quotidiennes (Lundi au Dimanche) avec infobulle du CA et nombre de tickets ; un clic sur une journée affiche son résumé d'exploitation.
  - *Ventilation Multi-Canaux de Trésorerie* : Répartition pondérée entre Espèces en tiroir, Wave Marchand, Orange Money, et Comptes bancaires.
- **Top Produits & Top Clients Connectés** :
  - *Top 5 Articles les Plus Rentables* : Affichage du visuel produit, nom, quantité vendue, CA réalisé et marge nette générée.
  - *Top 5 Comptes Clients B2B* : Nom de société, contact, volume d'achats cumulé, solde dû et badge de santé financière (`À jour`, `Alerte`, `Critique >30j`).
- **Actions Rapides d'En-tête** :
  - Bouton `Vente Caisse (F2)` pour basculer à la vente immédiate.
  - Bouton `+ Facture A4` ouvrant le studio de facturation.
  - Bouton `+ Dépense` pour saisir une charge d'exploitation immédiate.
  - Bouton `Export CSV` (`exportDashboardReport`) téléchargeant la synthèse chiffrée complète du cockpit.

#### 3. Assainissement & Fiabilisation
- Zéro dépendance externe pour les graphiques (rendu vectoriel CSS/HTML natif garanti hors-ligne).
- Cohérence parfaite des contrastes en Mode Sombre et Mode Clair.
- Tests automatisés complets intégrés au banc d'essai global.

#### 4. Résultat des Tests Automatisés
- Suite Dédiée (`test_dashboard_module.cjs`) : **15/15 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°3 — ONGLET 5 : CAISSE COMPTOIR (POS) (`pos` / Raccourci `F2`)

#### 1. Rôle Métier & Description
Module opérationnel de vente comptoir à haute fréquence. Conçu pour les caissiers et vendeurs magasin, il permet la sélection tactile rapide des produits ou le scan de codes-barres (USB/Bluetooth), la gestion de paniers multiples en attente, le calcul dynamique des remises et taxes, et l'encaissement multi-devises/multi-moyens avec édition instantanée de tickets thermiques ESC/POS 58/80 mm et devis A4.

#### 2. Ce que l'onglet Affiche & Permet de Faire :
- **Colonne Gauche : Catalogue Produits & Grille Tactile** :
  - *Barre Scanner & Recherche* : Champ de saisie optimisé pour douchette code-barres avec validation touche `Entrée` (`handleBarcodeScan`), couplé à une recherche textuelle instantanée (`filterPOSProducts`).
  - *Barre de Catégories Horizontale* : Boutons de filtrage par famille de produits avec défilement fluide (`filterPOSByCat`).
  - *Grille Produits Tactile* : Vignettes visuelles des articles indiquant le nom, le prix de vente en F CFA, et le stock disponible en rayon en temps réel.
- **Colonne Droite : Ticket de Caisse & Panier Tactile** :
  - *Gestion Multi-Paniers Simultanés* : 3 paniers indépendants (`Panier 1`, `Panier 2`, `Panier 3`) permettant d'encaisser un client sans perdre le panier d'un client en cours (`switchCart`).
  - *Bascule Vente Directe vs Devis Proforma* : Bouton de bascule immédiate vers la création d'un devis comptoir (`setDocumentType`).
  - *Sélecteur Client & Solde Débiteur en Direct* : Choix du client (Passager ou compte B2B/B2C enregistré) avec affichage immédiat de son arriéré de créance pour bloquer ou autoriser les ventes à crédit.
  - *Lignes de Panier Dynamiques* : Ajustement rapide des quantités (`+` / `-`), modification de prix unitaire pour les utilisateurs autorisés, remise par ligne (% ou F CFA) via modal dédiée (`openLineDiscountModal`).
  - *Totaux & Fiscalité* : Sous-total HT, remise globale ticket (`applyGlobalDiscount`), interrupteur TVA 18% (`toggleTax`), et Net à Payer en grand format lisible.
  - *Actions de Panier* : Bouton `Vider`, bouton `Mise en attente` (`saveAsDraft` / `restoreHeldCart`), et bouton `Devis A4` (`generateProformaA4` transférant le panier vers le studio de facturation).
- **Modal d'Encaissement & Moyens de Paiement (`modal-payment`)** :
  - *Moyens supportés* : Espèces, Wave Mobile Money, Orange Money, Carte Bancaire, Virement, Crédit client (si autorisé par le rôle).
  - *Paiement Fractionné (Split)* : Répartition automatique 50/50 ou personnalisée entre Espèces et Mobile Money (`selectPaymentMode('split')`).
  - *Calculateur de Rendu Monnaie Intelligent* : Suggestions tactiles de coupures (billets de 10 000, 5 000, 2 000 F CFA) et calcul instantané du montant exact à restituer au client (`calculateChangeReturn`).
  - *Validation & Déstockage Atomique* : Décrémentation immédiate du stock rayon, enregistrement de la vente dans le journal local, mise à jour du shift de caisse actif, et ouverture du tiroir-caisse RJ11.
- **Aperçu & Impression du Ticket Thermique (`modal-receipt-preview`)** :
  - Rendu conforme aux imprimantes thermiques 58 mm et 80 mm avec en-tête dynamique de l'entreprise (Nom, IFU, RCCM, Tél), détail des articles, QR code fiscal e-SINTAX / DGI, et pied de page personnalisable.

#### 3. Résultat des Tests Automatisés
- Suite Dédiée (`test_pos.cjs`) : **21/21 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°4 — ONGLET 6 : DOCUMENTS COMMERCIAUX & FACTURATION A4 (`documents`)

#### 1. Rôle Métier & Description
Module complet d'édition, de suivi et d'émission de l'ensemble des pièces commerciales officielles de l'entreprise (Factures Normalisées A4 conformes DGI, Devis / Factures Proformas, Bons de Livraison, Bons de Commande Fournisseur). Il intègre le puissant **Studio A4** permettant la prévisualisation, l'édition directe sur le document, le changement de design de template et le partage multi-canal.

#### 2. Architecture des Sous-Onglets (4 Sous-Onglets Actifs)
Le système de navigation par sous-onglets segmentés avec barre de défilement Bleu Royal (`subtab-scroll-deck`) regroupe :
1. **Factures Définitives A4** (`doc-tab-invoices`)
2. **Devis & Proformas** (`doc-tab-proformas`)
3. **Bons de Livraison (BL)** (`doc-tab-deliveries`)
4. **Bons de Commande (BC)** (`doc-tab-orders`)

#### 3. Ce que chaque sous-onglet Affiche & Permet de Faire :
- **Indicateurs KPI Synthétiques du Mois** :
  - *Total Facturé TTC* (avec compteur de factures émises).
  - *Devis & Proformas en cours* (montant proposé en attente de validation client).
  - *Créances Factures Impayées* (avec nombre de factures à relancer).
  - *Bons de Livraison émis* (avec suivi des colis livrés et émargés).
- **Sous-onglet 1 : Factures Définitives A4** :
  - *Affichage* : Table complète des factures émises avec N° Chronologique, Client / Raison sociale, Date d'émission, Échéance, Total HT, TVA 18%, Net TTC, Statut de paiement (`Payée`, `Acompte`, `Impayée`).
  - *Actions* : Filtres par statut (`Toutes`, `Payées`, `Impayées / Acompte`), recherche par nom client ou N° facture, bouton d'ouverture directe dans le Studio A4 (`loadDocumentIntoStudio`), relance WhatsApp.
- **Sous-onglet 2 : Devis & Proformas** :
  - *Affichage* : Liste des devis avec durée de validité et statut (`En attente`, `Accepté`, `Converti`).
  - *Actions* : **« Convertir en Facture Définitive »** en un clic avec génération automatique du numéro de facture normalisée et report dans le journal des ventes ; ouverture dans le Studio A4.
- **Sous-onglet 3 : Bons de Livraison (BL)** :
  - *Affichage* : Liste des expéditions avec chauffeur/livreur assigné, zone de livraison, adresse de déchargement et état d'émargement.
  - *Actions* : Génération du BL au format A4 avec mentions de décharge et signature du réceptionnaire.
- **Sous-onglet 4 : Bons de Commande Fournisseurs (BC)** :
  - *Affichage* : Liste des ordres d'achat passés aux fournisseurs partenaires avec montants engagés et statut de livraison.
- **Studio A4 Intégré (Visualiseur & Éditeur Haute Fidélité)** :
  - *5 Styles de Templates interchangeables* : **Corporate** (bandeau bleu royal premium), **DGI Normalisé** (certification fiscale avec QR e-SINTAX et mentions obligatoires), **Minimaliste** (épuré pour impression économique), **Split** (séparation moderne des colonnes), et **Prestige**.
  - *Zones éditables en direct* : Titre, notes de bas de page et conditions de règlement modifiables directement sur la feuille A4 (`contenteditable`).
  - *Liaison Dynamique Complète* : Nom de l'enseigne, IFU, RCCM, Téléphone, Adresse et Logo de l'entreprise s'actualisent automatiquement depuis les Paramètres.
  - *Partage & Export* : Bouton de téléchargement PDF immédiat (`downloadDocumentPDF`), bouton de partage direct par WhatsApp Web avec texte pré-rempli (`shareInvoiceWhatsApp`).

#### 4. Résultat des Tests Automatisés
- Suite Dédiée (`test_documents_module.cjs`) : **47/47 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°5 — ONGLET 4 : CRÉDITS & RECOUVREMENT (`credits`)

#### 1. Rôle Métier & Description
Module financier de surveillance rigoureuse des créances clients et du risque d'impayé. Destiné au gérant et au service comptabilité, il permet de suivre chaque échéance de paiement, d'alerter sur les créances critiques (>30 jours de retard), d'enregistrer les encaissements d'acomptes ou règlements complets, et d'actionner des relances personnalisées automatiques par WhatsApp Web.

#### 2. Ce que l'onglet Affiche & Permet de Faire :
- **Indicateurs KPIs Synthétiques** :
  - *Total Créances Dehors* : Somme consolidée de tous les restes dus clients avec compteur de débiteurs actifs.
  - *Créances Échues (>30j)* : Montant des dettes ayant dépassé la date limite d'échéance contractuelle (en rouge d'alerte).
  - *Recouvré ce mois* : Total cumulé des acomptes et règlements encaissés au cours du mois civil.
  - *Taux de Recouvrement* : Jauge de performance calculée en % par rapport aux objectifs d'encaissement de l'entreprise.
- **Tableau des Créances Clients en Cours** :
  - *Colonnes d'affichage* : Client Débiteur (avec téléphone de contact), Facture Vente de référence, Date d'accord de crédit, Date limite d'échéance, Montant initial, Déjà payé, Reste dû (en gras), Badge de statut financier (`À jour`, `Alerte`, `Critique >30j`, `Soldé`).
  - *Moteur de Recherche Instantané* : Filtrage par nom de client, numéro de téléphone, ou référence de facture.
- **Actions Métier Immédiates (par ligne)** :
  - **Encaisser un Acompte / Règlement** (`openRepayModal`) : Modal d'encaissement d'acompte avec choix du moyen (Espèces, Wave, Orange Money, Virement bancaire), déduction immédiate du solde débiteur, mise à jour du statut en « Soldé » si solde à zéro, et génération d'un reçu de versement imprimable (`printCreditReceipt`).
  - **Relance WhatsApp en 1 Clic** (`sendCreditWhatsAppReminder`) : Ouvre directement WhatsApp avec un message poli, précis et contractuel incluant le nom de la société, le numéro de facture, le montant exact restant dû, et les instructions de paiement.
- **Actions Globales d'En-tête** :
  - Bouton `+ Nouveau Crédit Accordé` (`openNewCreditModal`) : Enregistrement manuel d'une dette client avec liaison au CRM.
  - Bouton `Imprimer État des Dettes` (`printDebtorsReport`) : Génération d'un état récapitulatif officiel A4 imprimable pour les audits et réunions financières.

#### 3. Résultat des Tests Automatisés
- Suite Dédiée (`test_credits_module.cjs`) : **45/45 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°6 — ONGLET 9 : CLIENTS & GESTION COMMERCIALE CRM (`clients`)

#### 1. Rôle Métier & Description
Module de gestion du portefeuille clients de l'entreprise. Il centralise la segmentation des comptes (particuliers comptoir B2C, entreprises B2B avec N° IFU fiscal, revendeurs grossistes), les plafonds de crédit autorisés, les historiques d'achats cumulés, et l'édition des fiches de relevé de compte officiel.

#### 2. Ce que l'onglet Affiche & Permet de Faire :
- **Indicateurs KPIs Portefeuille** :
  - *Comptes Clients Actifs* (avec compteur des nouveaux inscrits du mois).
  - *Clients Entreprises B2B* (sociétés avec identification fiscale IFU/RCCM).
  - *Total Encours Crédits* (part des plafonds de crédit utilisée).
  - *Volume d'Affaires CRM* (total cumulé des achats clients à vie).
- **Système de Sous-Onglets de Segmentation (Barre Bleu Royal `subtab-scroll-deck`)** :
  1. *Tous les Clients* (`crm-tab-ALL`)
  2. *Clients Entreprises B2B* (`crm-tab-B2B`)
  3. *Particuliers Comptoir B2C* (`crm-tab-B2C`)
  4. *Revendeurs & Grossistes* (`crm-tab-RESELLER`)
- **Tableau Central CRM** :
  - *Colonnes d'affichage* : Identité / Société, Segment client, Contact téléphonique & Ville, Total Achats à vie, Encours de crédit actuel, Plafond maximum autorisé, Actions.
  - *Moteur de Recherche Instantané* : Filtrage temps réel par nom, numéro IFU, ou téléphone (`filterCRMTable`).
- **Actions Métier Immédiates (par client)** :
  - **Relevé de Compte A4** (`printClientStatement`) : Génération d'une fiche A4 normalisée avec en-tête dynamique de l'entreprise, historique des factures et solde débiteur.
  - **Contact WhatsApp Direct** (`sendClientWhatsApp`) : Ouverture de WhatsApp pré-ciblé sur le numéro du client.
  - **Édition du Profil** (`openEditClientModal`) : Modification des coordonnées, catégorie tarifaire et plafond de crédit sans doublon.
  - **Suppression Protégée** (`deleteClient`) : Retrait d'un compte avec actualisation des compteurs globaux.
- **Actions Globales** :
  - Bouton `+ Nouveau Client` (`openNewCustomerModal`) avec saisie complète : Raison sociale, N° IFU, Téléphone, Adresse, Plafond crédit, Délai de paiement.
  - Bouton `Exporter CSV` (`exportClientsCSV`) : Export tableur complet de la base clients.

#### 3. Résultat des Tests Automatisés
- Suite Dédiée (`test_clients_module.cjs`) : **60/60 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°7 — ONGLET 3 : GESTION DES STOCKS & DOUBLE DÉPÔT (`stock`)

#### 1. Rôle Métier & Description
Module logistique au cœur de l'ERP. Il implémente l'architecture avancée **Double Dépôt (Rayon de vente au comptoir ⇄ Réserve centrale)**, assurant la traçabilité intégrale des flux physiques, l'alerte sur seuil critique de réapprovisionnement, la gestion des pertes et casses, et la génération de planches d'étiquettes avec codes-barres vectoriels.

#### 2. Architecture des Sous-Onglets (5 Sous-Onglets Actifs - Barre Bleu Royal `subtab-scroll-deck`) :
1. **Catalogue Général & Articles** (`stock-tab-catalog`)
2. **Transferts Inter-Dépôts** (`stock-tab-transfers`)
3. **Journal des Mouvements (Audit Trail)** (`stock-tab-log`)
4. **Pertes, Casses & Rebuts** (`stock-tab-losses`)
5. **Planche Étiquettes Codes-barres** (`stock-tab-barcodes`)

#### 3. Ce que chaque sous-onglet Affiche & Permet de Faire :
- **Indicateurs KPIs de Valorisation Financière** :
  - *Valeur Stock Achat* : Capital immobilisé en magasin calculé dynamiquement au prix d'achat HT (Rayon + Réserve).
  - *Valeur Stock Vente* : Potentiel de vente brut en magasin.
  - *Unités en Rayon* : Nombre total d'unités immédiatement disponibles à la vente comptoir.
  - *Références en Alerte* : Nombre d'articles dont le stock rayon est inférieur ou égal au seuil de sécurité.
- **Sous-onglet 1 : Catalogue Général & Articles** :
  - *Affichage* : Table détaillée avec visuel de l'article, Désignation, Famille/Catégorie, Emplacement, Stock Rayon (avec pastille verte/orange/rouge), Stock Réserve, Prix Achat HT, Prix Vente TTC, Marge unitaire, Boutons d'action.
  - *Actions par article* : **Réassort rapide Rayon ⬅ Réserve** (`openReplenishModal`), Édition article (`openEditProductModal`), Suppression sécurisée.
- **Sous-onglet 2 : Transferts Inter-Dépôts** :
  - *Actions* : Modal de transfert en lot (`openTransferModal`) permettant de déplacer des quantités précises depuis la Réserve vers le Rayon (ou vice-versa) avec enregistrement automatique de l'opérateur et de la date.
- **Sous-onglet 3 : Journal des Mouvements (Traçabilité Immuable)** :
  - *Affichage* : Historique horodaté de chaque mouvement : Ventes caisse, Entrées réception fournisseur, Transferts inter-dépôts, Pertes déclarées, Ajustements d'inventaire.
- **Sous-onglet 4 : Pertes, Casses & Rebuts** :
  - *Actions* : Déclaration de perte (`openDeclareLossModal`) avec motif (Casse manutention, Péremption, Vol, Évaporation), calcul immédiat de la perte financière en F CFA et déduction du stock.
- **Sous-onglet 5 : Planche Étiquettes Codes-barres** :
  - *Fonctionnalité* : Générateur intégré d'étiquettes de prix avec code-barres Code-128 / EAN natif en SVG (zéro dépendance externe), prêt à imprimer sur planches adhésives ou rouleaux thermiques.
- **Actions Globales d'Inventaire** :
  - Bouton `+ Nouvel Article` (`openNewProductModal`).
  - Bouton `Ajustement d'Inventaire Physique` (`openInventoryAdjustModal`) pour aligner le stock théorique sur le comptage réel.
  - Bouton `Export CSV Stock` (`exportStockCSV`) pour inventaire physique.

#### 4. Résultat des Tests Automatisés
- Suite Dédiée (`test_stock_module.cjs`) : **53/53 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---

### 🟢 FICHE D'AUDIT N°8 — ONGLET 10 : FOURNISSEURS & ACHATS (`suppliers`)

#### 1. Rôle Métier & Description
Module d'approvisionnement B2B et de gestion des dettes fournisseurs (conforme au Compte 401 du SYSCOHADA). Il encadre les relations avec les fournisseurs partenaires, la passation de bons de commande (BC), la réception physique des marchandises avec entrée en stock, et le suivi rigoureux des règlements échelonnés.

#### 2. Architecture des Sous-Onglets (3 Sous-Onglets Actifs - Barre Bleu Royal `subtab-scroll-deck`) :
1. **Tous les Partenaires** (`suppliers-tab-ALL`)
2. **Dettes à Régler** (`suppliers-tab-DUE`)
3. **Commandes en Cours & Réceptions** (`suppliers-tab-ORDERS`)

#### 3. Ce que chaque sous-onglet Affiche & Permet de Faire :
- **Indicateurs KPIs Approvisionnement** :
  - *Partenaires Fournisseurs* (nombre d'entreprises sous contrat actif).
  - *Commandes en Cours* (bons de commande émis en attente de livraison).
  - *Total Dettes Fournisseurs* (engagements financiers réels à payer).
  - *Volume d'Achats Cumulé* (total des commandes livrées et réglées).
- **Sous-onglet 1 : Tous les Partenaires Fournisseurs** :
  - *Affichage* : Table des partenaires avec Raison sociale, Ville/Adresse, Contact commercial, Produits livrés, Dettes en cours, Achats totaux, Boutons d'action.
  - *Actions* : Commander (`prepareSupplierOrder`), Règlement de dette (`openSupplierPaymentModal`), Relevé de compte A4 (`printSupplierStatement`), Édition (`openEditSupplierModal`), Suppression.
- **Sous-onglet 2 : Dettes Fournisseurs à Régler** :
  - *Affichage* : Vue filtrée instantanée sur les partenaires auprès desquels l'entreprise a des arriérés à payer.
- **Sous-onglet 3 : Commandes en Cours & Réceptions Physiques** :
  - *Affichage* : Liste des bons de commande avec statut (`En attente de réception`, `Livrée`).
  - *Action Clé* : **« Réceptionner la Marchandise »** (`receivePurchaseOrder`) : En un clic, les quantités commandées entrent directement dans le stock réserve, le journal des mouvements est incrémenté, et la commande passe au statut *Livrée*.
- **Actions Globales** :
  - Bouton `+ Nouveau Fournisseur` (`openNewSupplierModal`).
  - Bouton `Export CSV Fournisseurs` (`exportSuppliersCSV`).

#### 4. Résultat des Tests Automatisés
- Suite Dédiée (`test_suppliers_module.cjs`) : **63/63 assertions [PASS]**
- **Statut Final de l'Onglet** : 🟢 **VALIDÉ & CONFORME PRODUCTION**

---
