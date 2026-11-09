-- ============================================================================
-- 🌌 AURA OS 2.0 — ALL-IN-ONE BUSINESS OS & POS (SCHÉMA SQL DE PRODUCTION)
-- ============================================================================
-- Moteur : PostgreSQL 13+ / Supabase / Neon / Railway / AWS RDS / Docker
-- Conformité : SYSCOHADA Révisé / DGI Facturation Normalisée (UEMOA / CEMAC)
-- Devise par défaut : Franc CFA (XOF / XAF)
-- Mode : PRODUCTION VIERGE (Aucune donnée fictive ou de démo)
-- ============================================================================

-- Activation des extensions pour UUID et cryptographie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Nettoyage préventif (si réinitialisation complète)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;

-- ============================================================================
-- 1. STRUCTURE MULTI-BOUTIQUES & ÉTABLISSEMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Ouagadougou',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    ifu_number VARCHAR(50),
    rccm_number VARCHAR(50),
    is_main BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. UTILISATEURS & GESTION DES ACCÈS (RBAC)
-- ============================================================================
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'cashier', 'storekeeper');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    pin_hash VARCHAR(255) NOT NULL, -- PIN à 4 ou 6 chiffres chiffré (bcrypt ou pgcrypto)
    email VARCHAR(150),
    phone VARCHAR(50),
    permissions JSONB DEFAULT '{
        "can_discount": false,
        "max_discount_pct": 0,
        "can_cancel_sale": false,
        "can_open_drawer": true,
        "can_view_margins": false,
        "can_manage_stock": false,
        "can_close_shift": true,
        "can_manage_settings": false
    }'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CATÉGORIES & FAMILLES DE PRODUITS
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    icon VARCHAR(50) DEFAULT 'tool',
    color_badge VARCHAR(50) DEFAULT 'bg-sky-500/10 text-sky-400',
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, code)
);

-- ============================================================================
-- 4. CATALOGUE D'ARTICLES & PRESTATIONS DE SERVICES
-- ============================================================================
CREATE TYPE product_type AS ENUM ('product', 'service');

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    ref_sku VARCHAR(80) NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    product_type product_type NOT NULL DEFAULT 'product',
    unit VARCHAR(30) DEFAULT 'Unité', -- Sac, Mètre, Litre, Kg, Forfait, etc.
    price_buy NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    price_sell NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock_shelf NUMERIC(15, 2) NOT NULL DEFAULT 0.00,   -- Stock vente comptoir / rayon
    stock_reserve NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- Stock réserve / dépôt gros
    alert_threshold NUMERIC(15, 2) NOT NULL DEFAULT 5.00,
    tva_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,      -- Taux standard TVA 18%
    svg_icon_key VARCHAR(50) DEFAULT 'box',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, ref_sku)
);

-- ============================================================================
-- 5. HISTORIQUE & MOUVEMENTS DE STOCK
-- ============================================================================
CREATE TYPE stock_movement_type AS ENUM (
    'reception_achat',
    'vente_pos',
    'transfert_reserve_vers_rayon',
    'transfert_rayon_vers_reserve',
    'perte_avarie',
    'ajustement_inventaire',
    'retour_client'
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    movement_type stock_movement_type NOT NULL,
    quantity NUMERIC(15, 2) NOT NULL,
    stock_shelf_after NUMERIC(15, 2) NOT NULL,
    stock_reserve_after NUMERIC(15, 2) NOT NULL,
    reference_document VARCHAR(100), -- Réf Facture, BL ou Inventaire
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. CLIENTS & CRM (B2B / B2C / REVENDEURS)
-- ============================================================================
CREATE TYPE customer_type AS ENUM ('B2B', 'B2C', 'RESELLER');

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    customer_type customer_type NOT NULL DEFAULT 'B2C',
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50) NOT NULL,
    whatsapp_phone VARCHAR(50),
    email VARCHAR(150),
    ifu_number VARCHAR(50),
    rccm_number VARCHAR(50),
    city VARCHAR(100) DEFAULT 'Ouagadougou',
    address TEXT,
    credit_limit NUMERIC(15, 2) DEFAULT 0.00,
    balance_due NUMERIC(15, 2) DEFAULT 0.00, -- Dette totale cumulée
    total_spent NUMERIC(15, 2) DEFAULT 0.00, -- CA généré
    loyalty_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. FOURNISSEURS & ACHATS
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    ifu_number VARCHAR(50),
    address TEXT,
    balance_due NUMERIC(15, 2) DEFAULT 0.00, -- Ce que l'entreprise doit au fournisseur
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. GESTION DES SHIFTS & CLÔTURE DE CAISSE (RAPPORT Z)
-- ============================================================================
CREATE TYPE shift_status AS ENUM ('open', 'closed', 'audited');

CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    cashier_name VARCHAR(150) NOT NULL,
    terminal_code VARCHAR(50) DEFAULT 'POS-01',
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    opening_cash NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_sales_cash NUMERIC(15, 2) DEFAULT 0.00,
    total_sales_mobile NUMERIC(15, 2) DEFAULT 0.00,
    total_expenses_cash NUMERIC(15, 2) DEFAULT 0.00,
    theoretical_amount NUMERIC(15, 2) DEFAULT 0.00,
    physical_counted_amount NUMERIC(15, 2) DEFAULT 0.00,
    discrepancy_amount NUMERIC(15, 2) DEFAULT 0.00, -- Écart (positif = excédent, négatif = manquant)
    status shift_status NOT NULL DEFAULT 'open',
    closing_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Décompte physique à l'aveugle des billets et pièces
CREATE TABLE IF NOT EXISTS shift_denominations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    denomination_value INTEGER NOT NULL, -- 10000, 5000, 2000, 1000, 500, 200, 100, 50, 25
    quantity_counted INTEGER NOT NULL DEFAULT 0,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. VENTES COMPTOIR & TICKETS DE CAISSE (POS)
-- ============================================================================
CREATE TYPE payment_method AS ENUM ('especes', 'orange_money', 'wave', 'cheque', 'carte_bancaire', 'credit');
CREATE TYPE sale_status AS ENUM ('completed', 'cancelled', 'refunded');

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    receipt_number VARCHAR(80) NOT NULL,
    subtotal_ht NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    vat_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_ttc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    change_given NUMERIC(15, 2) DEFAULT 0.00,
    payment_method payment_method NOT NULL DEFAULT 'especes',
    status sale_status NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_ref VARCHAR(80),
    product_name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    quantity NUMERIC(15, 2) NOT NULL,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    line_total NUMERIC(15, 2) NOT NULL,
    vat_rate NUMERIC(5, 2) DEFAULT 18.00
);

-- ============================================================================
-- 10. STUDIO DOCUMENTS A4 (FACTURES NORMALISÉES, DEVIS, PROFORMAS, BL)
-- ============================================================================
CREATE TYPE document_type AS ENUM ('invoice', 'proforma', 'quote', 'delivery_note', 'purchase_order');
CREATE TYPE document_status AS ENUM ('draft', 'validated', 'paid', 'cancelled');

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    doc_type document_type NOT NULL,
    doc_ref VARCHAR(80) NOT NULL,
    doc_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    template_name VARCHAR(50) DEFAULT 'corporate',
    apply_stamp BOOLEAN DEFAULT TRUE,
    qr_code_fiscal_url TEXT,
    payment_terms TEXT DEFAULT 'Comptant ou virement sous 30 jours',
    legal_footer TEXT,
    subtotal_ht NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_total NUMERIC(15, 2) DEFAULT 0.00,
    vat_total NUMERIC(15, 2) DEFAULT 0.00,
    total_ttc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status document_status NOT NULL DEFAULT 'validated',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, doc_ref)
);

