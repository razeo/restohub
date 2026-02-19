import React, { useState } from 'react';
import { Plus, X, Pencil, Trash2, GripVertical, Check } from 'lucide-react';
import { Duty } from '../../types';

interface DutiesPageProps {
  duties: Duty[];
  onAdd: (duty: Omit<Duty, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, duty: Partial<Duty>) => void;
}

// Default duties for restaurant
const DEFAULT_DUTIES: Omit<Duty, 'id'>[] = [
  { label: 'Šef kuhinje', color: '#EF4444', description: 'Upravljanje kuhinjom i timom' },
  { label: 'Pomoćni kuvar', color: '#F97316', description: 'Priprema jela' },
  { label: 'Konobar', color: '#3B82F6', description: 'Serviranje gostiju' },
  { label: 'Barmen', color: '#8B5CF6', description: 'Pića i kokteli' },
  { label: 'Hostesa', color: '#EC4899', description: 'Doček gostiju' },
  { label: 'Blagajnik', color: '#10B981', description: 'Naplata i računi' },
  { label: 'Room Service', color: '#06B6D4', description: 'Dostava u sobe' },
  { label: 'Perilica', color: '#6366F1', description: 'Pranje sudova' },
  { label: 'Slastičar', color: '#F59E0B', description: 'Deserti i slatko' },
  { label: 'Sommelier', color: '#84CC16', description: 'Vina i pića' },
];

const DUTY_COLORS = [
  { value: '#EF4444', label: 'Crvena' },
  { value: '#F97316', label: 'Narandžasta' },
  { value: '#3B82F6', label: 'Plava' },
  { value: '#8B5CF6', label: 'Ljubičasta' },
  { value: '#EC4899', label: 'Roza' },
  { value: '#10B981', label: 'Zelena' },
  { value: '#06B6D4', label: 'Cijan' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#F59E0B', label: 'Žuta' },
  { value: '#84CC16', label: 'Limeta' },
];

export function DutiesPage({ duties, onAdd, onRemove, onUpdate }: DutiesPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDefaults, setShowDefaults] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [formData, setFormData] = useState({ label: '', color: '#3B82F6', description: '' });

  // Load default duties
  const loadDefaults = () => {
    DEFAULT_DUTIES.forEach(duty => {
      const exists = duties.find(d => d.label.toLowerCase() === duty.label.toLowerCase());
      if (!exists) {
        onAdd(duty);
      }
    });
    setShowDefaults(false);
  };

  const openAddModal = () => {
    setEditingDuty(null);
    setFormData({ label: '', color: '#3B82F6', description: '' });
    setShowModal(true);
  };

  const openEditModal = (duty: Duty) => {
    setEditingDuty(duty);
    setFormData({ label: duty.label, color: duty.color || '#3B82F6', description: duty.description || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.label.trim()) return;

    if (editingDuty) {
      onUpdate(editingDuty.id, formData);
    } else {
      onAdd(formData);
    }
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDuty(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dužnosti</h1>
          <p className="text-gray-500 mt-1">{duties.length} pozicija definisano</p>
        </div>
        <div className="flex gap-3">
          {duties.length < DEFAULT_DUTIES.length && (
            <button
              onClick={() => setShowDefaults(true)}
              className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
            >
              + Default
            </button>
          )}
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-medium"
          >
            + Nova dužnost
          </button>
        </div>
      </div>

      {/* Duties Grid */}
      {duties.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nema dužnosti</h3>
          <p className="text-gray-500 mb-6">Kreirajte prvu dužnost za vaš tim</p>
          <button
            onClick={loadDefaults}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Učitaj default dužnosti
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {duties.map((duty) => (
            <div
              key={duty.id}
              className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
            >
              {/* Color indicator */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                style={{ backgroundColor: duty.color || '#3B82F6' }}
              />
              
              <div className="flex items-start justify-between mt-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{duty.label}</h3>
                  {duty.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{duty.description}</p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(duty)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onRemove(duty.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Color dots */}
              <div className="flex items-center gap-1.5 mt-4">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: duty.color || '#3B82F6' }}
                />
                <span className="text-xs text-gray-400">
                  {DUTY_COLORS.find(c => c.value === duty.color)?.label || 'Prilagođena'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDuty ? 'Uredi dužnost' : 'Nova dužnost'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naziv dužnosti
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all"
                  placeholder="npr. Konobar, Kuvar..."
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis (opcionalno)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all resize-none"
                  rows={2}
                  placeholder="Kratak opis dužnosti..."
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Boja
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {DUTY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color.value 
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' 
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
              >
                Odustani
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.label.trim()}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors text-sm font-medium"
              >
                {editingDuty ? 'Sačuvaj' : 'Kreiraj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defaults Confirmation Modal */}
      {showDefaults && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Učitaj default dužnosti?
              </h3>
              <p className="text-gray-500 text-sm">
                Dodajemo {DEFAULT_DUTIES.length} standardnih dužnosti za restoran.
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50">
              <button
                onClick={() => setShowDefaults(false)}
                className="flex-1 px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
              >
                Odustani
              </button>
              <button
                onClick={loadDefaults}
                className="flex-1 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-medium"
              >
                Dodaj sve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
