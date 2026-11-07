import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Building2, Plus, Phone, Mail, MapPin, X } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA } from '../../utils/formatters';
import type { Supplier } from '../../types';

export const SuppliersView: React.FC = () => {
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('+226 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleCreateSupplier = async () => {
    if (!name.trim()) return;
    const newSup: Supplier = {
      id: (suppliers.length + 1).toString(),
      name: name.trim(),
      contact: contact.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      balanceDue: 0
    };

    await db.suppliers.add(newSup);
    setIsAddModalOpen(false);
    setName('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--primary)]" />
            <span>Fournisseurs & Approvisionnements (Bons de Commande BC)</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Partenaires fabricants, cimenteries, brasseries et grossistes
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scroll">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(s => (
            <div key={s.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-sm text-[var(--text-main)]">{s.name}</h3>
                  <div className="text-xs text-[var(--text-muted)]">Contact : {s.contact || 'Service Commercial'}</div>
                </div>
                {s.balanceDue > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500">
                    À payer : {formatCFA(s.balanceDue)}
                  </span>
                )}
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1 pt-1 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> <span>{s.phone}</span></div>
                {s.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> <span>{s.email}</span></div>}
                {s.address && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span>{s.address}</span></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Supplier */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Nouveau Fournisseur</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Raison Sociale Fournisseur :</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: CIMENTS DU FASO (CIMFACO)"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Nom du Contact / Commercial :</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="ex: M. Ouédraogo"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Téléphone :</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+226 25 30 00 00"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Email :</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ventes@fournisseur.bf"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Adresse / Usine / Dépôt :</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Zone Industrielle de Kossodo"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Annuler
              </button>
              <button
                onClick={handleCreateSupplier}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black shadow-xs"
              >
                Créer Fournisseur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
