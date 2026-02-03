// ===========================================
// User Types for RestoHub
// ===========================================

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  EMPLOYEE = 'employee'
}

export interface User {
  id: string;
  username: string;           // "marko123" (kreira admin)
  passwordHash: string;       // bcrypt hash
  name: string;
  role: UserRole;
  restaurantId: string;
  employeeId?: string;        // veza sa Employee
  createdAt: number;
  lastLogin?: number;
}
