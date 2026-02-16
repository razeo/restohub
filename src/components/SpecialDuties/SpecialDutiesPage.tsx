import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, X, Star } from 'lucide-react';
import { SpecialDuty } from '../../types';

interface SpecialDutiesPageProps {
  specialDuties: SpecialDuty[];
  onAddSpecialDuty: (sd: Omit<SpecialDuty, 'id'>) => void;
  onRemoveSpecialDuty: (id: string) => void;
  onUpdateSpecialDuty: (sd: SpecialDuty) => void;
}

export function SpecialDutiesPage({
  specialDuties,
  onAddSpecialDuty,
  onRemoveSpecialDuty,
  onUpdateSpecialDuty
}: SpecialDutiesPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDuty, setEditingDuty] = useState<SpecialDuty | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    color: '#F59E0B',
    description: ''
  });

  const filteredDuties = specialDuties.filter(sd =>
    sd.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sd.description && sd.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (duty?: SpecialDuty) => {
    if (duty) {
      setEditingDuty(duty);
      setFormData({
        label: duty.label,
        color: duty.color,
        description: duty.description || ''
      });
    } else {
      setEditingDuty(null);
      setFormData({
        label: '',
        color: '#F59E0B',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDuty(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    if (editingDuty) {
      onUpdateSpecialDuty({
        ...editingDuty,
        label: formData.label,
        color: formData.color,
        description: formData.description
      });
    } else {
      onAddSpecialDuty({
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posebne Dužnosti</h1>
          <p className="text-gray-500 dark:text-gray-400">Upravljanje specifičnim zaduženjima (npr. Zlatni Stolovi)</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus size={20} />
          Nova Dužnost
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pretraži posebne dužnosti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDuties.map(duty => (
          <div
            key={duty.id}
            className="group relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: duty.color }}
                  >
                    <Star size={18} fill="currentColor" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{duty.label}</h3>
                    {duty.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{duty.description}</p>
                    )}
                 </div>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button
                    onClick={() => handleOpenModal(duty)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Da li ste sigurni da želite obrisati ovu dužnost?')) {
                        onRemoveSpecialDuty(duty.id);
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

        {filteredDuties.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
            {searchTerm ? 'Nema rezultata pretrage' : 'Nema posebnih dužnosti. Kreirajte novu.'}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDuty ? 'Izmjeni Dužnost' : 'Nova Posebna Dužnost'}
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                  placeholder="npr. Zlatni Stolovi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boja
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'].map(c => (
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white resize-none h-24"
                  placeholder="Dodatni detalji..."
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
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {editingDuty ? 'Sačuvaj izmjene' : 'Kreiraj dužnost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
