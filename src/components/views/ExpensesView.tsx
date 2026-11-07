import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Receipt, Plus, X, Calendar, DollarSign } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatNum, formatDateFr } from '../../utils/formatters';
import type { Expense } from '../../types';

export const ExpensesView: React.FC = () => {
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) || [];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [category, setCategory] = useState('62 - Services extérieurs & Loyers');
  const [beneficiary, setBeneficiary] = useState('');
  const [paymentMode, setPaymentMode] = useState('Espèces');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = async () => {
    if (!desc.trim() || amount <= 0) {
      alert('Veuillez renseigner le motif et un montant valide.');
      return;
    }

    const newExp: Expense = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category,
      desc: desc.trim(),
      beneficiary: beneficiary.trim() || 'Fournisseur / Prestataire',
      amount,
      paymentMode,
      cashierName: 'Responsable Caisse'
    };

    await db.expenses.add(newExp);
    await db.auditLogs.add({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: 'DÉCAISSEMENT_CAISSE',
      user: 'Responsable Caisse',
      module: 'Dépenses',
      details: `Sortie de caisse de ${formatCFA(amount)} pour : ${desc}`
    });

    setIsAddModalOpen(false);
    setDesc('');
    setBeneficiary('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--primary)]" />
            <span>Dépenses, Décaissements & Plan SYSCOHADA</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Total des sorties de caisse : <strong className="text-rose-500 font-mono">{formatCFA(totalExpenses)}</strong>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Décaissement</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scroll">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] text-[10px] uppercase font-bold border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Compte / Catégorie SYSCOHADA</th>
                <th className="p-3">Motif & Justificatif</th>
                <th className="p-3">Bénéficiaire</th>
                <th className="p-3">Mode</th>
                <th className="p-3 text-right">Montant Décaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-[var(--text-muted)]">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    <td className="p-3 font-mono text-[var(--text-muted)]">{formatDateFr(e.date)}</td>
                    <td className="p-3 font-semibold text-[var(--text-main)]">{e.category}</td>
                    <td className="p-3 font-bold text-[var(--text-main)]">{e.desc}</td>
                    <td className="p-3 text-[var(--text-muted)]">{e.beneficiary}</td>
                    <td className="p-3 text-[var(--text-muted)]">{e.paymentMode}</td>
                    <td className="p-3 text-right font-mono font-black text-rose-500">
                      -{formatCFA(e.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Expense */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Nouveau Décaissement de Caisse</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Catégorie Comptable :</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                >
                  <option value="60 - Achats de marchandises" className="bg-slate-900 text-white">60 - Achats de marchandises</option>
                  <option value="61 - Transports & Logistique" className="bg-slate-900 text-white">61 - Transports & Logistique</option>
                  <option value="62 - Services extérieurs & Loyers" className="bg-slate-900 text-white">62 - Services extérieurs & Loyers</option>
                  <option value="65 - Autres charges d'exploitation" className="bg-slate-900 text-white">65 - Autres charges d'exploitation</option>
                  <option value="66 - Salaires & Personnel" className="bg-slate-900 text-white">66 - Salaires & Personnel</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Motif de la Dépense :</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="ex: Facture électricité SONABEL boutique"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Montant (F CFA) :</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono font-bold text-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Bénéficiaire :</label>
                  <input
                    type="text"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    placeholder="ex: SONABEL / Bailleur"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Annuler
              </button>
              <button
                onClick={handleCreateExpense}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-xs"
              >
                Valider Décaissement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
