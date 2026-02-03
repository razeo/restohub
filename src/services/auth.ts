// ===========================================
// Auth Service for RestoHub
// ===========================================

import { User, UserRole } from '../types/users';
import { getStorageItem, setStorageItem } from '../utils/storage';

const USERS_KEY = 'restohub_users';
const CURRENT_USER_KEY = 'restohub_current_user';

export const authService = {
  // Hash lozinke (jednostavna implementacija za početak)
  hashPassword(password: string): string {
    // U produkciji koristi bcrypt
    return btoa(password + '_restohub_salt');
  },
  
  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  },
  
  // User CRUD
  getUsers(): User[] {
    return getStorageItem<User[]>(USERS_KEY, []);
  },
  
  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
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
  
  validateUser(username: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    
    if (user && this.verifyPassword(password, user.passwordHash)) {
      // Ažuriraj lastLogin
      user.lastLogin = Date.now();
      setStorageItem(USERS_KEY, users);
      return user;
    }
    return null;
  },
  
  // Session management
  login(user: User): void {
    setStorageItem(CURRENT_USER_KEY, user);
  },
  
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  getCurrentUser(): User | null {
    return getStorageItem<User | null>(CURRENT_USER_KEY, null);
  },
  
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
  
  hasRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  },
  
  // Default admin korisnik
  createDefaultAdmin(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      this.createUser({
        username: 'admin',
        passwordHash: this.hashPassword('admin123'),
        name: 'Administrator',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
      });
    }
  }
};
