import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'admin' | 'manager' | 'staff' | 'cashier';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  store: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  switchUser: (role: UserRole) => void;
  can: (action: string) => boolean;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  admin: { id: 'usr-1', name: 'Abdoul Kaboré (DG)', role: 'admin', store: 'Siège Ouagadougou' },
  manager: { id: 'usr-2', name: 'Ousmane Zoungrana (Gérant)', role: 'manager', store: 'Dépôt Central Gounghin' },
  staff: { id: 'usr-3', name: 'Moussa Traoré (Superviseur)', role: 'staff', store: 'Magasin Rayon' },
  cashier: { id: 'usr-4', name: 'Aminata Sanogo (Caisse 1)', role: 'cashier', store: 'Caisse Principale' }
};

const AuthContext = createContext<AuthContextType>({
  currentUser: DEFAULT_USERS.admin,
  switchUser: () => {},
  can: () => true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS.admin);

  const switchUser = (role: UserRole) => {
    setCurrentUser(DEFAULT_USERS[role]);
  };

  const can = (action: string): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') {
      return !['users.manage', 'license.view'].includes(action);
    }
    if (currentUser.role === 'staff') {
      return !['finance.view', 'accounting.manage', 'users.manage', 'sale.cancel'].includes(action);
    }
    if (currentUser.role === 'cashier') {
      return ['sale.create', 'sale.discount', 'receipt.print'].includes(action);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
