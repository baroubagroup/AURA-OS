import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Phone,
  Banknote,
  X,
  Printer
} from 'lucide-react';
import { db } from '../../db/schema';
import { usePos } from '../../context/PosContext';
import { useAuth } from '../../context/AuthContext';
import { ProductVisual } from '../../constants/svgIcons';
import { formatCFA, formatNum } from '../../utils/formatters';
import { thermalPrinter } from '../../services/bluetoothPrinter';
import type { PaymentMethod, Product, CompanySettings } from '../../types';

export const PosView: React.FC = () => {
  const {
    activeCartIndex,
    setActiveCartIndex,
    carts,
    currentCart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCurrentCart,
    cartTotals,
    smartCashSuggestions
  } = usePos();

  const { currentUser } = useAuth();

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const companySetting = useLiveQuery(async () => {
    const s = await db.settings.get('company');
    return s?.value as CompanySettings;
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'all' || p.cat.toLowerCase().includes(selectedCat.toLowerCase());
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.ref.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleOpenPayment = () => {
    if (currentCart.length === 0) return;
    setReceivedAmount(cartTotals.total);
    setIsPaymentModalOpen(true);
  };

  const handleValidateSale = async () => {
    const change = Math.max(0, receivedAmount - cartTotals.total);
    const invoiceNumber = 'TK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newSale = {
      id: Date.now(),
      invoiceNumber,
      items: currentCart.map(it => ({
        productId: it.product.id,
        name: it.product.name,
        qty: it.qty,
        priceUnit: it.priceUnit,
        discount: it.discount,
        total: (it.priceUnit * it.qty) - it.discount
      })),
      subtotal: cartTotals.subtotal,
      discount: cartTotals.discount,
      total: cartTotals.total,
      paymentMethod,
      received: receivedAmount,
      change,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      cashierName: currentUser.name,
      status: 'completed' as const,
      createdAt: new Date().toISOString()
    };

    // Save to IndexedDB
    await db.sales.add(newSale);

    // Update product stocks (only decrement for physical products)
    for (const item of currentCart) {
      if (item.product.type !== 'service') {
        const currentProd = await db.products.get(item.product.id);
        if (currentProd) {
          const newShelfStock = Math.max(0, currentProd.stockShelf - item.qty);
          await db.products.update(item.product.id, { stockShelf: newShelfStock });
        }
      }
    }

    // Print receipt
    if (companySetting) {
      thermalPrinter.printSaleReceipt(newSale, companySetting);
    }

    // Reset and close
    clearCurrentCart();
    setIsPaymentModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
  };

  const changeDue = Math.max(0, receivedAmount - cartTotals.total);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Left Area: Catalog & Products */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border)] overflow-hidden">
        {/* Search & Categories Bar */}
        <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-card)] space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, référence ou code-barres (ex: Brakina, 600100...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === 'all'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]'
              }`}
            >
              Tous les rayons ({products.length})
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === c.name
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-3 overflow-y-auto custom-scroll">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProducts.map(p => {
              const isService = p.type === 'service';
              const isLow = !isService && p.stockShelf <= p.alertThreshold;

              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer flex flex-col justify-between transition-all hover:shadow-sm active:scale-[0.98] select-none"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono mb-1.5">
                      <span className="font-bold">{p.ref}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                          isService
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : isLow
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {isService ? '⚡ Prestation' : `Rayon: ${p.stockShelf}`}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 mb-2">
                      <ProductVisual product={p} size="w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[var(--text-main)] line-clamp-2 leading-tight">
                          {p.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-muted)]">{p.unit || 'Unité'}</span>
                    <span className="text-xs font-black font-mono text-[var(--primary)]">
                      {formatNum(p.priceSell)} F
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Area: POS Cart & Checkout */}
      <div className="w-full lg:w-96 bg-[var(--bg-card)] flex flex-col shrink-0 overflow-hidden">
        {/* Multi-cart Tabs */}
        <div className="p-2 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                onClick={() => setActiveCartIndex(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeCartIndex === idx
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]'
                }`}
              >
                Panier {idx + 1} {carts[idx]?.length > 0 && `(${carts[idx].length})`}
              </button>
            ))}
          </div>

          {currentCart.length > 0 && (
            <button
              onClick={clearCurrentCart}
              title="Vider le panier"
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto custom-scroll space-y-2">
          {currentCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center p-6 space-y-2">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <div className="text-xs font-bold">Panier vide</div>
              <div className="text-[11px]">Touchez un article ou scannez un code-barres</div>
            </div>
          ) : (
            currentCart.map(item => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[var(--text-main)] truncate">{item.product.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      PU: {formatNum(item.priceUnit)} F
                    </div>
                  </div>
                  <div className="text-xs font-black font-mono text-[var(--text-main)]">
                    {formatNum((item.priceUnit * item.qty) - item.discount)} F
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] p-0.5">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.qty - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-rose-500"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black font-mono text-[var(--text-main)]">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.qty + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-emerald-500"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[10px] text-rose-500 hover:underline font-semibold"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Smart Cash Suggestions */}
        {currentCart.length > 0 && smartCashSuggestions.length > 0 && (
          <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-card-subtle)]">
            <div className="text-[10px] text-[var(--text-muted)] font-bold mb-1.5">
              Coupures suggérées (Smart Cash) :
            </div>
            <div className="flex flex-wrap gap-1.5">
              {smartCashSuggestions.map((amt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReceivedAmount(amt);
                    handleOpenPayment();
                  }}
                  className="px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] text-[11px] font-mono font-bold text-[var(--text-main)] transition-all"
                >
                  {formatNum(amt)} F
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cart Summary & Pay Button */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-card)] space-y-2.5">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Articles ({cartTotals.itemsCount}) :</span>
              <span className="font-mono">{formatNum(cartTotals.subtotal)} F CFA</span>
            </div>
            {cartTotals.discount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Remise appliquée :</span>
                <span className="font-mono">-{formatNum(cartTotals.discount)} F CFA</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-[var(--text-main)] pt-1 border-t border-[var(--border)]">
              <span>TOTAL NET :</span>
              <span className="font-mono text-[var(--primary)]">{formatCFA(cartTotals.total)}</span>
            </div>
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={currentCart.length === 0}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Banknote className="w-5 h-5" />
            <span>ENCAISSER ({formatCFA(cartTotals.total)})</span>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
              <div>
                <h3 className="font-black text-sm text-[var(--text-main)]">Règlement de la Vente</h3>
                <div className="text-xs text-[var(--text-muted)]">Total net à payer : <strong className="text-[var(--primary)]">{formatCFA(cartTotals.total)}</strong></div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Payment Methods */}
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1.5">Moyen de Paiement :</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash' as PaymentMethod, label: 'Espèces', icon: Banknote },
                    { id: 'orange_money' as PaymentMethod, label: 'Orange Money', icon: Phone },
                    { id: 'wave' as PaymentMethod, label: 'Wave', icon: Phone },
                    { id: 'moov_money' as PaymentMethod, label: 'Moov Money', icon: Phone },
                    { id: 'card' as PaymentMethod, label: 'Carte Bancaire', icon: CreditCard },
                    { id: 'credit' as PaymentMethod, label: 'Dette / Crédit', icon: CreditCard }
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === m.id
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                            : 'bg-[var(--bg-card-subtle)] text-[var(--text-main)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Received & Change */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-2">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Montant Reçu :</label>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-lg font-black font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]">
                  <span className="font-bold text-[var(--text-muted)]">Monnaie à Rendre :</span>
                  <span className={`text-base font-black font-mono ${changeDue > 0 ? 'text-emerald-500' : 'text-[var(--text-main)]'}`}>
                    {formatCFA(changeDue)}
                  </span>
                </div>
              </div>

              {/* Client Info (Optional) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">Nom Client (Optionnel) :</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex: M. Sawadogo"
                    className="w-full p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">Téléphone :</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+226 70 00 00 00"
                    className="w-full p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleValidateSale}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Valider & Imprimer Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
