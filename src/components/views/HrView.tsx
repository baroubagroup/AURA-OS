import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  UserCheck,
  Plus,
  Coins,
  Printer,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  X
} from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatNum, formatDateFr } from '../../utils/formatters';
import { printA4Element } from '../../services/a4Printer';
import type { Employee, AttendanceStatus } from '../../types';

export const HrView: React.FC = () => {
  const employees = useLiveQuery(() => db.employees.toArray(), []) || [];
  const [selectedEmpForPayslip, setSelectedEmpForPayslip] = useState<Employee | null>(null);
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState<boolean>(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState<boolean>(false);

  // New Employee Form
  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpRole, setNewEmpRole] = useState<string>('');
  const [newEmpContract, setNewEmpContract] = useState<'CDI' | 'CDD' | 'Stage' | 'Prestation'>('CDI');
  const [newEmpSalary, setNewEmpSalary] = useState<number>(120000);
  const [newEmpPhone, setNewEmpPhone] = useState<string>('+226 70 00 00 00');
  const [newEmpCnss, setNewEmpCnss] = useState<string>('');

  // Advance Form
  const [advanceEmpId, setAdvanceEmpId] = useState<string>('1');
  const [advanceAmount, setAdvanceAmount] = useState<number>(20000);
  const [advanceReason, setAdvanceReason] = useState<string>('Acompte quinzaine');

  const handleToggleAttendance = async (empId: string, status: AttendanceStatus) => {
    let arrivalTime = '07:45';
    if (status === 'Retard') arrivalTime = '08:40';
    if (status === 'Absent') arrivalTime = 'Absent';

    await db.employees.update(empId, { attendance: status, arrivalTime });
  };

  const handleCreateEmployee = async () => {
    if (!newEmpName.trim()) {
      alert('Veuillez saisir le nom du salarié.');
      return;
    }

    const id = (employees.length + 1).toString();
    const newEmp: Employee = {
      id,
      name: newEmpName.trim(),
      role: newEmpRole.trim() || 'Agent Polyvalent',
      contract: newEmpContract,
      salaryBase: newEmpSalary,
      phone: newEmpPhone,
      cnss: newEmpCnss || `CNSS-00${id}-BF`,
      hired: new Date().toISOString().split('T')[0],
      status: 'Actif',
      attendance: 'Présent',
      arrivalTime: '07:45',
      advances: 0
    };

    await db.employees.add(newEmp);
    setIsNewEmpModalOpen(false);
    setNewEmpName('');
    setNewEmpRole('');
  };

  const handleSubmitAdvance = async () => {
    if (advanceAmount <= 0) return;
    const emp = await db.employees.get(advanceEmpId);
    if (!emp) return;

    const nextAdvances = emp.advances + advanceAmount;
    await db.employees.update(advanceEmpId, { advances: nextAdvances });

    await db.salaryAdvances.add({
      id: Date.now(),
      date: new Date().toISOString(),
      empId: emp.id,
      employeeName: emp.name,
      amount: advanceAmount,
      reason: advanceReason,
      status: 'Validé & Décaissé'
    });

    // Add to cash expenses
    await db.expenses.add({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: '66 - Salaires & Personnel',
      desc: `Avance sur salaire pour ${emp.name}`,
      beneficiary: emp.name,
      amount: advanceAmount,
      paymentMode: 'Espèces',
      cashierName: 'Direction RH'
    });

    setIsAdvanceModalOpen(false);
    alert(`Acompte de ${formatCFA(advanceAmount)} validé pour ${emp.name} et déduit du bulletin !`);
  };

  const presentCount = employees.filter(e => e.attendance === 'Présent').length;
  const lateCount = employees.filter(e => e.attendance === 'Retard').length;
  const absentCount = employees.filter(e => e.attendance === 'Absent').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      {/* Top Header Toolbar */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[var(--primary)]" />
            <span>Ressources Humaines, Pointage & Paie OHADA</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Effectif actif : <strong>{employees.length} collaborateurs</strong> • Pointage journalier & gestion des acomptes
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--primary)] flex items-center gap-1.5 transition-all"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Octroyer Acompte</span>
          </button>

          <button
            onClick={() => setIsNewEmpModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Salarié</span>
          </button>
        </div>
      </div>

      {/* Attendance KPI Cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-black">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">Présents à l'heure</div>
            <div className="text-lg font-black font-mono text-[var(--text-main)]">{presentCount} / {employees.length}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-black">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">Retards enregistrés</div>
            <div className="text-lg font-black font-mono text-amber-500">{lateCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center font-black">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">Absences justifiées/non</div>
            <div className="text-lg font-black font-mono text-rose-500">{absentCount}</div>
          </div>
        </div>
      </div>

      {/* Employees Table with Pointage & Payslip Buttons */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto custom-scroll">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] text-[10px] uppercase font-bold border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Salarié & Poste</th>
                <th className="p-3">Contrat</th>
                <th className="p-3 text-right">Salaire Base</th>
                <th className="p-3 text-right">Acomptes Mois</th>
                <th className="p-3 text-center">Heure Arrivée</th>
                <th className="p-3 text-center">Pointage Journalier</th>
                <th className="p-3 text-center">Action Bulletin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-[var(--text-main)]">{emp.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{emp.role} • {emp.phone}</div>
                  </td>
                  <td className="p-3 font-semibold text-[var(--text-muted)]">{emp.contract}</td>
                  <td className="p-3 text-right font-mono font-bold text-[var(--text-main)]">
                    {formatNum(emp.salaryBase)} F
                  </td>
                  <td className="p-3 text-right font-mono text-rose-500 font-bold">
                    {emp.advances > 0 ? `-${formatNum(emp.advances)} F` : '0 F'}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-teal-600">
                    {emp.arrivalTime}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5 bg-[var(--bg-card)] text-[10px]">
                      <button
                        onClick={() => handleToggleAttendance(emp.id, 'Présent')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          emp.attendance === 'Présent' ? 'bg-emerald-500 text-white' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        Présent
                      </button>
                      <button
                        onClick={() => handleToggleAttendance(emp.id, 'Retard')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          emp.attendance === 'Retard' ? 'bg-amber-500 text-white' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        Retard
                      </button>
                      <button
                        onClick={() => handleToggleAttendance(emp.id, 'Absent')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          emp.attendance === 'Absent' ? 'bg-rose-500 text-white' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedEmpForPayslip(emp)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/30 text-[10px] font-bold hover:bg-[var(--primary)] hover:text-white transition-all"
                    >
                      Générer Bulletin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Payslip OHADA Preview & Print */}
      {selectedEmpForPayslip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <div>
                <h3 className="font-black text-sm text-[var(--text-main)]">Bulletin de Paie OHADA (A4)</h3>
                <div className="text-xs text-[var(--text-muted)]">Salarié : <strong>{selectedEmpForPayslip.name}</strong></div>
              </div>
              <button onClick={() => setSelectedEmpForPayslip(null)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* A4 Sheet Body */}
            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scroll">
              <div id="payslip-a4-sheet" className="p-6 bg-white text-black rounded-xl border border-slate-300 space-y-4 text-xs">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase">AURA COMMERCE SARL</h2>
                    <div className="text-[11px] text-slate-600">N° CNSS Employeur : 104859-BF • IFU : 00124856019M</div>
                    <div className="text-[11px] text-slate-600">Zone Industrielle Gounghin, Ouagadougou</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase rounded">
                      BULLETIN DE PAIE
                    </span>
                    <div className="text-[11px] text-slate-600 font-mono mt-1">Période : Novembre 2026</div>
                  </div>
                </div>

                {/* Employee details */}
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 grid grid-cols-2 gap-4">
                  <div>
                    <div>Nom & Prénoms : <strong className="text-slate-900">{selectedEmpForPayslip.name}</strong></div>
                    <div>Poste Occupé : <span className="text-slate-700">{selectedEmpForPayslip.role}</span></div>
                    <div>Matricule : <span className="font-mono font-bold">EMP-2023-00{selectedEmpForPayslip.id}</span></div>
                  </div>
                  <div>
                    <div>N° CNSS Salarié : <span className="font-mono font-bold">{selectedEmpForPayslip.cnss}</span></div>
                    <div>Catégorie : <strong>Agent de Maîtrise / Cat. 5</strong></div>
                    <div>Mode : <strong>Virement Bancaire (Coris)</strong></div>
                  </div>
                </div>

                {/* Salary breakdown table */}
                {(() => {
                  const base = selectedEmpForPayslip.salaryBase;
                  const transport = 25000;
                  const brut = base + transport;
                  const cnssOuvriere = Math.round(brut * 0.055);
                  const iuts = Math.round(brut * 0.07);
                  const totalRetenues = cnssOuvriere + iuts + (selectedEmpForPayslip.advances || 0);
                  const net = brut - totalRetenues;

                  return (
                    <>
                      <table className="w-full text-xs text-left border border-slate-300">
                        <thead className="bg-slate-900 text-white text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2 border-r border-slate-700">Rubrique</th>
                            <th className="p-2 text-right border-r border-slate-700">Base / Taux</th>
                            <th className="p-2 text-right border-r border-slate-700">Gains</th>
                            <th className="p-2 text-right">Retenues</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-2">100 - Salaire de Base Conventionnel</td>
                            <td className="p-2 text-right font-mono">30 jours</td>
                            <td className="p-2 text-right font-mono font-bold">{formatNum(base)} F</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr>
                            <td className="p-2">210 - Indemnité Forfaitaire de Transport</td>
                            <td className="p-2 text-right font-mono">Forfait</td>
                            <td className="p-2 text-right font-mono font-bold">{formatNum(transport)} F</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr className="bg-slate-50 font-bold">
                            <td className="p-2">TOTAL BRUT IMPOSABLE</td>
                            <td className="p-2 text-right font-mono">-</td>
                            <td className="p-2 text-right font-mono text-emerald-800">{formatNum(brut)} F</td>
                            <td className="p-2 text-right font-mono">-</td>
                          </tr>
                          <tr>
                            <td className="p-2">500 - Cotisation CNSS Ouvrière</td>
                            <td className="p-2 text-right font-mono">5.50%</td>
                            <td className="p-2 text-right font-mono">-</td>
                            <td className="p-2 text-right font-mono text-rose-600">{formatNum(cnssOuvriere)} F</td>
                          </tr>
                          <tr>
                            <td className="p-2">510 - Impôt IUTS (Barème DGI)</td>
                            <td className="p-2 text-right font-mono">7.00%</td>
                            <td className="p-2 text-right font-mono">-</td>
                            <td className="p-2 text-right font-mono text-rose-600">{formatNum(iuts)} F</td>
                          </tr>
                          <tr>
                            <td className="p-2">600 - Acomptes & Avances du Mois</td>
                            <td className="p-2 text-right font-mono">Direct</td>
                            <td className="p-2 text-right font-mono">-</td>
                            <td className="p-2 text-right font-mono text-rose-600">
                              {formatNum(selectedEmpForPayslip.advances || 0)} F
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Net to pay box */}
                      <div className="flex justify-end pt-2">
                        <div className="w-80 rounded-xl bg-slate-900 text-white p-3 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>Total Brut :</span>
                            <span className="font-mono">{formatNum(brut)} F</span>
                          </div>
                          <div className="flex justify-between text-rose-400">
                            <span>Total Retenues :</span>
                            <span className="font-mono">-{formatNum(totalRetenues)} F</span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-700">
                            <span>NET À PAYER :</span>
                            <span className="font-mono text-emerald-400">{formatCFA(net)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Signatures */}
                <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
                  <div>
                    <div className="font-bold text-slate-800 uppercase">Émargement du Salarié :</div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">« Pour accord et quittance »</div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800 uppercase">Pour la Direction Générale :</div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">Visa & Cachet</div>
                    <div className="h-10 flex items-center justify-end font-serif font-black text-teal-800">
                      AURA COMMERCE SARL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setSelectedEmpForPayslip(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Fermer
              </button>
              <button
                onClick={() => printA4Element('payslip-a4-sheet', `Bulletin-${selectedEmpForPayslip.name}`)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-2 shadow-xs hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer Bulletin A4</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Employee */}
      {isNewEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Nouveau Salarié au Registre RH</h3>
              <button onClick={() => setIsNewEmpModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Nom & Prénoms :</label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="ex: Kaboré Wendyam"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Poste & Fonction :</label>
                <input
                  type="text"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  placeholder="ex: Commercial de Terrain"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Contrat :</label>
                  <select
                    value={newEmpContract}
                    onChange={(e) => setNewEmpContract(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    <option value="CDI" className="bg-slate-900 text-white">CDI</option>
                    <option value="CDD" className="bg-slate-900 text-white">CDD</option>
                    <option value="Stage" className="bg-slate-900 text-white">Stage</option>
                    <option value="Prestation" className="bg-slate-900 text-white">Prestation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Salaire Base (F CFA) :</label>
                  <input
                    type="number"
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">N° CNSS :</label>
                <input
                  type="text"
                  value={newEmpCnss}
                  onChange={(e) => setNewEmpCnss(e.target.value)}
                  placeholder="ex: 489201-BF"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsNewEmpModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Annuler
              </button>
              <button
                onClick={handleCreateEmployee}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black shadow-xs"
              >
                Inscrire Salarié
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Advance on Salary */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Accorder un Acompte sur Salaire</h3>
              <button onClick={() => setIsAdvanceModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Salarié Bénéficiaire :</label>
                <select
                  value={advanceEmpId}
                  onChange={(e) => setAdvanceEmpId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id} className="bg-slate-900 text-white">{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Montant Acompte (F CFA) :</label>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono font-black text-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Motif :</label>
                <input
                  type="text"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  placeholder="ex: Urgence médicale / Acompte quinzaine"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsAdvanceModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Annuler
              </button>
              <button
                onClick={handleSubmitAdvance}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-xs"
              >
                Décaisser & Imputer Paie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
