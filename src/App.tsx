import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PosProvider } from './context/PosContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type ActiveView } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { PosView } from './components/views/PosView';
import { StockView } from './components/views/StockView';
import { DocumentsView } from './components/views/DocumentsView';
import { HrView } from './components/views/HrView';
import { ExpensesView } from './components/views/ExpensesView';
import { CreditsView } from './components/views/CreditsView';
import { ShiftsView } from './components/views/ShiftsView';
import { DeliveriesView } from './components/views/DeliveriesView';
import { ClientsView } from './components/views/ClientsView';
import { SuppliersView } from './components/views/SuppliersView';
import { AccountingView } from './components/views/AccountingView';
import { StatsView } from './components/views/StatsView';
import { AuditView } from './components/views/AuditView';
import { MarketingView } from './components/views/MarketingView';
import { SettingsView } from './components/views/SettingsView';
import { seedDatabaseIfEmpty } from './db/seedData';

function MainApp() {
  const [activeView, setActiveView] = useState<ActiveView>('pos');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    seedDatabaseIfEmpty().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0b0f17] text-white space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <div className="font-bold text-sm tracking-wide">Initialisation d'AURA POS & Base Offline...</div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <PosView />;
      case 'stock':
        return <StockView />;
      case 'documents':
        return <DocumentsView />;
      case 'hr':
        return <HrView />;
      case 'expenses':
        return <ExpensesView />;
      case 'credits':
        return <CreditsView />;
      case 'shifts':
        return <ShiftsView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'clients':
        return <ClientsView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'accounting':
        return <AccountingView />;
      case 'stats':
        return <StatsView />;
      case 'audit':
        return <AuditView />;
      case 'marketing':
        return <MarketingView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PosView />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PosProvider>
          <MainApp />
        </PosProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
