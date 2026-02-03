// ===========================================
// User Management Component for RestoHub (Admin only)
// ===========================================

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { User, UserRole } from '../../types/users';
import { authService } from '../../services/auth';

interface UserFormData {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(() => authService.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    role: UserRole.EMPLOYEE,
    employeeId: '',
  });
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Ažuriraj postojećeg korisnika
      const updatedUsers = users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData, passwordHash: formData.password ? authService.hashPassword(formData.password) : user.passwordHash }
          : user
      );
      setUsers(updatedUsers);
      toast.success('Korisnik ažuriran');
    } else {
      // Kreiraj novog korisnika
      const newUser = authService.createUser({
        username: formData.username,
        passwordHash: authService.hashPassword(formData.password),
        name: formData.name,
        role: formData.role,
        restaurantId: 'restaurant-1',
        employeeId: formData.employeeId,
      });
      setUsers([...users, newUser]);
      toast.success('Korisnik kreiran');
    }
    
    resetForm();
  };
  
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Prazno znači ne mijenjati
      name: user.name,
      role: user.role,
      employeeId: user.employeeId || '',
    });
    setShowForm(true);
  };
  
  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.username === 'admin') {
      toast.error('Ne možete obrisati glavnog admina');
      return;
    }
    
    if (window.confirm('Da li ste sigurni da želite obrisati ovog korisnika?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      toast.success('Korisnik obrisan');
    }
  };
  
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: UserRole.EMPLOYEE,
      employeeId: '',
    });
    setEditingUser(null);
    setShowForm(false);
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Upravljanje korisnicima</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Dodaj korisnika
        </button>
      </div>
      
      {/* Pretraga */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Pretraži korisnike..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
      
      {/* Tabela korisnika */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Ime</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Korisničko ime</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Uloga</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Kreiran</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4 font-mono text-sm">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                    user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role === UserRole.ADMIN ? 'Admin' : 
                     user.role === UserRole.MANAGER ? 'Menadžer' : 'Radnik'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString('sr-Latn')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit size={18} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Forma za dodavanje/uređivanje */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingUser ? 'Uredi korisnika' : 'Dodaj korisnika'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ime i prezime</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Korisničko ime</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingUser ? 'Nova lozinka (ostavite prazno da ne mijenjate)' : 'Lozinka'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  required={!editingUser}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Uloga</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                >
                  <option value={UserRole.EMPLOYEE}>Radnik</option>
                  <option value={UserRole.MANAGER}>Menadžer</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Sačuvaj' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
