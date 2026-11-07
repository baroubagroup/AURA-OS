import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Barcode,
  Layers,
  Upload,
  X,
  Check
} from 'lucide-react';
import { db } from '../../db/schema';
import { ProductVisual, SVG_ICONS } from '../../constants/svgIcons';
import { DAILY_PRODUCTS_CATALOG, type CatalogItem } from '../../constants/dailyCatalog';
import { formatNum, formatCFA } from '../../utils/formatters';
import { printA4Element } from '../../services/a4Printer';
import type { Product } from '../../types';

export const StockView: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  const [filterType, setFilterType] = useState<'all' | 'products' | 'services' | 'alerts'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);

  // New Product Form State
  const [newRef, setNewRef] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newCat, setNewCat] = useState<string>('Quincaillerie & BTP');
  const [newType, setNewType] = useState<'product' | 'service'>('product');
  const [newUnit, setNewUnit] = useState<string>('Pièce');
  const [newPriceBuy, setNewPriceBuy] = useState<number>(1000);
  const [newPriceSell, setNewPriceSell] = useState<number>(1500);
  const [newStockShelf, setNewStockShelf] = useState<number>(20);
  const [newStockReserve, setNewStockReserve] = useState<number>(50);
  const [newAlert, setNewAlert] = useState<number>(5);
  const [newBarcode, setNewBarcode] = useState<string>('');
  const [newSvgKey, setNewSvgKey] = useState<string>('cart');
  const [newBadgeColor, setNewBadgeColor] = useState<string>('bg-teal-500/10 text-teal-500 border-teal-500/20');
  const [newCustomImage, setNewCustomImage] = useState<string | null>(null);

  // Filtering
  const filteredProducts = products.filter(p => {
    const isService = p.type === 'service';
    const isAlert = !isService && p.stockShelf <= p.alertThreshold;

    if (filterType === 'products' && isService) return false;
    if (filterType === 'services' && !isService) return false;
    if (filterType === 'alerts' && !isAlert) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q) || p.barcode.includes(q);
    }
    return true;
  });

  const totalStockValue = products
    .filter(p => p.type !== 'service')
    .reduce((sum, p) => sum + ((p.stockShelf + p.stockReserve) * p.priceBuy), 0);

  const alertsCount = products.filter(p => p.type !== 'service' && p.stockShelf <= p.alertThreshold).length;

  const handleSelectCatalogItem = (item: CatalogItem) => {
    setNewName(item.name);
    setNewCat(item.cat);
    setNewPriceBuy(item.buy);
    setNewPriceSell(item.sell);
    setNewUnit(item.unit);
    setNewSvgKey(item.icon);
    setNewBadgeColor(item.color);
    setNewCustomImage(null);
    if (item.isService) {
      setNewType('service');
    } else {
      setNewType('product');
    }
    setIsCatalogModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setNewCustomImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async () => {
    if (!newName.trim()) {
      alert('Veuillez saisir le nom du produit.');
      return;
    }

    const ref = newRef.trim() || ((newType === 'service' ? 'SRV-' : 'ART-') + Math.floor(100 + Math.random() * 900));
    const barcode = newBarcode.trim() || ('600' + Math.floor(100000000 + Math.random() * 900000000));

    const newProduct: Product = {
      id: Date.now(),
      ref,
      name: newName.trim(),
      cat: newCat,
      type: newType,
      unit: newUnit,
      svgKey: newSvgKey,
      badgeColor: newBadgeColor,
      icon: newCustomImage || undefined,
      visualType: newCustomImage ? 'image' : 'svg',
      priceBuy: newType === 'service' ? 0 : newPriceBuy,
      priceSell: newPriceSell,
      stockShelf: newType === 'service' ? 999999 : newStockShelf,
      stockReserve: newType === 'service' ? 0 : newStockReserve,
      alertThreshold: newType === 'service' ? 0 : newAlert,
      barcode
    };

    await db.products.add(newProduct);
    await db.auditLogs.add({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: 'CRÉATION_PRODUIT',
      user: 'Utilisateur',
      module: 'Stocks',
      details: `Article ${newName} (${ref}) créé avec succès.`
    });

    setIsAddModalOpen(false);
    // Reset
    setNewName('');
    setNewRef('');
    setNewCustomImage(null);
  };

  const handleAdjustStock = async (prodId: number, diff: number) => {
    const p = await db.products.get(prodId);
    if (!p) return;
    const nextShelf = Math.max(0, p.stockShelf + diff);
    await db.products.update(prodId, { stockShelf: nextShelf });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-app)]">
      {/* Top Banner & KPI Summary */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
              <Package className="w-5 h-5 text-[var(--primary)]" />
              <span>Gestion des Stocks & Double Dépôt (Rayon & Réserve)</span>
            </h2>
            <div className="text-xs text-[var(--text-muted)]">
              Valeur marchande totale du stock : <strong className="text-emerald-500 font-mono">{formatCFA(totalStockValue)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBarcodeModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--primary)] flex items-center gap-1.5 transition-all"
            >
              <Barcode className="w-4 h-4 text-teal-500" />
              <span>Planche Codes-Barres A4</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Article / Service</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto custom-scroll pb-1">
            {[
              { id: 'all' as const, label: `Tous (${products.length})` },
              { id: 'products' as const, label: `Articles Physiques (${products.filter(p => p.type !== 'service').length})` },
              { id: 'services' as const, label: `Prestations (${products.filter(p => p.type === 'service').length})` },
              { id: 'alerts' as const, label: `Alertes Réappro (${alertsCount})`, alert: alertsCount > 0 }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === f.id
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : f.alert
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="flex-1 p-4 overflow-y-auto custom-scroll">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] text-[10px] uppercase font-bold border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Réf & Article</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3 text-right">Prix Achat</th>
                <th className="p-3 text-right">Prix Vente</th>
                <th className="p-3 text-right">Marge</th>
                <th className="p-3 text-center">Stock Rayon</th>
                <th className="p-3 text-center">Stock Réserve</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Ajuster Rayon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProducts.map(p => {
                const isService = p.type === 'service';
                const isLow = !isService && p.stockShelf <= p.alertThreshold;
                const marginPct = p.priceSell > 0 ? Math.round(((p.priceSell - p.priceBuy) / p.priceSell) * 100) : 0;

                return (
                  <tr key={p.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <ProductVisual product={p} size="w-8 h-8" />
                        <div>
                          <div className="font-bold text-[var(--text-main)]">{p.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{p.ref} • {p.barcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[var(--text-muted)] font-medium">{p.cat}</td>
                    <td className="p-3 text-right font-mono font-bold text-[var(--text-muted)]">
                      {isService ? '—' : `${formatNum(p.priceBuy)} F`}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-[var(--primary)]">
                      {formatNum(p.priceSell)} F
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-500 font-bold">
                      {isService ? '100%' : `${marginPct}%`}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {isService ? (
                        <span className="text-indigo-400 italic font-medium">Illimité</span>
                      ) : (
                        <span className={isLow ? 'text-rose-500 font-black' : 'text-[var(--text-main)]'}>
                          {p.stockShelf}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-[var(--text-muted)]">
                      {isService ? '—' : p.stockReserve}
                    </td>
                    <td className="p-3 text-center">
                      {isService ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-400">
                          ⚡ Prestation
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-500">
                          Alerte Réappro
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-500">
                          En Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {!isService && (
                        <div className="inline-flex items-center gap-1 bg-[var(--bg-card-subtle)] rounded-lg p-0.5 border border-[var(--border)]">
                          <button
                            onClick={() => handleAdjustStock(p.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-rose-500"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p.id, +1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-emerald-500"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <h3 className="font-black text-sm text-[var(--text-main)]">Ajouter un Article ou une Prestation</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
              {/* Visual & Catalog Selector */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {newCustomImage ? (
                    <img src={newCustomImage} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-[var(--border)]" />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl ${newBadgeColor} border flex items-center justify-center`}>
                      {SVG_ICONS[newSvgKey] || SVG_ICONS.cart}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Visuel & Modèle Métier</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Vectoriel professionnel ou photo réelle</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCatalogModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition-all"
                  >
                    Choisir dans le Catalogue (85+)
                  </button>
                  <label className="px-2 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer text-xs font-bold">
                    <Upload className="w-4 h-4 inline" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Type Switcher */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setNewType('product')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    newType === 'product' ? 'bg-[var(--primary)] text-white shadow-xs' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Article Physique
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('service')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    newType === 'service' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Prestation de Service
                </button>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Nom de l'article :</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Sac de Ciment CPJ 42.5 (50kg)"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Référence (SKU) :</label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="Auto-généré si vide"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Catégorie :</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name} className="bg-slate-900 text-white">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Prix d'Achat (F CFA) :</label>
                  <input
                    type="number"
                    disabled={newType === 'service'}
                    value={newType === 'service' ? 0 : newPriceBuy}
                    onChange={(e) => setNewPriceBuy(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] font-mono font-bold focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Prix de Vente (F CFA) :</label>
                  <input
                    type="number"
                    value={newPriceSell}
                    onChange={(e) => setNewPriceSell(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--primary)] font-mono font-black focus:outline-none"
                  />
                </div>

                {newType === 'product' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Stock Rayon (Boutique) :</label>
                      <input
                        type="number"
                        value={newStockShelf}
                        onChange={(e) => setNewStockShelf(parseInt(e.target.value, 10) || 0)}
                        className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Stock Réserve (Dépôt) :</label>
                      <input
                        type="number"
                        value={newStockReserve}
                        onChange={(e) => setNewStockReserve(parseInt(e.target.value, 10) || 0)}
                        className="w-full p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] font-mono focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleCreateProduct}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-black shadow-xs transition-all"
              >
                Enregistrer l'Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Daily Products Catalog Picker */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <div>
                <h3 className="font-black text-sm text-[var(--text-main)]">Catalogue Métiers Burkina Faso (85+ Articles Réels)</h3>
                <div className="text-xs text-[var(--text-muted)]">Cliquez sur un article pour pré-remplir les données</div>
              </div>
              <button onClick={() => setIsCatalogModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DAILY_PRODUCTS_CATALOG.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalogItem(item)}
                    className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer flex items-center justify-between gap-2.5 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${item.color} border flex items-center justify-center shrink-0`}>
                        {SVG_ICONS[item.icon] || SVG_ICONS.cart}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text-main)] truncate">{item.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{item.cat} • {item.unit}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black font-mono text-[var(--primary)]">{formatNum(item.sell)} F</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Barcode Sheet Print Preview */}
      {isBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <div>
                <h3 className="font-black text-sm text-[var(--text-main)]">Planche d'Étiquettes Codes-Barres A4</h3>
                <div className="text-xs text-[var(--text-muted)]">Prêt pour impression A4 (24 étiquettes par feuille)</div>
              </div>
              <button onClick={() => setIsBarcodeModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scroll">
              <div id="barcode-sheet-content" className="p-4 bg-white text-black rounded-xl grid grid-cols-3 gap-3">
                {products.slice(0, 15).map(p => (
                  <div key={p.id} className="p-2 border border-slate-300 rounded text-center space-y-1">
                    <div className="text-[10px] font-bold truncate">{p.name}</div>
                    <div className="font-mono text-xs tracking-widest font-black">||| | |||| | ||</div>
                    <div className="text-[9px] font-mono text-slate-500">{p.barcode}</div>
                    <div className="text-xs font-black font-mono text-teal-700">{formatNum(p.priceSell)} F CFA</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button onClick={() => setIsBarcodeModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]">
                Fermer
              </button>
              <button
                onClick={() => printA4Element('barcode-sheet-content', 'Planche-Codes-Barres')}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-black shadow-xs"
              >
                Imprimer Planche A4
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
