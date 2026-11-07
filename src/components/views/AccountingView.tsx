import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calculator, Download, CheckCircle, FileText } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatNum, formatDateFr } from '../../utils/formatters';

export const AccountingView: React.FC = () => {
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) || [];

  const totalSalesTTC = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesHT = Math.round(totalSalesTTC / 1.18);
  const totalVatCollected = totalSalesTTC - totalSalesHT;

  const totalExpensesTTC = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedVatDeductible = Math.round(totalExpensesTTC * 0.18 * 0.6); // 60% deductible
  const netVatDueToDgi = Math.max(0, totalVatCollected - estimatedVatDeductible);

  const operatingProfit = totalSalesHT - totalExpensesTTC;

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--primary)]" />
            <span>Comptabilité Fiscale OHADA (SYSCOHADA Révisé)</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Journal des écritures, Déclaration mensuelle TVA 18% et Bilan d'exploitation
          </div>
        </div>

        <button
          onClick={() => alert('Export du Grand Livre et Journal des Ventes au format Excel (XLSX) généré.')}
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:bg-slate-800 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Journal (Excel / CSV)</span>
        </button>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="text-xs font-bold text-[var(--text-muted)]">TVA Collectée sur Ventes (18%)</div>
          <div className="text-xl font-black font-mono text-[var(--text-main)]">{formatCFA(totalVatCollected)}</div>
          <div className="text-[11px] text-[var(--text-muted)]">Compte 443 - État, TVA Facturée</div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="text-xs font-bold text-[var(--text-muted)]">TVA Déductible sur Charges</div>
          <div className="text-xl font-black font-mono text-emerald-500">{formatCFA(estimatedVatDeductible)}</div>
          <div className="text-[11px] text-[var(--text-muted)]">Compte 445 - État, TVA Récupérable</div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="text-xs font-bold text-[var(--text-muted)]">TVA Nette à Reverser à la DGI</div>
          <div className="text-xl font-black font-mono text-rose-500">{formatCFA(netVatDueToDgi)}</div>
          <div className="text-[11px] text-rose-500/80 font-bold">Déclaration DGI avant le 20 du mois</div>
        </div>
      </div>

      {/* Journal des Ventes */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-500" />
            <span>Grand Livre des Ventes (Journal Comptable)</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">{sales.length} écritures</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] text-[10px] uppercase font-bold border-b border-[var(--border)]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Pièce</th>
                <th className="p-2.5">Compte Débit (Trésorerie)</th>
                <th className="p-2.5">Compte Crédit (701 Ventes HT)</th>
                <th className="p-2.5">TVA Collectée (443)</th>
                <th className="p-2.5 text-right">Montant Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-[var(--text-muted)]">
                    Aucune écriture comptable générée.
                  </td>
                </tr>
              ) : (
                sales.slice(-8).reverse().map(s => {
                  const sHT = Math.round(s.total / 1.18);
                  const sTVA = s.total - sHT;
                  const debitAccount = s.paymentMethod === 'cash' ? '571 - Caisse Principale' : '521 - Banque (Coris / Ecobank)';

                  return (
                    <tr key={s.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                      <td className="p-2.5 font-mono text-[var(--text-muted)]">{formatDateFr(s.createdAt)}</td>
                      <td className="p-2.5 font-bold font-mono text-[var(--primary)]">{s.invoiceNumber}</td>
                      <td className="p-2.5 font-semibold text-[var(--text-main)]">{debitAccount}</td>
                      <td className="p-2.5 font-mono font-bold">{formatNum(sHT)} F</td>
                      <td className="p-2.5 font-mono text-emerald-500 font-bold">{formatNum(sTVA)} F</td>
                      <td className="p-2.5 text-right font-mono font-black text-[var(--text-main)]">{formatCFA(s.total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
