// ===========================================
// Shifts Page - Full CRUD
// ===========================================

import { useState } from 'react';
import { Shift, DayOfWeek } from '../../types';
import { Plus, Pencil, Trash2, X, Clock } from 'lucide-react';

const DAYS = [
  { value: DayOfWeek.MONDAY, label: 'Ponedjeljak', short: 'PON' },
  { value: DayOfWeek.TUESDAY, label: 'Utorak', short: 'UTO' },
  { value: DayOfWeek.WEDNESDAY, label: 'Srijeda', short: 'SRI' },
  { value: DayOfWeek.THURSDAY, label: 'Četvrtak', short: 'ČET' },
  { value: DayOfWeek.FRIDAY, label: 'Petak', short: 'PET' },
  { value: DayOfWeek.SATURDAY, label: 'Subota', short: 'SUB' },
  { value: DayOfWeek.SUNDAY, label: 'Nedjelja', short: 'NED' },
];

const SHIFT_COLORS = [
  { value: '#3B82F6', label: 'Plava', bg: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-50' },
  { value: '#10B981', label: 'Zelena', bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50' },
  { value: '#F59E0B', label: 'Žuta', bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50' },
  { value: '#EF4444', label: 'Crvena', bg: 'bg-red-500', text: 'text-red-700', bgLight: 'bg-red-50' },
  { value: '#8B5CF6', label: 'Ljubičasta', bg: 'bg-violet-500', text: 'text-violet-700', bgLight: 'bg-violet-50' },
  { value: '#EC4899', label: 'Roza', bg: 'bg-pink-500', text: 'text-pink-700', bgLight: 'bg-pink-50' },
  { value: '#6B7280', label: 'Siva', bg: 'bg-gray-500', text: 'text-gray-700', bgLight: 'bg-gray-50' },
];

interface ShiftsPageProps {
  shifts: Shift[];
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onRemoveShift: (id: string) => void;
  onUpdateShift: (shift: Shift) => void;
}

export function ShiftsPage({ shifts, onAddShift, onRemoveShift, onUpdateShift }: ShiftsPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  const [formData, setFormData] = useState({
    day: DayOfWeek.MONDAY,
    startTime: '08:00',
    endTime: '16:00',
    label: '',
    color: '#3B82F6',
  });

  const shiftsByDay = DAYS.map(dayConfig => ({
    ...dayConfig,
    shifts: shifts.filter(s => s.day === dayConfig.value),
  }));

  const openAddModal = (day?: DayOfWeek) => {
    setEditingShift(null);
    setFormData({
      day: day || DayOfWeek.MONDAY,
      startTime: '08:00',
      endTime: '16:00',
      label: '',
      color: '#3B82F6',
    });
    setShowModal(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      label: shift.label || '',
      color: shift.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };

  const handleSave = () => {
    if (!formData.label.trim() || !formData.startTime || !formData.endTime) return;

    if (editingShift) {
      onUpdateShift({
        ...editingShift,
        ...formData,
      });
    } else {
      onAddShift(formData);
    }
    closeModal();
  };

  const getColorStyle = (color: string) => {
    const colorConfig = SHIFT_COLORS.find(c => c.value === color);
    return colorConfig || SHIFT_COLORS[0];
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Smjene</h2>
          <p className="text-slate-500">{shifts.length} smjena definisano</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Nova smjena
        </button>
      </div>

      {/* Shifts by Day */}
      <div className="space-y-4">
        {shiftsByDay.map(dayConfig => (
          <div key={dayConfig.value} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">{dayConfig.label}</span>
                <span className="text-xs text-slate-400">({dayConfig.shifts.length})</span>
              </div>
              <button
                onClick={() => openAddModal(dayConfig.value)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
              >
                <Plus size={14} />
                Dodaj
              </button>
            </div>
            
            {dayConfig.shifts.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                Nema smjena za ovaj dan
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {dayConfig.shifts
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(shift => {
                    const colorStyle = getColorStyle(shift.color || '#3B82F6');
                    return (
                      <div
                        key={shift.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${colorStyle.bgLight} border-slate-200`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${colorStyle.bg}`} />
                          <div>
                            <div className="font-medium text-slate-800">
                              {shift.label || 'Bez naziva'}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock size={14} />
                              {shift.startTime} - {shift.endTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(shift)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Uredi"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onRemoveShift(shift.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Obriši"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingShift ? 'Uredi smjenu' : 'Dodaj smjenu'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Naziv smjene *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="npr. Jutarnja, Večernja, Vikend..."
                />
              </div>

              {/* Day */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dan *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value as DayOfWeek }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {DAYS.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Početak *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kraj *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Boja
                </label>
                <div className="flex gap-2">
                  {SHIFT_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`w-8 h-8 rounded-full ${color.bg} ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pregled
                </label>
                <div className={`p-3 rounded-lg border ${getColorStyle(formData.color).bgLight}`}>
                  <div className="font-medium text-slate-800">
                    {formData.label || 'Bez naziva'}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock size={14} />
                    {formData.startTime} - {formData.endTime}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Odustani
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.label.trim() || !formData.startTime || !formData.endTime}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
