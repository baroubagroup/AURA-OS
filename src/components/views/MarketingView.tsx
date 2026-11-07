import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { MessageSquare, Send, Sparkles, Phone, Users } from 'lucide-react';
import { db } from '../../db/schema';

export const MarketingView: React.FC = () => {
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const [selectedCampaign, setSelectedCampaign] = useState('arrivage');
  const [targetPhone, setTargetPhone] = useState('+226 70 00 00 00');
  const [customText, setCustomText] = useState(
    '🚨 FLASH PROMO AURA COMMERCE !\nArrivage massif de Ciment CPJ 42.5 et Fer à Béton Ø 10mm à prix d\'usine ! Livraison gratuite sur Ouagadougou à partir de 50 sacs commandés. Contactez-nous vite au +226 25 30 45 89.'
  );

  const campaigns = [
    {
      id: 'arrivage',
      title: 'Arrivage Matériaux & Quincaillerie',
      text: '🚨 FLASH PROMO AURA COMMERCE !\nArrivage massif de Ciment CPJ 42.5 et Fer à Béton Ø 10mm à prix d\'usine ! Livraison gratuite sur Ouagadougou à partir de 50 sacs commandés. Contactez-nous vite au +226 25 30 45 89.'
    },
    {
      id: 'fetes',
      title: 'Offre Spéciale Boissons & Brasserie',
      text: '🎉 OFFRE COMMERCIALE MAQUIS & RESTAURANTS !\nCommandez vos casiers et packs de Brakina, Beaufort et jus locaux au tarif de gros avec remise immédiate de 5% dès 10 casiers. Dispo immédiate au dépôt.'
    },
    {
      id: 'fidelite',
      title: 'Remerciement & Fidélité Client',
      text: 'Cher client partenaire,\nAURA Commerce SARL tient à vous remercier chaleureusement pour votre confiance. Bénéficiez d\'une remise préférentielle sur votre prochaine commande ce mois-ci !'
    }
  ];

  const handleSelectCampaign = (cId: string) => {
    setSelectedCampaign(cId);
    const camp = campaigns.find(c => c.id === cId);
    if (camp) setCustomText(camp.text);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(customText);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      <div>
        <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          <span>Marketing & Campagnes WhatsApp Burkinabè</span>
        </h2>
        <div className="text-xs text-[var(--text-muted)]">
          Génération et envoi direct de messages promotionnels et d'alertes arrivage par WhatsApp
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Templates */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Modèles de Campagnes Pré-Rédigés</span>
          </h3>

          <div className="space-y-2">
            {campaigns.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectCampaign(c.id)}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                  selectedCampaign === c.id
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 font-bold'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border)] text-[var(--text-main)] hover:border-emerald-500/40'
                }`}
              >
                <div>{c.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Composer */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-500" />
            <span>Éditeur du Message & Envoi Direct</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Destinataire (Numéro ou Client) :</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="+226 70 00 00 00"
                  className="flex-1 p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] font-mono text-xs text-[var(--text-main)] focus:outline-none"
                />
                <select
                  onChange={(e) => {
                    const c = customers.find(x => x.id === e.target.value);
                    if (c) setTargetPhone(c.phone);
                  }}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                >
                  <option value="">Sélectionner client...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Corps du Message WhatsApp :</label>
              <textarea
                rows={6}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleSendWhatsApp}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Ouvrir dans WhatsApp & Envoyer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
