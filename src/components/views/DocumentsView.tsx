import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileText,
  Printer,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Stamp,
  Calendar,
  X
} from 'lucide-react';
import { db } from '../../db/schema';
import { numberToWords } from '../../utils/numberToWords';
import { formatCFA, formatNum, formatDateFr } from '../../utils/formatters';
import { printA4Element } from '../../services/a4Printer';
import type {
  DocType,
  DocTemplate,
  DocumentModel,
  DocumentLine,
  CompanySettings
} from '../../types';

export const DocumentsView: React.FC = () => {
  const documents = useLiveQuery(() => db.documents.toArray(), []) || [];
  const clients = useLiveQuery(() => db.customers.toArray(), []) || [];
  const company = useLiveQuery(async () => {
    const s = await db.settings.get('company');
    return s?.value as CompanySettings;
  }, []);

  const [activeDoc, setActiveDoc] = useState<DocumentModel | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<DocTemplate>('corporate');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form State for creating custom document
  const [docType, setDocType] = useState<DocType>('invoice');
  const [selectedClientId, setSelectedClientId] = useState<string>('1');
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [docExpiry, setDocExpiry] = useState<string>(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [docLines, setDocLines] = useState<DocumentLine[]>([
    { desc: 'Ciment Portland CPJ 42.5 (Sac 50kg)', unit: 'Sac', qty: 50, pu: 6500, remise: 0, total: 325000 },
    { desc: 'Fer à Béton FeE500 Ø 10mm (Barre 12m)', unit: 'Barre', qty: 30, pu: 4200, remise: 0, total: 126000 }
  ]);
  const [applyStamp, setApplyStamp] = useState<boolean>(true);

  // Initial document fallback
  const currentDoc = activeDoc || documents[0];

  const handleAddLine = () => {
    setDocLines(prev => [
      ...prev,
      { desc: '', unit: 'Unité', qty: 1, pu: 1000, remise: 0, total: 1000 }
    ]);
  };

  const handleUpdateLine = (idx: number, field: keyof DocumentLine, val: any) => {
    setDocLines(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      copy[idx].total = (copy[idx].qty * copy[idx].pu) - (copy[idx].remise || 0);
      return copy;
    });
  };

  const handleRemoveLine = (idx: number) => {
    setDocLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDocument = async () => {
    const client = clients.find(c => c.id === selectedClientId) || {
      id: 'default',
      name: 'Client B2B',
      cat: 'B2B' as const,
      phone: '+226 70 00 00 00',
      ifu: '00045812934K',
      rccm: 'BF-OUA-2021-B-8910',
      address: 'Ouagadougou, Burkina Faso',
      balanceDue: 0
    };

    const prefixes: Record<DocType, string> = {
      invoice: 'FACT',
      proforma: 'PRO',
      order: 'BC',
      delivery: 'BL'
    };
    const ref = `${prefixes[docType]}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc: DocumentModel = {
      id: Date.now(),
      type: docType,
      ref,
      date: docDate,
      expiryDate: docExpiry,
      template: activeTemplate,
      client: {
        name: client.name,
        attn: 'Direction des Travaux',
        ifu: client.ifu || '00045812934K',
        rccm: client.rccm || 'BF-OUA-2021-B-8910',
        address: client.address || 'Ouagadougou, Burkina Faso',
        phone: client.phone
      },
      supplier: {
        name: 'CIMENTS DU FASO (CIMFACO)',
        contact: 'M. Ouédraogo',
        phone: '+226 25 30 00 00',
        address: 'Zone Industrielle Kossodo, Ouagadougou'
      },
      deliveryInfo: {
        driver: 'Moussa Traoré (Permis C)',
        vehicle: 'Camionnette Isuzu - Immat: 11-JJ-4859-BF',
        departureTime: '08:30 GMT',
        destination: client.address || 'Chantier Client',
        packagesCount: `${docLines.length} Colis`,
        weight: '1 250 kg'
      },
      items: docLines.map(l => ({
        ...l,
        qtyOrdered: l.qty,
        qtyDelivered: l.qty,
        qtyRemaining: 0
      })),
      applyStamp,
      paymentTerms: 'Virement Bancaire (Coris / Ecobank)',
      notes: 'Marchandises vendues sous réserve de propriété jusqu\'au paiement intégral.'
    };

    await db.documents.add(newDoc);
    setActiveDoc(newDoc);
    setIsCreateModalOpen(false);
  };

  // Calculations for current doc
  const subtotal = currentDoc?.items.reduce((s, it) => s + (it.qty * it.pu) - (it.remise || 0), 0) || 0;
  const vatAmount = Math.round(subtotal * 0.18);
  const bicAmount = Math.round(subtotal * 0.01);
  const totalTTC = subtotal + vatAmount + bicAmount;

  // Visual Template Classes
  const templateTheme = {
    minimal: {
      accentText: 'text-slate-800',
      accentBg: 'bg-slate-100',
      headerBg: 'bg-slate-50',
      borderCol: 'border-slate-300'
    },
    corporate: {
      accentText: 'text-blue-900',
      accentBg: 'bg-blue-900 text-white',
      headerBg: 'bg-blue-50',
      borderCol: 'border-blue-900'
    },
    dgi: {
      accentText: 'text-emerald-900',
      accentBg: 'bg-emerald-800 text-white',
      headerBg: 'bg-emerald-50',
      borderCol: 'border-emerald-700'
    },
    split: {
      accentText: 'text-teal-900',
      accentBg: 'bg-teal-700 text-white',
      headerBg: 'bg-teal-50',
      borderCol: 'border-teal-700'
    },
    prestige: {
      accentText: 'text-amber-900',
      accentBg: 'bg-amber-800 text-white',
      headerBg: 'bg-amber-50',
      borderCol: 'border-amber-700'
    }
  }[activeTemplate];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      {/* Studio Header Toolbar */}
      <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-black text-sm text-[var(--text-main)]">Studio Factures & Documents A4 OHADA</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-500 border border-teal-500/20">
            DGI Conforme
          </span>
        </div>

        {/* 5 Visual Templates Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-xl border border-[var(--border)]">
          <span className="text-[10px] font-bold text-[var(--text-muted)] px-2">Modèle :</span>
          {[
            { id: 'minimal' as DocTemplate, label: 'Minimal' },
            { id: 'corporate' as DocTemplate, label: 'Cobalt' },
            { id: 'dgi' as DocTemplate, label: 'DGI Vert' },
            { id: 'split' as DocTemplate, label: 'Moderne' },
            { id: 'prestige' as DocTemplate, label: 'Or Prestige' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTemplate === t.id
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Créer Document</span>
          </button>

          <button
            onClick={() => printA4Element('a4-document-preview-sheet', currentDoc?.ref || 'Document')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:bg-slate-800 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer A4 (Isolée)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Document Types Selector */}
        <div className="w-56 border-r border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2 shrink-0 overflow-y-auto custom-scroll">
          <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Structures Légales (A4)
          </div>

          {[
            { id: 'invoice' as DocType, label: 'Facture Définitive', desc: 'TVA 18%, BIC 1%, DGI' },
            { id: 'proforma' as DocType, label: 'Devis / Proforma', desc: 'Validité 30j & Accord' },
            { id: 'order' as DocType, label: 'Bon de Commande (BC)', desc: 'Fournisseur & Visas' },
            { id: 'delivery' as DocType, label: 'Bon de Livraison (BL)', desc: 'Décharge sans réserve' }
          ].map(dt => (
            <button
              key={dt.id}
              onClick={() => {
                if (currentDoc) {
                  setActiveDoc({ ...currentDoc, type: dt.id });
                }
              }}
              className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                currentDoc?.type === dt.id
                  ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)]'
                  : 'bg-[var(--bg-card-subtle)] border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]'
              }`}
            >
              <div className="font-bold text-xs">{dt.label}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{dt.desc}</div>
            </button>
          ))}

          <div className="pt-4 border-t border-[var(--border)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
            Documents Récents
          </div>
          <div className="space-y-1">
            {documents.slice(0, 8).map(d => (
              <button
                key={d.id}
                onClick={() => setActiveDoc(d)}
                className={`w-full p-2 rounded-lg text-left text-xs truncate transition-colors ${
                  currentDoc?.id === d.id
                    ? 'font-bold text-[var(--primary)] bg-[var(--bg-card-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {d.ref} • {d.client.name.substring(0, 16)}
              </button>
            ))}
          </div>
        </div>

        {/* Right: A4 Sheet Preview Canvas */}
        <div className="flex-1 p-6 overflow-y-auto custom-scroll flex justify-center bg-slate-200/50 dark:bg-slate-950">
          {currentDoc && (
            <div
              id="a4-document-preview-sheet"
              className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Section */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{company?.name || 'AURA COMMERCE SARL'}</h1>
                    <div className="text-xs text-slate-600 font-medium">{company?.tagline}</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      IFU : <strong className="text-slate-900">{company?.ifu}</strong> • RCCM : <strong className="text-slate-900">{company?.rccm}</strong>
                    </div>
                    <div className="text-[11px] text-slate-600">Régime : {company?.regime} • {company?.divisionFiscale}</div>
                    <div className="text-[11px] text-slate-600">Siège : {company?.address} • Tél : {company?.phone}</div>
                  </div>

                  {/* Document Badge */}
                  <div className="text-right">
                    <div className={`inline-block px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider ${templateTheme.accentBg}`}>
                      {currentDoc.type === 'invoice' && 'FACTURE DÉFINITIVE DGI'}
                      {currentDoc.type === 'proforma' && 'DEVIS / FACTURE PROFORMA'}
                      {currentDoc.type === 'order' && 'BON DE COMMANDE FOURNISSEUR'}
                      {currentDoc.type === 'delivery' && 'BON DE LIVRAISON & EXPÉDITION'}
                    </div>
                    <div className="font-mono font-bold text-sm text-slate-900 mt-1.5">{currentDoc.ref}</div>
                    <div className="text-xs text-slate-600">Date : {formatDateFr(currentDoc.date)}</div>
                    {currentDoc.type === 'proforma' && (
                      <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                        OFFRE COMMERCIALE 30 JOURS
                      </div>
                    )}
                  </div>
                </div>

                {/* Client / Supplier Block */}
                <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Émetteur :</div>
                    <div className="font-bold text-slate-900">{company?.name}</div>
                    <div className="text-slate-600">RIB : {company?.ribBank}</div>
                    <div className="text-slate-600 font-mono">IBAN : {company?.ribAccount}</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      {currentDoc.type === 'order' ? 'Fournisseur Destinataire :' : 'Client Destinataire :'}
                    </div>
                    <div className="font-bold text-slate-900">{currentDoc.client.name}</div>
                    <div className="text-slate-600">Attn : {currentDoc.client.attn}</div>
                    <div className="text-slate-600 font-mono">IFU : {currentDoc.client.ifu}</div>
                    <div className="text-slate-600">{currentDoc.client.address} • {currentDoc.client.phone}</div>
                  </div>
                </div>

                {/* Delivery Logistics Block for BL */}
                {currentDoc.type === 'delivery' && currentDoc.deliveryInfo && (
                  <div className="my-3 p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs grid grid-cols-3 gap-2">
                    <div><strong>Chauffeur Assigné :</strong> {currentDoc.deliveryInfo.driver}</div>
                    <div><strong>Véhicule / Immat :</strong> {currentDoc.deliveryInfo.vehicle}</div>
                    <div><strong>Heure Départ :</strong> {currentDoc.deliveryInfo.departureTime}</div>
                    <div className="col-span-2"><strong>Destination :</strong> {currentDoc.deliveryInfo.destination}</div>
                    <div><strong>Colisage & Poids :</strong> {currentDoc.deliveryInfo.packagesCount} ({currentDoc.deliveryInfo.weight})</div>
                  </div>
                )}

                {/* Items Table */}
                <table className="w-full text-xs text-left my-4 border border-slate-300">
                  <thead className="bg-slate-900 text-white text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2 border-r border-slate-700">Désignation</th>
                      <th className="p-2 text-center border-r border-slate-700 w-16">Unité</th>
                      {currentDoc.type === 'delivery' ? (
                        <>
                          <th className="p-2 text-center border-r border-slate-700 w-16">Qté Cde</th>
                          <th className="p-2 text-center border-r border-slate-700 w-16">Qté Livrée</th>
                          <th className="p-2 text-center border-r border-slate-700 w-16">Reliquat</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2 text-center border-r border-slate-700 w-14">Qté</th>
                          <th className="p-2 text-right border-r border-slate-700 w-24">Prix Unit.</th>
                          <th className="p-2 text-right border-r border-slate-700 w-16">Remise</th>
                          <th className="p-2 text-right w-28">Total HT</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentDoc.items.map((line, lIdx) => (
                      <tr key={lIdx}>
                        <td className="p-2 font-medium">{line.desc}</td>
                        <td className="p-2 text-center">{line.unit}</td>
                        {currentDoc.type === 'delivery' ? (
                          <>
                            <td className="p-2 text-center font-mono font-bold">{line.qtyOrdered || line.qty}</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">{line.qtyDelivered || line.qty}</td>
                            <td className="p-2 text-center font-mono text-slate-400">{line.qtyRemaining || 0}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 text-center font-mono font-bold">{line.qty}</td>
                            <td className="p-2 text-right font-mono">{formatNum(line.pu)} F</td>
                            <td className="p-2 text-right font-mono text-rose-600">{line.remise ? `-${formatNum(line.remise)} F` : '—'}</td>
                            <td className="p-2 text-right font-mono font-black">{formatNum(line.total)} F</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary & Taxes (OHADA TVA 18% & BIC 1%) */}
                {currentDoc.type !== 'delivery' && (
                  <div className="flex justify-end my-3">
                    <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-300">
                      <div className="flex justify-between text-slate-700">
                        <span>Total Brut Hors Taxes :</span>
                        <span className="font-mono font-bold">{formatNum(subtotal)} F</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>TVA Collectée (18%) :</span>
                        <span className="font-mono font-bold">{formatNum(vatAmount)} F</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Acompte BIC/IS (1%) :</span>
                        <span className="font-mono font-bold">{formatNum(bicAmount)} F</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                        <span>TOTAL NET TTC :</span>
                        <span className="font-mono text-teal-800">{formatCFA(totalTTC)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount in French Words */}
                {currentDoc.type !== 'delivery' && (
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs italic text-slate-800 my-2">
                    Arrêtée la présente facture à la somme de : <strong>{numberToWords(totalTTC)} Francs CFA</strong>.
                  </div>
                )}

                {/* Specific Legal Frameworks */}
                {currentDoc.type === 'invoice' && (
                  <div className="text-[10px] text-slate-500 space-y-0.5 mt-2">
                    <div>• <strong>Clause de réserve de propriété</strong> : Les marchandises vendues demeurent la propriété du vendeur jusqu'au complet encaissement (Loi 2017-024).</div>
                    <div>• <strong>Pénalités de retard : 10%</strong> l'an exigibles de plein droit après l'échéance convenue.</div>
                  </div>
                )}

                {currentDoc.type === 'proforma' && (
                  <div className="p-3 my-2 rounded border border-dashed border-slate-400 bg-amber-50/40 text-xs text-center">
                    <div className="font-bold text-slate-900 uppercase">CADRE D'ACCEPTATION CLIENT — BON POUR ACCORD ET COMMANDE FERME</div>
                    <div className="text-[11px] text-slate-600 mt-1">Acompte 50% à la signature, solde 50% à la livraison. Date et signature précédées de la mention "Bon pour Accord".</div>
                    <div className="h-12 border-b border-dashed border-slate-300 my-2"></div>
                  </div>
                )}

                {currentDoc.type === 'delivery' && (
                  <div className="p-3 my-2 rounded border border-slate-300 bg-slate-50 text-xs">
                    <div className="font-bold text-slate-900 uppercase">Décharge contradictoire du Client / Réceptionnaire :</div>
                    <div className="text-[11px] text-slate-600 italic mt-0.5">
                      « Reçu ce jour les marchandises ci-dessus désignées, en parfait état, conformes aux quantités commandées et sans aucune réserve »
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-slate-200">
                      <div>Nom & Signature du Chauffeur :</div>
                      <div className="text-right">Nom, Date, Heure & Cachet Client :</div>
                    </div>
                    <div className="h-10"></div>
                  </div>
                )}

                {currentDoc.type === 'order' && (
                  <div className="p-3 my-2 rounded border border-slate-300 bg-slate-50 text-xs grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-bold text-slate-800 uppercase">VISA RESPONSABLE DES ACHATS :</div>
                      <div className="h-10"></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800 uppercase">VISA DIRECTION GÉNÉRALE / DAF :</div>
                      <div className="h-10"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Signatures & Stamp */}
              <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs mt-6">
                <div>
                  <div className="font-bold text-slate-800 uppercase">Pour le Client Réceptionnaire :</div>
                  <div className="text-[10px] text-slate-500 italic">Signature précédée de la mention manuscrite</div>
                  <div className="h-14"></div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-800 uppercase">Pour la Direction Générale :</div>
                  <div className="text-[10px] text-slate-500 italic">Visa, Cachet & Signature Autorisée</div>
                  <div className="h-14 flex items-center justify-end font-serif font-black text-teal-800 tracking-wider">
                    AURA COMMERCE SARL
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Document */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Créer un Document Commercial Sur-Mesure</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Type de Document :</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocType)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    <option value="invoice" className="bg-slate-900 text-white">Facture Définitive A4</option>
                    <option value="proforma" className="bg-slate-900 text-white">Devis / Proforma</option>
                    <option value="order" className="bg-slate-900 text-white">Bon de Commande (BC)</option>
                    <option value="delivery" className="bg-slate-900 text-white">Bon de Livraison (BL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Client Destinataire :</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name} ({c.cat})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Date Document :</label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Document Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-muted)]">Lignes d'articles ou prestations :</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-[var(--primary)] font-bold hover:underline"
                  >
                    + Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {docLines.map((line, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={line.desc}
                          onChange={(e) => handleUpdateLine(idx, 'desc', e.target.value)}
                          placeholder="Désignation article ou prestation..."
                          className="w-full p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={line.unit}
                          onChange={(e) => handleUpdateLine(idx, 'unit', e.target.value)}
                          placeholder="Sac, U..."
                          className="w-full p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-main)] text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.qty}
                          min="1"
                          onChange={(e) => handleUpdateLine(idx, 'qty', parseInt(e.target.value, 10) || 1)}
                          className="w-full p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono font-bold text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.pu}
                          onChange={(e) => handleUpdateLine(idx, 'pu', parseInt(e.target.value, 10) || 0)}
                          className="w-full p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono font-bold text-right focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-[var(--text-muted)] hover:text-rose-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSaveDocument}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black shadow-xs transition-all"
              >
                Générer & Afficher dans le Studio A4
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
