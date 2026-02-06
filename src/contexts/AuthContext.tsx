// ===========================================
// Auth Context for RestoHub
// ===========================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { User, UserRole } from '../types/users';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initAuth = async () => {
      // Inicijaliziraj default admina
      await authService.createDefaultAdmin();
      
      // Provjeri da li je korisnik već prijavljen
      const savedUser = authService.getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);
  
  // Session refresh timer - produžava session svakih 5 min
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      authService.refreshSession();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = await authService.validateUser(username, password);
    if (foundUser) {
      authService.login(foundUser);
      setUser(foundUser);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const hasRole = (roles: UserRole[]): boolean => {
    return authService.hasRole(user, roles);
  };
  
  const refreshSession = () => {
    authService.refreshSession();
  };
  
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !isLoading,
    login,
    logout,
    hasRole,
    refreshSession,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth mora biti korišten unutar AuthProvider');
  }
  return context;
}
