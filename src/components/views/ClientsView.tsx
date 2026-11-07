import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Users, Plus, Phone, Mail, Building, MapPin, X } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA } from '../../utils/formatters';
import type { Customer } from '../../types';

export const ClientsView: React.FC = () => {
  const clients = useLiveQuery(() => db.customers.toArray(), []) || [];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [cat, setCat] = useState<'B2B' | 'B2C' | 'VIP'>('B2B');
  const [phone, setPhone] = useState('+226 ');
  const [email, setEmail] = useState('');
  const [ifu, setIfu] = useState('');
  const [rccm, setRccm] = useState('');
  const [city, setCity] = useState('Ouagadougou');
  const [address, setAddress] = useState('');

  const handleCreateClient = async () => {
    if (!name.trim()) return;
    const newCust: Customer = {
      id: (clients.length + 1).toString(),
      name: name.trim(),
      cat,
      phone: phone.trim(),
      email: email.trim() || undefined,
      ifu: ifu.trim() || undefined,
      rccm: rccm.trim() || undefined,
      city: city.trim(),
      address: address.trim() || undefined,
      balanceDue: 0
    };

    await db.customers.add(newCust);
    setIsAddModalOpen(false);
    setName('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            <span>CRM Clients, Comptes B2B & IFU Déclarés</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Gestion du répertoire clients, fiches fiscales pour facturation normalisée DGI
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scroll">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-sm text-[var(--text-main)]">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    c.cat === 'B2B' ? 'bg-blue-500/15 text-blue-400' : c.cat === 'VIP' ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-500/15 text-slate-400'
                  }`}>
                    Segment : {c.cat}
                  </span>
                </div>
                {c.balanceDue > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500">
                    Dû: {formatCFA(c.balanceDue)}
                  </span>
                )}
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1 pt-1 border-t border-[var(--border)]">
                {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> <span>{c.phone}</span></div>}
                {c.ifu && <div className="font-mono text-[11px]">IFU : <strong>{c.ifu}</strong></div>}
                {c.rccm && <div className="font-mono text-[11px]">RCCM : {c.rccm}</div>}
                {c.address && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span>{c.address} ({c.city})</span></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Nouveau Client / Entreprise</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Raison Sociale / Nom :</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: ENTREPRISE SOGEB SARL"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Segment :</label>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    <option value="B2B" className="bg-slate-900 text-white">B2B Entreprise</option>
                    <option value="B2C" className="bg-slate-900 text-white">B2C Particulier</option>
                    <option value="VIP" className="bg-slate-900 text-white">Client VIP</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Téléphone :</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+226 70 00 00 00"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">N° IFU :</label>
                  <input
                    type="text"
                    value={ifu}
                    onChange={(e) => setIfu(e.target.value)}
                    placeholder="00012345678M"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono text-[var(--text-main)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">N° RCCM :</label>
                  <input
                    type="text"
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    placeholder="BF-OUA-2022-B-..."
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-mono text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Adresse / Chantier :</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Zone Industrielle Gounghin"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Annuler
              </button>
              <button
                onClick={handleCreateClient}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black shadow-xs"
              >
                Créer la Fiche Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
