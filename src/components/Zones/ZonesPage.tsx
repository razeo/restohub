import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { Zone } from '../../types';

interface ZonesPageProps {
  zones: Zone[];
  onAddZone: (zone: Omit<Zone, 'id'>) => void; // Expects Omit<Zone, 'id'>, caller handles ID generation
  onRemoveZone: (id: string) => void;
  onUpdateZone: (zone: Zone) => void;
}

export function ZonesPage({ zones, onAddZone, onRemoveZone, onUpdateZone }: ZonesPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    label: '',
    color: '#3B82F6',
    description: ''
  });

  const filteredZones = zones.filter(z => 
    z.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (z.description && z.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        label: zone.label,
        color: zone.color,
        description: zone.description || ''
      });
    } else {
      setEditingZone(null);
      setFormData({
        label: '',
        color: '#3B82F6',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    if (editingZone) {
      onUpdateZone({
        ...editingZone,
        label: formData.label,
        color: formData.color,
        description: formData.description
      });
    } else {
      // Create new zone object without ID, let the hook handle ID generation
      onAddZone({
        label: formData.label,
        color: formData.color,
        description: formData.description
      });
    }
    handleCloseModal();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reoni</h1>
          <p className="text-gray-500 dark:text-gray-400">Upravljanje reonima u restoranu</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novi Reon
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pretraži reone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredZones.map(zone => (
          <div
            key={zone.id}
            className="group relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
          >
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-12 rounded-full" 
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{zone.label}</h3>
                    {zone.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{zone.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(zone)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Da li ste sigurni da želite obrisati ovaj reon?')) {
                        onRemoveZone(zone.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
             </div>
          </div>
        ))}

        {filteredZones.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
            {searchTerm ? 'Nema rezultata pretrage' : 'Nema definisanih reona. Kreirajte novi reon.'}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingZone ? 'Izmjeni Reon' : 'Novi Reon'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Naziv
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="npr. Terasa, Šank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boja
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        formData.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opis (opciono)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none h-24"
                  placeholder="Dodatni detalji o reonu..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingZone ? 'Sačuvaj izmjene' : 'Kreiraj reon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
