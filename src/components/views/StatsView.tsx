import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatNum } from '../../utils/formatters';

export const StatsView: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];

  const topProducts = products
    .map(p => ({
      name: p.name,
      cat: p.cat,
      price: p.priceSell,
      margin: p.priceSell > 0 ? Math.round(((p.priceSell - p.priceBuy) / p.priceSell) * 100) : 0
    }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 7);

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      <div>
        <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
          <span>Statistiques Décisionnelles & Analyse des Marges</span>
        </h2>
        <div className="text-xs text-[var(--text-muted)]">
          Rentabilité par famille de produits, performance des ventes et analyse des coûts
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Margins */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Articles & Prestations les Plus Rentables</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-bold">Marge Brute %</span>
          </div>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-main)]">{p.name}</span>
                  <span className="font-black font-mono text-emerald-500">{p.margin}%</span>
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, p.margin)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>{p.cat}</span>
                  <span className="font-mono">Prix Vente: {formatNum(p.price)} F CFA</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by category summary */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span>Répartition du Chiffre d'Affaires</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { cat: 'Quincaillerie, Électricité & BTP', pct: 45, col: 'bg-teal-500' },
              { cat: 'Alimentation Générale & Supérette', pct: 25, col: 'bg-amber-500' },
              { cat: 'Boissons & Brasserie', pct: 15, col: 'bg-blue-500' },
              { cat: 'Prestations de Services & Logistique', pct: 15, col: 'bg-indigo-500' }
            ].map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{c.cat}</span>
                  <span className="font-mono">{c.pct}%</span>
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden">
                  <div className={`${c.col} h-full rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
