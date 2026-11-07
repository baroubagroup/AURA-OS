import React, { useState, useEffect } from 'react';
import {
  Store,
  Wifi,
  WifiOff,
  Printer,
  Moon,
  Sun,
  User,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { thermalPrinter } from '../../services/bluetoothPrinter';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, switchUser } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState('');
  const [btConnected, setBtConnected] = useState(false);
  const [isConnectingBt, setIsConnectingBt] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleConnectPrinter = async () => {
    setIsConnectingBt(true);
    const success = await thermalPrinter.requestDevice();
    setBtConnected(success);
    setIsConnectingBt(false);
    if (success) {
      alert('Imprimante thermique Bluetooth connectée avec succès !');
    }
  };

  return (
    <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand & Store */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-black">
          <Store className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight text-[var(--text-main)]">AURA POS & ERP</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/15 text-teal-500 border border-teal-500/30">
              OHADA v5.2
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium">AURA Commerce SARL • Ouagadougou</div>
        </div>
      </div>

      {/* Middle Status: Offline-First & Clock */}
      <div className="flex items-center gap-3 text-xs">
        {/* Offline indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? 'En ligne (Sync active)' : '100% Hors-Ligne (IndexedDB)'}</span>
        </div>

        {/* Time GMT */}
        <div className="hidden sm:flex items-center gap-1.5 text-[var(--text-muted)] font-mono text-[11px] bg-[var(--bg-card-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
          <Clock className="w-3.5 h-3.5" />
          <span>{currentTime} GMT</span>
        </div>
      </div>

      {/* Right Actions: Bluetooth, User switcher, Theme */}
      <div className="flex items-center gap-2">
        {/* Bluetooth printer button */}
        <button
          onClick={handleConnectPrinter}
          disabled={isConnectingBt}
          title="Connecter imprimante thermique ESC/POS"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            btConnected
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
              : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border)]'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{btConnected ? 'Imprimante prête' : 'Imprimante 58/80mm'}</span>
        </button>

        {/* User Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-card-subtle)] px-2 py-1 rounded-lg border border-[var(--border)]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          <select
            value={currentUser.role}
            onChange={(e) => switchUser(e.target.value as UserRole)}
            className="bg-transparent text-xs font-bold text-[var(--text-main)] focus:outline-none cursor-pointer"
          >
            <option value="admin" className="bg-slate-900 text-white">DG / Admin</option>
            <option value="manager" className="bg-slate-900 text-white">Gérant / Manager</option>
            <option value="staff" className="bg-slate-900 text-white">Superviseur Magasin</option>
            <option value="cashier" className="bg-slate-900 text-white">Caissière (Caisse 1)</option>
          </select>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Passer en mode clair doux' : 'Passer en mode sombre'}
          className="w-8 h-8 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:border-teal-500 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
