// ===========================================
// Templates Page Component
// CRUD for shift templates
// ===========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Copy, 
  Calendar, Clock, Users, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ShiftTemplate, Shift, DayOfWeek, Role } from '../../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';
import { generateId } from '../../utils/id';
import { DEFAULT_TEMPLATES } from '../../data/initialData';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>(() =>
    getStorageItem(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);

  // Initialize storage with defaults if empty
  useEffect(() => {
    if (templates.length === 0) {
      setTemplates(DEFAULT_TEMPLATES);
      setStorageItem(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
    }
  }, [templates.length]);

  const saveTemplates = (newTemplates: ShiftTemplate[]) => {
    setTemplates(newTemplates);
    setStorageItem(STORAGE_KEYS.TEMPLATES, newTemplates);
  };

  const handleCreateTemplate = () => {
    const newTemplate: ShiftTemplate = {
      id: `tpl-${generateId()}`,
      name: 'Novi šablon',
      description: '',
      shifts: [],
      createdAt: Date.now(),
    };
    setEditingTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleEditTemplate = (template: ShiftTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Da li ste sigurni da želite obrisati ovaj šablon?')) {
      const newTemplates = templates.filter(t => t.id !== id);
      saveTemplates(newTemplates);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      toast.success('Šablon obrisan');
    }
  };

  const handleDuplicateTemplate = (template: ShiftTemplate) => {
    const duplicate: ShiftTemplate = {
      ...template,
      id: `tpl-${generateId()}`,
      name: `${template.name} (kopija)`,
      createdAt: Date.now(),
    };
    const newTemplates = [...templates, duplicate];
    saveTemplates(newTemplates);
    toast.success('Šablon kopiran');
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name.trim()) {
      toast.error('Naziv šablona je obavezan');
      return;
    }

    const existingIndex = templates.findIndex(t => t.id === editingTemplate.id);
    let newTemplates: ShiftTemplate[];

    if (existingIndex >= 0) {
      newTemplates = [...templates];
      newTemplates[existingIndex] = editingTemplate;
    } else {
      newTemplates = [...templates, editingTemplate];
    }

    saveTemplates(newTemplates);
    setIsEditing(false);
    setEditingTemplate(null);
    toast.success(editingTemplate.id.startsWith('tpl-') ? 'Šablon kreiran' : 'Šablon ažuriran');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleAddShiftToTemplate = () => {
    if (!editingTemplate) return;

    const newShift: Shift = {
      id: `sh-${generateId()}`,
      day: DayOfWeek.MONDAY,
      startTime: '08:00',
      endTime: '16:00',
      label: 'Nova smjena',
    };

    setEditingTemplate({
      ...editingTemplate,
      shifts: [...editingTemplate.shifts, newShift],
    });
  };

  const handleUpdateShift = (shiftId: string, updates: Partial<Shift>) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      shifts: editingTemplate.shifts.map(s =>
        s.id === shiftId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleRemoveShift = (shiftId: string) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      shifts: editingTemplate.shifts.filter(s => s.id !== shiftId),
    });
  };

  // Render template list
  const renderTemplateList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Šabloni rasporeda</h2>
          <p className="text-sm text-slate-500">Sačuvani šabloni za brzo kreiranje rasporeda</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Novi šablon
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Nema kreiranih šablona</p>
          <button
            onClick={handleCreateTemplate}
            className="btn btn-primary"
          >
            Kreiraj prvi šablon
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(template.createdAt).toLocaleDateString('hr-HR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {template.shifts.length} smjena
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Kopiraj"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Uredi"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Obriši"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render editor
  const renderEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {editingTemplate?.id.startsWith('tpl-') ? 'Novi šablon' : 'Uredi šablon'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancelEdit}
            className="btn btn-secondary flex items-center gap-2"
          >
            <X size={18} />
            Odustani
          </button>
          <button
            onClick={handleSaveTemplate}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            Sačuvaj
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Naziv šablona *
            </label>
            <input
              type="text"
              value={editingTemplate?.name || ''}
              onChange={(e) => setEditingTemplate(
                editingTemplate ? { ...editingTemplate, name: e.target.value } : null
              )}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Unesite naziv..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Opis
            </label>
            <input
              type="text"
              value={editingTemplate?.description || ''}
              onChange={(e) => setEditingTemplate(
                editingTemplate ? { ...editingTemplate, description: e.target.value } : null
              )}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Opis šablona..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Smjene u šablonu</h3>
          <button
            onClick={handleAddShiftToTemplate}
            className="btn btn-secondary text-sm flex items-center gap-1"
          >
            <Plus size={14} />
            Dodaj smjenu
          </button>
        </div>

        {editingTemplate?.shifts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock size={32} className="mx-auto mb-2" />
            <p>Nema smjena u ovom šablonu</p>
          </div>
        ) : (
          <div className="space-y-2">
            {editingTemplate?.shifts.map((shift, index) => (
              <div
                key={shift.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-500 w-8">
                  #{index + 1}
                </span>
                <select
                  value={shift.day}
                  onChange={(e) => handleUpdateShift(shift.id, { 
                    day: e.target.value as DayOfWeek 
                  })}
                  className="px-2 py-1 border border-slate-300 rounded text-sm"
                >
                  {Object.values(DayOfWeek).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={shift.label}
                  onChange={(e) => handleUpdateShift(shift.id, { 
                    label: e.target.value 
                  })}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                  placeholder="Naziv smjene"
                />
                <input
                  type="time"
                  value={shift.startTime}
                  onChange={(e) => handleUpdateShift(shift.id, { 
                    startTime: e.target.value 
                  })}
                  className="px-2 py-1 border border-slate-300 rounded text-sm"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="time"
                  value={shift.endTime}
                  onChange={(e) => handleUpdateShift(shift.id, { 
                    endTime: e.target.value 
                  })}
                  className="px-2 py-1 border border-slate-300 rounded text-sm"
                />
                <button
                  onClick={() => handleRemoveShift(shift.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-slate-100 p-6 overflow-auto">
      {isEditing && editingTemplate ? renderEditor() : renderTemplateList()}
    </div>
  );
}

export default TemplatesPage;
