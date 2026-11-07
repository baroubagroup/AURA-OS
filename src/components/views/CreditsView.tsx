import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CreditCard, MessageSquare, Check, Phone, Plus, X } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatNum, formatDateFr } from '../../utils/formatters';
import type { Credit } from '../../types';

export const CreditsView: React.FC = () => {
  const credits = useLiveQuery(() => db.credits.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('1');
  const [amount, setAmount] = useState(150000);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  const totalCredits = credits.reduce((sum, c) => sum + c.remainingAmount, 0);

  const handleCreateCredit = async () => {
    const cust = customers.find(c => c.id === selectedCustomerId);
    if (!cust || amount <= 0) return;

    const newCredit: Credit = {
      id: Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      phone: cust.phone,
      totalAmount: amount,
      paidAmount: 0,
      remainingAmount: amount,
      dueDate,
      status: 'pending'
    };

    await db.credits.add(newCredit);
    setIsAddModalOpen(false);
  };

  const handlePayCredit = async (creditId: number, payAmt: number) => {
    const cred = await db.credits.get(creditId);
    if (!cred) return;

    const nextPaid = cred.paidAmount + payAmt;
    const nextRem = Math.max(0, cred.totalAmount - nextPaid);
    const nextStatus = nextRem === 0 ? 'paid' : 'partial';

    await db.credits.update(creditId, {
      paidAmount: nextPaid,
      remainingAmount: nextRem,
      status: nextStatus
    });

    alert(`Règlement de ${formatCFA(payAmt)} enregistré pour ${cred.customerName} !`);
  };

  const handleSendWhatsAppReminder = (cred: Credit) => {
    const cleanPhone = cred.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour M./Mme ${cred.customerName},\n\nAURA Commerce SARL vous remercie pour votre fidélité. Nous vous rappelons que votre créance d'un montant restant de ${formatCFA(cred.remainingAmount)} arrive à échéance le ${formatDateFr(cred.dueDate)}.\n\nModes de règlement acceptés : Virement Coris Bank, Orange Money ou Espèces en boutique.\n\nExcellente journée à vous !`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span>Créances Clients & Recouvrement (Carnet de Dettes)</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Total des créances à recouvrer : <strong className="text-amber-500 font-mono">{formatCFA(totalCredits)}</strong>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Créance</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scroll">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] text-[10px] uppercase font-bold border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Client & Contact</th>
                <th className="p-3">Échéance</th>
                <th className="p-3 text-right">Montant Initial</th>
                <th className="p-3 text-right">Déjà Réglé</th>
                <th className="p-3 text-right">Reste à Payer</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {credits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-[var(--text-muted)]">
                    Aucune créance en cours. Toutes les dettes sont soldées !
                  </td>
                </tr>
              ) : (
                credits.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-[var(--text-main)]">{c.customerName}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{c.phone}</div>
                    </td>
                    <td className="p-3 font-mono text-[var(--text-muted)]">{formatDateFr(c.dueDate)}</td>
                    <td className="p-3 text-right font-mono font-bold text-[var(--text-main)]">{formatNum(c.totalAmount)} F</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-500">{formatNum(c.paidAmount)} F</td>
                    <td className="p-3 text-right font-mono font-black text-amber-500">{formatCFA(c.remainingAmount)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        c.status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : c.status === 'partial'
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}>
                        {c.status === 'paid' ? 'Soldé ✓' : c.status === 'partial' ? 'Partiel' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleSendWhatsAppReminder(c)}
                          title="Relance WhatsApp directe"
                          className="px-2 py-1 rounded-lg bg-emerald-600/15 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        {c.remainingAmount > 0 && (
                          <button
                            onClick={() => handlePayCredit(c.id, c.remainingAmount)}
                            className="px-2 py-1 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all text-[10px] font-bold"
                          >
                            Régler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Credit */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Créer une Créance Client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Client Débiteur :</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Montant Créance (F CFA) :</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono font-bold text-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Date d'Échéance :</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Annuler
              </button>
              <button
                onClick={handleCreateCredit}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-xs"
              >
                Enregistrer la Dette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
