import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  TrendingUp,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Receipt,
  Users
} from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatNum, formatDateTimeFr } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const credits = useLiveQuery(() => db.credits.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) || [];

  // Metrics
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCashInSales = sales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashInRegister = Math.max(0, 50000 + totalCashInSales - totalExpenses); // assuming 50k initial float

  const totalStockValue = products
    .filter(p => p.type !== 'service')
    .reduce((sum, p) => sum + ((p.stockShelf + p.stockReserve) * p.priceBuy), 0);

  const totalDebtsRemaining = credits.reduce((sum, c) => sum + c.remainingAmount, 450000); // 450k initial sample
  const alertProducts = products.filter(p => p.type !== 'service' && p.stockShelf <= p.alertThreshold);

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[var(--text-main)]">Tableau de Bord 360° • Pilotage Entreprise</h1>
          <div className="text-xs text-[var(--text-muted)]">Vue synthétique en temps réel de votre commerce (Zone FCFA / OHADA)</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-500 border border-teal-500/20">
            Dernière mise à jour : En direct
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold">
            <span>Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-[var(--text-main)]">
            {formatCFA(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{sales.length} ventes enregistrées</span>
          </div>
        </div>

        {/* Cash in Register */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold">
            <span>Trésorerie Caisse (Espèces)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-500">
            {formatCFA(netCashInRegister)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-medium">
            Fond caisse + entrées espèces - sorties
          </div>
        </div>

        {/* Debts / Credits Out */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold">
            <span>Créances Dehors (À Recouvrer)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-500">
            {formatCFA(totalDebtsRemaining)}
          </div>
          <div className="text-[11px] text-amber-500/80 font-bold">
            Relances WhatsApp automatisées
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold">
            <span>Valeur du Stock (Rayon + Dépôt)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-[var(--text-main)]">
            {formatCFA(totalStockValue)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-medium">
            {products.length} références cataloguées
          </div>
        </div>
      </div>

      {/* Middle Grid: Recent Sales & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales List */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              <span>Derniers Encaissements & Tickets</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-bold">Tickets récents</span>
          </div>

          <div className="space-y-2">
            {sales.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] font-medium">
                Aucune vente encore enregistrée. Encaissez votre premier ticket à la caisse !
              </div>
            ) : (
              sales.slice(-6).reverse().map(s => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-black">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-main)]">
                        {s.invoiceNumber} {s.customerName ? `• ${s.customerName}` : ''}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">
                        {formatDateTimeFr(s.createdAt)} • Par {s.cashierName} • {s.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-[var(--text-main)]">
                      {formatCFA(s.total)}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold">Payé ✓</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock Alerts Widget */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Alertes Réapprovisionnement</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">
              {alertProducts.length} urgents
            </span>
          </div>

          <div className="space-y-2">
            {alertProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-500 font-bold">
                Tous les stocks sont à niveau optimal ! Aucun réappro requis.
              </div>
            ) : (
              alertProducts.slice(0, 5).map(p => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)] line-clamp-1">{p.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      Réf: {p.ref} • Seuil critique: {p.alertThreshold}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black font-mono text-rose-500">
                      Rayon: {p.stockShelf}
                    </div>
                    <div className="text-[9px] text-[var(--text-muted)]">Rsv: {p.stockReserve}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
