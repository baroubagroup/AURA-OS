import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Truck, CheckCircle2, Clock, Phone, MapPin, Plus } from 'lucide-react';
import { db } from '../../db/schema';
import { formatCFA, formatDateFr } from '../../utils/formatters';

export const DeliveriesView: React.FC = () => {
  const deliveries = useLiveQuery(() => db.deliveries.toArray(), []) || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--primary)]" />
            <span>Logistique, Flotte & Bordereaux de Livraison (BL)</span>
          </h2>
          <div className="text-xs text-[var(--text-muted)]">
            Expéditions, assignation des chauffeurs (Camions & Tricycles) et décharges contradictoires
          </div>
        </div>

        <button
          onClick={() => alert('Veuillez passer par le module Factures & Documents A4 pour générer un Bon de Livraison certifié.')}
          className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Bordereau (BL)</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scroll space-y-3">
        {/* Sample Deliveries if empty */}
        {[
          { ref: 'BL-2026-0894', client: 'ENTREPRISE SOGEB SARL', destination: 'Chantier Cité Ouaga 2000, Lot 14', driver: 'Moussa Traoré (Permis C)', vehicle: 'Camion Isuzu 10T (11-JJ-4859-BF)', departure: '08:30 GMT', status: 'En cours d\'acheminement' },
          { ref: 'BL-2026-0895', client: 'MAQUIS LE BAMBOU D\'OR', destination: 'Boulevard Charles de Gaulle, Secteur 28', driver: 'Salif Sanfo (Livreur Tricycle)', vehicle: 'Tricycle Benne Haojue', departure: '10:15 GMT', status: 'Livré & Décharge signée' },
          { ref: 'BL-2026-0896', client: 'OUÉDRAOGO Souleymane', destination: 'Secteur 25, Bobo-Dioulasso', driver: 'Transport Express Faso', vehicle: 'Camionnette 3.5T', departure: '07:00 GMT', status: 'En préparation dépôt' }
        ].map((del, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs text-[var(--primary)]">{del.ref}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  del.status.includes('Livré') ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-400'
                }`}>
                  {del.status}
                </span>
              </div>
              <div className="font-bold text-xs text-[var(--text-main)]">{del.client}</div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{del.destination}</span>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] space-y-0.5 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border)]">
              <div>Chauffeur : <strong className="text-[var(--text-main)]">{del.driver}</strong></div>
              <div>Véhicule : {del.vehicle}</div>
              <div className="font-mono text-[10px]">Départ : {del.departure}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
