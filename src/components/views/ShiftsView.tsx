import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Lock, Unlock, Printer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { db } from '../../db/schema';
import { useAuth } from '../../context/AuthContext';
import { formatCFA, formatNum, formatDateTimeFr } from '../../utils/formatters';
import type { Shift } from '../../types';

export const ShiftsView: React.FC = () => {
  const shifts = useLiveQuery(() => db.shifts.toArray(), []) || [];
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray(), []) || [];
  const { currentUser } = useAuth();

  const [initialFloat, setInitialFloat] = useState(50000);
  const [actualCashCounted, setActualCashCounted] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Active shift
  const activeShift = shifts.find(s => s.status === 'open');

  // Today cash movements
  const totalCashSales = sales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.total, 0);
  const totalCashExpenses = expenses
    .filter(e => e.paymentMode === 'Espèces')
    .reduce((sum, e) => sum + e.amount, 0);

  const theoreticalCashExpected = (activeShift?.initialAmount || initialFloat) + totalCashSales - totalCashExpenses;
  const cashDifference = actualCashCounted - theoreticalCashExpected;

  const handleOpenShift = async () => {
    const newShift: Shift = {
      id: Date.now(),
      cashierName: currentUser.name,
      startedAt: new Date().toISOString(),
      initialAmount: initialFloat,
      expectedAmount: initialFloat,
      status: 'open'
    };

    await db.shifts.add(newShift);
    alert(`Quart de caisse ouvert avec un fond de ${formatCFA(initialFloat)} par ${currentUser.name} !`);
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;

    if (actualCashCounted <= 0) {
      if (!confirm('Le montant compté est de 0 F CFA. Confirmez-vous la clôture ?')) return;
    }

    await db.shifts.update(activeShift.id, {
      endedAt: new Date().toISOString(),
      expectedAmount: theoreticalCashExpected,
      actualAmount: actualCashCounted,
      difference: cashDifference,
      notes: closingNotes,
      status: 'closed'
    });

    await db.auditLogs.add({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: 'CLÔTURE_CAISSE',
      user: currentUser.name,
      module: 'Caisse',
      details: `Clôture de quart. Attendu : ${formatCFA(theoreticalCashExpected)}, Compté : ${formatCFA(actualCashCounted)}, Écart : ${formatCFA(cashDifference)}`
    });

    alert(`Quart de caisse clôturé avec succès ! Écart : ${formatCFA(cashDifference)}`);
    setActualCashCounted(0);
    setClosingNotes('');
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      <div>
        <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[var(--primary)]" />
          <span>Gestion des Quarts & Clôture de Caisse (Contrôle des Écarts)</span>
        </h2>
        <div className="text-xs text-[var(--text-muted)]">
          Clôture à l'aveugle, traçabilité des espèces physiques et réconciliation comptable
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Shift Status & Action Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[var(--text-main)]">Statut de la Caisse Actuelle</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              activeShift ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'
            }`}>
              {activeShift ? 'Quart Ouvert (En cours)' : 'Caisse Fermée'}
            </span>
          </div>

          {!activeShift ? (
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Fond de Caisse Initial (F CFA) :</label>
                <input
                  type="number"
                  value={initialFloat}
                  onChange={(e) => setInitialFloat(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] font-mono font-bold text-base text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <button
                onClick={handleOpenShift}
                className="w-full py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Unlock className="w-4 h-4" />
                <span>Ouvrir la Caisse & Démarrer le Service</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Opérateur connecté :</span>
                  <strong className="text-[var(--text-main)]">{activeShift.cashierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Heure d'ouverture :</span>
                  <span className="font-mono">{formatDateTimeFr(activeShift.startedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Fond de caisse initial :</span>
                  <span className="font-mono font-bold">{formatCFA(activeShift.initialAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-500">
                  <span>Ventes Espèces encaissées :</span>
                  <span className="font-mono font-bold">+{formatCFA(totalCashSales)}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Dépenses décaissées de caisse :</span>
                  <span className="font-mono font-bold">-{formatCFA(totalCashExpenses)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 border-t border-[var(--border)] text-[var(--text-main)]">
                  <span>Solde Théorique Attendu :</span>
                  <span className="font-mono text-teal-500">{formatCFA(theoreticalCashExpected)}</span>
                </div>
              </div>

              {/* Blind Closing Count */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                    Comptage Physique des Espèces (Billets & Pièces) :
                  </label>
                  <input
                    type="number"
                    value={actualCashCounted}
                    onChange={(e) => setActualCashCounted(parseInt(e.target.value, 10) || 0)}
                    placeholder="Montant total en caisse..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] font-mono font-black text-lg text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Écart de Caisse :</span>
                  <span className={`font-mono font-black text-sm ${
                    cashDifference === 0
                      ? 'text-emerald-500'
                      : cashDifference > 0
                      ? 'text-teal-400'
                      : 'text-rose-500'
                  }`}>
                    {cashDifference > 0 ? `+${formatCFA(cashDifference)} (Excédent)` : cashDifference < 0 ? `${formatCFA(cashDifference)} (Manquant)` : '0 F CFA (Parfait ✓)'}
                  </span>
                </div>

                <button
                  onClick={handleCloseShift}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Clôturer la Caisse & Générer le Bilan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Closed Shifts History */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[var(--text-main)]">Historique des Clôtures Récents</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scroll">
            {shifts.filter(s => s.status === 'closed').length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Aucune session de caisse clôturée pour l'instant.
              </div>
            ) : (
              shifts.filter(s => s.status === 'closed').reverse().map(s => (
                <div key={s.id} className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-main)]">{s.cashierName}</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">{formatDateTimeFr(s.startedAt)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Attendu: {formatNum(s.expectedAmount)} F</span>
                    <span>Compté: {formatNum(s.actualAmount || 0)} F</span>
                    <span className={`font-bold font-mono ${
                      (s.difference || 0) === 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      Écart: {formatCFA(s.difference || 0)}
                    </span>
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
