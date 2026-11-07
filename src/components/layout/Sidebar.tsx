import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Package,
  Truck,
  Receipt,
  CreditCard,
  Users,
  Building2,
  UserCheck,
  Lock,
  Calculator,
  BarChart3,
  Shield,
  MessageSquare,
  Settings
} from 'lucide-react';

export type ActiveView =
  | 'dashboard'
  | 'pos'
  | 'documents'
  | 'stock'
  | 'deliveries'
  | 'expenses'
  | 'credits'
  | 'clients'
  | 'suppliers'
  | 'hr'
  | 'shifts'
  | 'accounting'
  | 'stats'
  | 'audit'
  | 'marketing'
  | 'settings';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const sections = [
    {
      title: 'COMMERCE & CAISSE',
      items: [
        { id: 'dashboard' as ActiveView, label: 'Tableau de Bord 360°', icon: LayoutDashboard },
        { id: 'pos' as ActiveView, label: 'Caisse POS Tactile', icon: ShoppingCart, badge: 'Direct' },
        { id: 'documents' as ActiveView, label: 'Factures & Studio A4', icon: FileText, badge: 'OHADA' },
        { id: 'credits' as ActiveView, label: 'Créances & Recouvrement', icon: CreditCard },
        { id: 'shifts' as ActiveView, label: 'Clôture de Caisse & Quarts', icon: Lock }
      ]
    },
    {
      title: 'STOCKS & LOGISTIQUE',
      items: [
        { id: 'stock' as ActiveView, label: 'Gestion des Stocks & Dépôts', icon: Package },
        { id: 'deliveries' as ActiveView, label: 'Logistique & Expéditions (BL)', icon: Truck },
        { id: 'suppliers' as ActiveView, label: 'Fournisseurs & Commandes (BC)', icon: Building2 }
      ]
    },
    {
      title: 'FINANCE & RESSOURCES',
      items: [
        { id: 'expenses' as ActiveView, label: 'Dépenses & Décaissements', icon: Receipt },
        { id: 'hr' as ActiveView, label: 'Ressources Humaines & Paie', icon: UserCheck },
        { id: 'accounting' as ActiveView, label: 'Comptabilité Fiscale OHADA', icon: Calculator },
        { id: 'stats' as ActiveView, label: 'Statistiques & Décisionnel', icon: BarChart3 }
      ]
    },
    {
      title: 'RELATIONS & SYSTÈME',
      items: [
        { id: 'clients' as ActiveView, label: 'CRM Clients & Comptes IFU', icon: Users },
        { id: 'marketing' as ActiveView, label: 'Marketing & Relances WhatsApp', icon: MessageSquare },
        { id: 'audit' as ActiveView, label: 'Piste d\'Audit & Sécurité', icon: Shield },
        { id: 'settings' as ActiveView, label: 'Paramètres & Personnalisation', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col shrink-0 select-none custom-scroll overflow-y-auto">
      <div className="p-3 space-y-4">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-black tracking-wider text-[var(--text-muted)] uppercase">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-500/10 text-teal-500 border border-teal-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
