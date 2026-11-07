import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings, Save, Upload, Printer, Building, Stamp } from 'lucide-react';
import { db } from '../../db/schema';
import { thermalPrinter } from '../../services/bluetoothPrinter';
import type { CompanySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const companyRecord = useLiveQuery(async () => {
    const s = await db.settings.get('company');
    return s?.value as CompanySettings;
  }, []);

  const [name, setName] = useState('AURA COMMERCE SARL');
  const [tagline, setTagline] = useState('Vente Matériaux, Alimentation Générale & Logistique');
  const [ifu, setIfu] = useState('00124856019M');
  const [rccm, setRccm] = useState('BF-OUA-2021-B-8910');
  const [regime, setRegime] = useState('Réel Normal d\'Imposition (RNI)');
  const [divisionFiscale, setDivisionFiscale] = useState('DGI Ouaga I (Kadiogo)');
  const [address, setAddress] = useState('Zone Industrielle Gounghin, Ouagadougou');
  const [phone, setPhone] = useState('+226 25 30 45 89');
  const [email, setEmail] = useState('contact@auracommerce.bf');
  const [ribBank, setRibBank] = useState('Coris Bank International Burkina Faso');
  const [ribAccount, setRibAccount] = useState('BF061 01001 048590123001 45');

  const [stampImage, setStampImage] = useState<string | null>(null);

  // Sync state with db record if loaded
  React.useEffect(() => {
    if (companyRecord) {
      setName(companyRecord.name || '');
      setTagline(companyRecord.tagline || '');
      setIfu(companyRecord.ifu || '');
      setRccm(companyRecord.rccm || '');
      setRegime(companyRecord.regime || '');
      setDivisionFiscale(companyRecord.divisionFiscale || '');
      setAddress(companyRecord.address || '');
      setPhone(companyRecord.phone || '');
      setEmail(companyRecord.email || '');
      setRibBank(companyRecord.ribBank || '');
      setRibAccount(companyRecord.ribAccount || '');
      if (companyRecord.stampUrl) setStampImage(companyRecord.stampUrl);
    }
  }, [companyRecord]);

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setStampImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    const updated: CompanySettings = {
      name,
      sigle: 'AURA',
      tagline,
      ifu,
      rccm,
      regime,
      divisionFiscale,
      address,
      phone,
      email,
      ribBank,
      ribAccount,
      currency: 'F CFA',
      vatRate: 18,
      bicRate: 1,
      defaultDocTemplate: 'corporate',
      stampUrl: stampImage || undefined
    };

    await db.settings.put({ key: 'company', value: updated });
    alert('Paramètres de l\'établissement et conformité fiscale DGI enregistrés avec succès !');
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[var(--text-main)] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--primary)]" />
            <span>Paramètres de l'Entreprise & Personnalisation</span>
          </h1>
          <div className="text-xs text-[var(--text-muted)]">
            Mentions légales obligatoires DGI/OHADA, cachet officiel PNG, RIB et imprimante
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les Modifications</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Legal Identity */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-500" />
            <span>Identité Légale & Fiscale (Norme DGI / OHADA)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="font-bold text-[var(--text-muted)] block mb-1">Raison Sociale de l'Établissement :</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-main)] font-black text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-[var(--text-muted)] block mb-1">Slogan Commercial / Activité :</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text-muted)] block mb-1">Numéro IFU (Identifiant Fiscal Unique) :</label>
              <input
                type="text"
                value={ifu}
                onChange={(e) => setIfu(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] font-mono font-bold text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text-muted)] block mb-1">Registre du Commerce (RCCM) :</label>
              <input
                type="text"
                value={rccm}
                onChange={(e) => setRccm(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] font-mono font-bold text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text-muted)] block mb-1">Régime Fiscal DGI :</label>
              <input
                type="text"
                value={regime}
                onChange={(e) => setRegime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text-muted)] block mb-1">Direction / Division Fiscale :</label>
              <input
                type="text"
                value={divisionFiscale}
                onChange={(e) => setDivisionFiscale(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text-muted)] block mb-1">Banque & RIB :</label>
              <input
                type="text"
                value={ribBank}
                onChange={(e) => setRibBank(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text-muted)] block mb-1">Numéro de Compte IBAN / RIB :</label>
              <input
                type="text"
                value={ribAccount}
                onChange={(e) => setRibAccount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] font-mono text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-[var(--text-muted)] block mb-1">Adresse Siège & Contact Téléphonique :</label>
              <input
                type="text"
                value={`${address} • ${phone}`}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Official Stamp & Signatures */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[var(--text-main)] flex items-center gap-2">
            <Stamp className="w-4 h-4 text-rose-500" />
            <span>Cachet Humide & Signature Officielle</span>
          </h3>

          <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-3">
            {stampImage ? (
              <img src={stampImage} alt="Cachet" className="w-28 h-28 object-contain rounded-lg border border-slate-300 bg-white p-1" />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-teal-500/40 flex flex-col items-center justify-center text-[10px] text-teal-600 font-bold p-2 text-center">
                <span>Cachet Officiel</span>
                <span className="font-serif">AURA SARL</span>
              </div>
            )}

            <div className="text-[11px] text-[var(--text-muted)]">
              Téléversez votre cachet circulaire en PNG transparent pour insertion automatique sur vos factures A4.
            </div>

            <label className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] cursor-pointer flex items-center gap-1.5 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Choisir un fichier PNG</span>
              <input type="file" accept="image/png,image/jpeg" onChange={handleStampUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
