// ===========================================
// Auth Service for RestoHub
// ===========================================

import { User, UserRole } from '../types/users';
import { getStorageItem, setStorageItem } from '../utils/storage';
import bcrypt from 'bcryptjs';

const USERS_KEY = 'restohub_users';
const CURRENT_USER_KEY = 'restohub_current_user';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minuta

export const authService = {
  // Hash lozinke sa bcrypt
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },
  
  // Verifikacija lozinke
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
  
  // User CRUD
  getUsers(): User[] {
    return getStorageItem<User[]>(USERS_KEY, []);
  },
  
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: Date.now(),
    };
    users.push(newUser);
    setStorageItem(USERS_KEY, users);
    return newUser;
  },
  
  async validateUser(username: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    
    if (user) {
      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (isValid) {
        // Ažuriraj lastLogin
        user.lastLogin = Date.now();
        setStorageItem(USERS_KEY, users);
        return user;
      }
    }
    return null;
  },
  
  // Session management
  login(user: User): void {
    setStorageItem(CURRENT_USER_KEY, {
      ...user,
      lastLogin: Date.now(),
    });
  },
  
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  getCurrentUser(): User | null {
    const user = getStorageItem<User | null>(CURRENT_USER_KEY, null);
    if (!user) return null;
    
    // Provjeri da li je istekao session
    if (user.lastLogin && Date.now() - user.lastLogin > SESSION_TIMEOUT) {
      this.logout();
      return null;
    }
    
    return user;
  },
  
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
  
  hasRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  },
  
  // Refresh session (poziva se pri svakom aktiviranju)
  refreshSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      setStorageItem(CURRENT_USER_KEY, {
        ...user,
        lastLogin: Date.now(),
      });
    }
  },
  
  // Default admin korisnik
  async createDefaultAdmin(): Promise<void> {
    const users = this.getUsers();
    if (users.length === 0) {
      await this.createUser({
        username: 'admin',
        passwordHash: await this.hashPassword('admin123'),
        name: 'Administrator',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
      });
    }
  }
};