CREATE TABLE IF NOT EXISTS document_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    unit VARCHAR(30) DEFAULT 'Unité',
    quantity NUMERIC(15, 2) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    total_ht NUMERIC(15, 2) NOT NULL,
    qty_ordered NUMERIC(15, 2) DEFAULT 0.00,
    qty_delivered NUMERIC(15, 2) DEFAULT 0.00,
    qty_remaining NUMERIC(15, 2) DEFAULT 0.00
);

-- ============================================================================
-- 11. CRÉDITS CLIENTS & SUIVI DES REMBOURSEMENTS
-- ============================================================================
CREATE TYPE credit_status AS ENUM ('pending', 'partially_paid', 'paid', 'defaulted');

CREATE TABLE IF NOT EXISTS credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    remaining_amount NUMERIC(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status credit_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_id UUID REFERENCES credits(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'especes',
    receipt_ref VARCHAR(80),
    payment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. DÉPENSES & PLAN COMPTABLE (SYSCOHADA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    syscohada_account VARCHAR(30) NOT NULL, -- Ex: 62 - Loyers & Services, 60 - Achats, etc.
    description TEXT NOT NULL,
    beneficiary VARCHAR(150),
    amount NUMERIC(15, 2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'especes',
    cashier_name VARCHAR(150),
    proof_image_url TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. ZONES DE LIVRAISON, FLOTTE & LOGISTIQUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Ouagadougou',
    delivery_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    estimated_duration VARCHAR(80) DEFAULT '30 à 60 min',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE delivery_status AS ENUM ('pending', 'delivering', 'delivered', 'returned');

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    delivery_ref VARCHAR(80) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    driver_name VARCHAR(150),
    vehicle_info VARCHAR(100),
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    packages_count VARCHAR(50),
    package_weight VARCHAR(50),
    delivery_fee NUMERIC(15, 2) DEFAULT 0.00,
    status delivery_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. ÉQUIPE, CONTRATS & PAIE OHADA
-- ============================================================================
CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'STAGE', 'PRESTATAIRE');
CREATE TYPE employee_status AS ENUM ('Actif', 'Conge', 'Suspendu', 'Demissionnaire');

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(150) NOT NULL,
    contract_type contract_type NOT NULL DEFAULT 'CDI',
    phone VARCHAR(50),
    email VARCHAR(150),
    cnss_number VARCHAR(80),
    base_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    hire_date DATE NOT NULL,
    status employee_status NOT NULL DEFAULT 'Actif',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salary_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    reason TEXT,
    advance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_deducted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    slip_month INTEGER NOT NULL, -- 1 à 12
    slip_year INTEGER NOT NULL,  -- 2026
    base_salary NUMERIC(15, 2) NOT NULL,
    transport_allowance NUMERIC(15, 2) DEFAULT 0.00,
    housing_allowance NUMERIC(15, 2) DEFAULT 0.00,
    food_allowance NUMERIC(15, 2) DEFAULT 0.00,
    other_bonuses NUMERIC(15, 2) DEFAULT 0.00,
    gross_salary NUMERIC(15, 2) NOT NULL,
    employee_cnss_deduction NUMERIC(15, 2) DEFAULT 0.00, -- Ex: 5.5%
    employer_cnss_contribution NUMERIC(15, 2) DEFAULT 0.00, -- Ex: 16%
    salary_advances_deducted NUMERIC(15, 2) DEFAULT 0.00,
    net_salary_paid NUMERIC(15, 2) NOT NULL,
    payment_mode VARCHAR(80) DEFAULT 'Virement Bancaire',
    payment_date DATE,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, slip_month, slip_year)
);

-- ============================================================================
-- 15. CONFIGURATION GÉNÉRALE & PARAMÈTRES FISCAUX
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL DEFAULT 'AURA Commerce',
    trade_name VARCHAR(255),
    tagline VARCHAR(255),
    ifu_number VARCHAR(50),
    rccm_number VARCHAR(50),
    tax_regime VARCHAR(100) DEFAULT 'Réel Normal d''Imposition (RNI)',
    tax_division VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    bank_name VARCHAR(150),
    bank_rib VARCHAR(150),
    currency VARCHAR(20) DEFAULT 'F CFA',
    vat_rate NUMERIC(5, 2) DEFAULT 18.00,
    bic_rate NUMERIC(5, 2) DEFAULT 1.00,
    blind_shift_active BOOLEAN DEFAULT TRUE,
    allow_negative_stock BOOLEAN DEFAULT FALSE,
    multi_depot_active BOOLEAN DEFAULT TRUE,
    printer_paper_width VARCHAR(20) DEFAULT '80mm',
    stamp_image_data TEXT, -- Base64 du cachet humide officiel
    logo_image_data TEXT,  -- Base64 du logo de l'entreprise
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 16. PISTE D'AUDIT & SÉCURITÉ SYSTÈME
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    operator_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(80) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES DE HAUTE PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_ref ON products(ref_sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt ON sales(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_shifts_user ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_documents_ref ON documents(doc_ref);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_ifu ON customers(ifu_number);
CREATE INDEX IF NOT EXISTS idx_credits_due_date ON credits(due_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- ============================================================================
-- INITIALISATION PROPRE POUR DÉPLOIEMENT (ZÉRO DONNÉE FICTIVE)
-- ============================================================================

-- 1. Magasin Principal Initial
INSERT INTO stores (id, code, name, city, is_main, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'MAG-01',
    'Magasin Principal (Siège)',
    'Ouagadougou',
    TRUE,
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- 2. Compte Super Administrateur Initial (PIN par défaut : 1234)
INSERT INTO users (
    id,
    store_id,
    username,
    full_name,
    role,
    pin_hash,
    email,
    permissions,
    is_active
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    'Super Administrateur',
    'super_admin',
    crypt('1234', gen_salt('bf')), -- PIN sécurisé 1234
    'admin@aura-commerce.bf',
    '{
        "can_discount": true,
        "max_discount_pct": 100,
        "can_cancel_sale": true,
        "can_open_drawer": true,
        "can_view_margins": true,
        "can_manage_stock": true,
        "can_close_shift": true,
        "can_manage_settings": true
    }'::jsonb,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 3. Catégories Métiers Initiales (Vierges d'articles)
INSERT INTO categories (store_id, code, name, icon, color_badge) VALUES
('a0000000-0000-0000-0000-000000000001', 'CAT-BTP', 'Quincaillerie & Matériaux', 'tool', 'bg-amber-500/10 text-amber-500'),
('a0000000-0000-0000-0000-000000000001', 'CAT-ALIM', 'Alimentation & Épicerie', 'bread', 'bg-emerald-500/10 text-emerald-500'),
('a0000000-0000-0000-0000-000000000001', 'CAT-BOIS', 'Boissons & Fraîcheur', 'bottle', 'bg-cyan-500/10 text-cyan-600'),
('a0000000-0000-0000-0000-000000000001', 'CAT-REST', 'Restauration & Cuisine', 'dish', 'bg-orange-500/10 text-orange-500'),
('a0000000-0000-0000-0000-000000000001', 'CAT-SRV', 'Prestations & Services', 'switch', 'bg-indigo-500/10 text-indigo-400')
ON CONFLICT (store_id, code) DO NOTHING;

-- 4. Paramètres d'Établissement Vierge
INSERT INTO company_settings (
    store_id,
    store_name,
    trade_name,
    tagline,
    currency,
    vat_rate,
    blind_shift_active,
    allow_negative_stock,
    multi_depot_active
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'AURA Commerce',
    'AURA Commerce & Quincaillerie Générale',
    'Système d''Exploitation Commercial & POS Tout-en-Un',
    'F CFA',
    18.00,
    TRUE,
    FALSE,
    TRUE
);

-- 5. Audit Log d'Initialisation
INSERT INTO audit_logs (store_id, operator_name, action, module, details)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Système',
    'DÉPLOIEMENT_PRODUCTION',
    'Système',
    'Schéma SQL déployé avec succès. Base de données vierge prête à l''exploitation commerciale.'
);
