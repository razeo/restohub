import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Duty, Zone, SpecialDuty } from '../../types';

interface DutyAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dutyIds: string[], zoneIds: string[], specialDutyIds: string[]) => void;
  duties: Duty[];
  zones: Zone[];
  specialDuties: SpecialDuty[];
  employeeName: string;
  shiftLabel: string;
  initialDutyIds?: string[];
  initialZoneIds?: string[];
  initialSpecialDutyIds?: string[];
}

export function DutyAssignmentModal({
  isOpen,
  onClose,
  onConfirm,
  duties,
  zones,
  specialDuties,
  employeeName,
  shiftLabel,
  initialDutyIds = [],
  initialZoneIds = [],
  initialSpecialDutyIds = [],
}: DutyAssignmentModalProps) {
    // Keep track of selections locally
  const [selectedDutyIds, setSelectedDutyIds] = useState<Set<string>>(new Set(initialDutyIds));
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<string>>(new Set(initialZoneIds));
  const [selectedSpecialDutyIds, setSelectedSpecialDutyIds] = useState<Set<string>>(new Set(initialSpecialDutyIds));

  // Reset state when modal opens/changes
  React.useEffect(() => {
    setSelectedDutyIds(new Set(initialDutyIds));
    setSelectedZoneIds(new Set(initialZoneIds));
    setSelectedSpecialDutyIds(new Set(initialSpecialDutyIds));
  }, [initialDutyIds, initialZoneIds, initialSpecialDutyIds, isOpen]);


  if (!isOpen) return null;

  const toggleItem = (id: string, _set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(
        Array.from(selectedDutyIds),
        Array.from(selectedZoneIds),
        Array.from(selectedSpecialDutyIds)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dodjela Zaduženja</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {employeeName} • {shiftLabel}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Duties Section */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dužnosti</h3>
            <div className="flex flex-wrap gap-2">
              {duties.map(duty => {
                const isSelected = selectedDutyIds.has(duty.id);
                return (
                  <button
                    key={duty.id}
                    onClick={() => toggleItem(duty.id, selectedDutyIds, setSelectedDutyIds)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border
                      ${isSelected 
                        ? 'border-transparent text-white shadow-sm' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                      }
                    `}
                    style={{ 
                        backgroundColor: isSelected ? duty.color : undefined,
                     }}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                    {duty.label}
                  </button>
                );
              })}
              {duties.length === 0 && <span className="text-sm text-gray-400 italic">Nema definisanih dužnosti</span>}
            </div>
          </section>

          {/* Zones Section */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Reoni</h3>
            <div className="flex flex-wrap gap-2">
                {zones.map(zone => {
                    const isSelected = selectedZoneIds.has(zone.id);
                    return (
                        <button
                            key={zone.id}
                            onClick={() => toggleItem(zone.id, selectedZoneIds, setSelectedZoneIds)}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border
                              ${isSelected 
                                ? 'border-transparent text-white shadow-sm' 
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                              }
                            `}
                            style={{ 
                                backgroundColor: isSelected ? zone.color : undefined,
                             }}
                        >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                             {zone.label}
                        </button>
                    )
                })}
                 {zones.length === 0 && <span className="text-sm text-gray-400 italic">Nema definisanih reona</span>}
            </div>
          </section>
          
          {/* Special Duties Section */}
           <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Posebne Dužnosti</h3>
            <div className="flex flex-wrap gap-2">
                {specialDuties.map(sd => {
                    const isSelected = selectedSpecialDutyIds.has(sd.id);
                    return (
                        <button
                            key={sd.id}
                            onClick={() => toggleItem(sd.id, selectedSpecialDutyIds, setSelectedSpecialDutyIds)}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border
                              ${isSelected 
                                ? 'border-transparent text-white shadow-sm' 
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                              }
                            `}
                            style={{ 
                                backgroundColor: isSelected ? sd.color : undefined,
                             }}
                        >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                             {sd.label}
                        </button>
                    )
                })}
                 {specialDuties.length === 0 && <span className="text-sm text-gray-400 italic">Nema definisanih posebnih dužnosti</span>}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Otkaži
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-xl transition-all active:scale-95"
          >
            Potvrdi Dodjelu
          </button>
        </div>
      </div>
    </div>
  );
}
