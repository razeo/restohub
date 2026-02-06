import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../src/services/auth';
import { UserRole } from '../src/types/users';

// Mock localStorage
const localStorageMock: Record<string, string> = {};

vi.stubGlobal('localStorage', {
  getItem: (key: string) => localStorageMock[key] || null,
  setItem: (key: string, value: string) => { localStorageMock[key] = value; },
  removeItem: (key: string) => { delete localStorageMock[key]; },
  clear: () => { Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]); },
});

describe('Auth Service', () => {
  beforeEach(() => {
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const hash = await authService.hashPassword('test123');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('test123');
    });

    it('should generate unique hashes for same password', async () => {
      const hash1 = await authService.hashPassword('test123');
      const hash2 = await authService.hashPassword('test123');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', async () => {
    it('should verify correct password', async () => {
      const password = 'test123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await authService.hashPassword('test123');
      const isValid = await authService.verifyPassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await authService.createUser({
        username: 'testuser',
        passwordHash: await authService.hashPassword('test123'),
        name: 'Test User',
        role: UserRole.EMPLOYEE,
        restaurantId: 'restaurant-1',
      });

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.name).toBe('Test User');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      await authService.createUser({
        username: 'testuser',
        passwordHash: await authService.hashPassword('test123'),
        name: 'Test User',
        role: UserRole.EMPLOYEE,
        restaurantId: 'restaurant-1',
      });

      const user = await authService.validateUser('testuser', 'test123');
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });

    it('should return null for invalid username', async () => {
      await authService.createUser({
        username: 'testuser',
        passwordHash: await authService.hashPassword('test123'),
        name: 'Test User',
        role: UserRole.EMPLOYEE,
        restaurantId: 'restaurant-1',
      });

      const user = await authService.validateUser('wronguser', 'test123');
      expect(user).toBeNull();
    });

    it('should return null for invalid password', async () => {
      await authService.createUser({
        username: 'testuser',
        passwordHash: await authService.hashPassword('test123'),
        name: 'Test User',
        role: UserRole.EMPLOYEE,
        restaurantId: 'restaurant-1',
      });

      const user = await authService.validateUser('testuser', 'wrongpassword');
      expect(user).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', async () => {
      const user = await authService.createUser({
        username: 'testuser',
        passwordHash: await authService.hashPassword('test123'),
        name: 'Test User',
        role: UserRole.ADMIN,
        restaurantId: 'restaurant-1',
      });

      expect(authService.hasRole(user, [UserRole.ADMIN])).toBe(true);
      expect(authService.hasRole(user, [UserRole.MANAGER])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(authService.hasRole(null, [UserRole.ADMIN])).toBe(false);
    });
  });

  describe('createDefaultAdmin', () => {
    it('should create admin if no users exist', async () => {
      await authService.createDefaultAdmin();
      
      const users = authService.getUsers();
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('admin');
      expect(users[0].role).toBe(UserRole.ADMIN);
    });

    it('should not create admin if users exist', async () => {
      await authService.createUser({
        username: 'existing',
        passwordHash: 'hash',
        name: 'Existing',
        role: UserRole.EMPLOYEE,
        restaurantId: 'restaurant-1',
      });

      await authService.createDefaultAdmin();
      
      const users = authService.getUsers();
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('existing');
    });
  });
});
