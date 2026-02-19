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
  onAddShifts: (shifts: Omit<Shift, 'id'>[]) => void;
  onRemoveShift: (id: string) => void;
  onUpdateShift: (shift: Shift) => void;
}

export function ShiftsPage({ shifts, onAddShift, onAddShifts, onRemoveShift, onUpdateShift }: ShiftsPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [formData, setFormData] = useState({
    day: DayOfWeek.MONDAY,
    startTime: '08:00',
    endTime: '16:00',
    label: '',
    color: '#3B82F6',
    replicateToAllDays: false,
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
      replicateToAllDays: false,
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
      replicateToAllDays: false,
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
      if (formData.replicateToAllDays) {
        // Update all shifts with same label
        const shiftsToUpdate = shifts.filter(s => s.label === editingShift.label);
        shiftsToUpdate.forEach(s => {
          onUpdateShift({
            ...s,
            label: formData.label,
            startTime: formData.startTime,
            endTime: formData.endTime,
            color: formData.color,
          });
        });
      } else {
        onUpdateShift({
          ...editingShift,
          ...formData,
        });
      }
    } else if (formData.replicateToAllDays) {
      // Add shift to all days using the new batch function
      const batchShifts = DAYS.map(dayConfig => ({
        day: dayConfig.value,
        startTime: formData.startTime,
        endTime: formData.endTime,
        label: formData.label,
        color: formData.color,
      }));
      onAddShifts(batchShifts);
    } else {
      onAddShift({
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        label: formData.label,
        color: formData.color,
      });
    }
    closeModal();
  };

  const getColorStyle = (color: string) => {
    const colorConfig = SHIFT_COLORS.find(c => c.value === color);
    return colorConfig || SHIFT_COLORS[0];
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 bg-slate-50/50 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Radne smjene</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <Clock size={12} className="text-primary-600" />
            Konfiguracija radnog vremena i šablona
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-xl shadow-premium hover:scale-105 active:scale-95 transition-all font-bold text-sm"
        >
          <Plus size={18} />
          Nova smjena
        </button>
      </div>

      {/* Shifts by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shiftsByDay.map(dayConfig => (
          <div key={dayConfig.value} className="bg-white rounded-3xl shadow-soft border border-slate-200/50 overflow-hidden flex flex-col hover:shadow-premium transition-all">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{dayConfig.label}</span>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-400">
                  {dayConfig.shifts.length}
                </span>
              </div>
              <button
                onClick={() => openAddModal(dayConfig.value)}
                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Dodaj smjenu"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 p-5 min-h-[120px]">
              {dayConfig.shifts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Clock size={14} className="text-slate-300" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nema smjena</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayConfig.shifts
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(shift => {
                      const colorStyle = getColorStyle(shift.color || '#3B82F6');
                      return (
                        <div
                          key={shift.id}
                          className={`group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100/60 transition-all hover:bg-slate-50 relative overflow-hidden`}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorStyle.bg}`} />
                          <div className="flex items-center gap-3">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 text-sm tracking-tight leading-tight">
                                {shift.label || 'Bez naziva'}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                <Clock size={10} />
                                {shift.startTime} — {shift.endTime}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(shift)}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                              title="Uredi"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => onRemoveShift(shift.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                              title="Obriši"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-premium w-full max-w-lg overflow-hidden animate-enter">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {editingShift ? 'Uredi parametre smjene' : 'Definisanje nove smjene'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Shift Intelligence Configuration
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Label */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Naziv smjene *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-300 transition-all font-medium"
                  placeholder="npr. Jutarnja, Večernja, Vikend..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Dan u sedmici *
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value as DayOfWeek }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-300 transition-all font-bold appearance-none"
                    disabled={formData.replicateToAllDays}
                  >
                    {DAYS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Identifikaciona Boja
                  </label>
                  <div className="flex gap-2.5 pt-1">
                    {SHIFT_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`w-7 h-7 rounded-full ${color.bg} transition-all ${formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-primary-900 scale-110 shadow-lg'
                          : 'hover:scale-110'
                          }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Replicate to all days */}
              {(
                <div className="flex items-center gap-4 p-4 bg-primary-50/50 rounded-2xl border border-primary-100 group cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, replicateToAllDays: !prev.replicateToAllDays }))}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.replicateToAllDays ? 'bg-primary-900 text-white' : 'bg-white border border-slate-200 text-transparent'}`}>
                    <X size={14} className={formData.replicateToAllDays ? '' : 'hidden'} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800">Repliciraj na sve dane</div>
                    <div className="text-[10px] font-medium text-slate-400 tracking-tight">Automatsko kreiranje za cijelu sedmicu</div>
                  </div>
                </div>
              )}

              {/* Time */}
              <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Početak rada
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-300 transition-all font-bold text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Kraj rada
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-300 transition-all font-bold text-center"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Pregled kartice smjene
                </label>
                <div className={`p-4 rounded-2xl border ${getColorStyle(formData.color).bgLight} border-slate-200/50 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getColorStyle(formData.color).bg} shadow-soft`} />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{formData.label || 'Naziv nije postavljen'}</div>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                        <Clock size={10} />
                        {formData.startTime} - {formData.endTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Odustani
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.label.trim() || !formData.startTime || !formData.endTime}
                className="px-8 py-2.5 bg-primary-900 text-white rounded-xl shadow-premium hover:scale-105 active:scale-95 transition-all font-bold text-sm disabled:opacity-50 disabled:scale-100"
              >
                {editingShift ? 'Sačuvaj izmjene' : 'Potvrdi kreiranje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
