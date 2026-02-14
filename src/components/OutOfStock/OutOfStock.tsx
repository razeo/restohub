// ===========================================
// Out of Stock List (Lista 86) - REDESIGNED
// Dnevni izvještaj o nedostupnim artiklima
// ===========================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { Printer, Save, Check, X, AlertTriangle, ArrowLeft, Pencil, Plus, Trash2, Search, ChefHat, Wine, Clock, ArrowRight } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface OutOfStockItem {
  id: number;
  item: string;
  reason: 'nabavka' | 'kvalitet' | 'priprema';
  alternative: string;
  time86: string;
  returnTime: string;
  notes: string;
}

interface OutOfStockEntry {
  id: string;
  date: string;
  sector: string;
  responsible: string;
  items: OutOfStockItem[];
  briefingDone: boolean;
  fohInformed: boolean;
  barInformed: boolean;
  posUpdated: boolean;
  notes: string;
  kitchenSignature: string;
  managerSignature: string;
  createdAt: number;
  archived: boolean;
  archivedAt?: number;
}

interface OutOfStockProps {
  onClose?: () => void;
}

const emptyItem = (): OutOfStockItem => ({
  id: Date.now() + Math.random(),
  item: '',
  reason: 'nabavka',
  alternative: '',
  time86: formatDateToId(new Date()).split('T')[1]?.slice(0,5) || '',
  returnTime: '',
  notes: ''
});

const emptyEntry = (): OutOfStockEntry => ({
  id: '',
  date: formatDateToId(new Date()),
  sector: '',
  responsible: '',
  items: [],
  briefingDone: false,
  fohInformed: false,
  barInformed: false,
  posUpdated: false,
  notes: '',
  kitchenSignature: '',
  managerSignature: '',
  createdAt: Date.now(),
  archived: false,
});

const reasonConfig = {
  nabavka: { label: 'Nabavka', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  kvalitet: { label: 'Kvalitet', color: 'bg-red-100 text-red-700 border-red-200' },
  priprema: { label: 'Priprema', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
};

const sectorConfig = {
  'Kuhinja': { icon: ChefHat, color: 'bg-orange-100 text-orange-700' },
  'Bar': { icon: Wine, color: 'bg-purple-100 text-purple-700' }
};

export function OutOfStock({ onClose }: OutOfStockProps) {
  const [entries, setEntries] = useState<OutOfStockEntry[]>(() => {
    try {
      const stored = localStorage.getItem('outofstock_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* Ignore */ }
    return [];
  });

  const [currentEntry, setCurrentEntry] = useState<OutOfStockEntry>(emptyEntry());
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [quickAddSector, setQuickAddSector] = useState<'Kuhinja' | 'Bar'>('Kuhinja');
  const [quickAddItem, setQuickAddItem] = useState('');
  const [quickAddReason, setQuickAddReason] = useState<'nabavka' | 'kvalitet' | 'priprema'>('nabavka');
  const [quickAddAlt, setQuickAddAlt] = useState('');
  const [quickAddNotes, setQuickAddNotes] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Get all active items from all entries
  const allActiveItems = useMemo(() => {
    const items: Array<OutOfStockItem & { sector: string; date: string; entryId: string }> = [];
    entries
      .filter(e => !e.archived)
      .forEach(entry => {
        entry.items.forEach(item => {
          if (item.item && item.item.trim()) {
            items.push({ ...item, sector: entry.sector, date: entry.date, entryId: entry.id });
          }
        });
      });
    return items;
  }, [entries]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allActiveItems.filter(item => {
      const matchesSearch = !searchQuery || 
        item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alternative?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = filterSector === 'all' || item.sector === filterSector;
      return matchesSearch && matchesSector;
    });
  }, [allActiveItems, searchQuery, filterSector]);

  // Stats
  const stats = useMemo(() => ({
    active: allActiveItems.length,
    kitchen: allActiveItems.filter(i => i.sector === 'Kuhinja').length,
    bar: allActiveItems.filter(i => i.sector === 'Bar').length,
  }), [allActiveItems]);

  // Auto-load today's entry
  useEffect(() => {
    const today = formatDateToId(new Date()).split('T')[0];
    const existing = entries.find(e => e.date === today);
    if (existing) {
      setCurrentEntry(existing);
    }
  }, [entries]);

  const handleInputChange = (field: keyof OutOfStockEntry, value: string | boolean) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const entry: OutOfStockEntry = {
      ...currentEntry,
      id: currentEntry.id || `oos-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.id !== entry.id);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    setIsSaved(true);
    setShowModal(false);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry(emptyEntry());
    setModalMode('new');
    setShowModal(true);
  };

  const handleEdit = (entry: OutOfStockEntry) => {
    setCurrentEntry({ ...entry });
    setModalMode('edit');
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleArchive = () => {
    if (!confirm('Da li želite arhivirati sve aktivne nedostajuće artikle?')) {
      return;
    }
    
    const updated = entries.map(entry => ({
      ...entry,
      archived: true,
      archivedAt: Date.now(),
    }));
    
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    setCurrentEntry(emptyEntry());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleQuickAdd = () => {
    if (!quickAddItem.trim()) {
      alert('Unesite naziv artikla');
      return;
    }

    const today = formatDateToId(new Date()).split('T')[0];
    
    // Find or create today's entry for this sector
    let entry = entries.find(e => e.date === today && e.sector === quickAddSector && !e.archived);
    
    if (entry) {
      // Add item to existing entry
      entry = {
        ...entry,
        items: [...entry.items, { 
          ...emptyItem(), 
          item: quickAddItem, 
          reason: quickAddReason, 
          alternative: quickAddAlt,
          notes: quickAddNotes,
          time86: new Date().toTimeString().slice(0,5)
        }]
      };
    } else {
      // Create new entry
      entry = {
        ...emptyEntry(),
        id: `oos-${Date.now()}`,
        date: today,
        sector: quickAddSector,
        items: [{
          ...emptyItem(),
          item: quickAddItem,
          reason: quickAddReason,
          alternative: quickAddAlt,
          notes: quickAddNotes,
          time86: new Date().toTimeString().slice(0,5)
        }]
      };
    }

    // Update entries
    const updated = entries.filter(e => e.id !== entry!.id);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    
    // Reset quick add form
    setQuickAddItem('');
    setQuickAddAlt('');
    setQuickAddNotes('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleResolve = (item: OutOfStockItem & { sector: string; date: string; entryId: string }) => {
    if (!confirm(`Označiti "${item.item}" kao riješeno? Cijela lista će biti arhivirana.`)) return;

    const entry = entries.find(e => e.id === item.entryId);
    if (!entry) return;

    // Archive the whole entry with ALL items (keep them for history)
    const updated = entries.map(e => 
      e.id === entry.id ? { ...e, archived: true, archivedAt: Date.now() } : e
    );
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleArchiveItem = (item: OutOfStockItem & { sector: string; date: string; entryId: string }) => {
    if (!confirm(`Arhivirati "${item.item}"? Cijela lista će biti arhivirana sa svim artiklima.`)) return;

    const entry = entries.find(e => e.id === item.entryId);
    if (!entry) return;

    // Archive the whole entry with ALL items (keep them, don't remove)
    const updated = entries.map(e => 
      e.id === entry.id ? { ...e, archived: true, archivedAt: Date.now() } : e
    );
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleDeleteArchived = (entryId: string) => {
    if (!confirm('Da li želite OBRISATI ovu arhivu? Ovo je nepovratno.')) return;
    
    const updated = entries.filter(e => e.id !== entryId);
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleDeleteAllArchived = () => {
    if (!confirm('Da li želite OBRISATI SVE arhivirane liste? Ovo je nepovratno!')) return;
    
    const updated = entries.filter(e => !e.archived);
    setEntries(updated);
    localStorage.setItem('outofstock_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const getTimeUntilReturn = (returnTime: string) => {
    if (!returnTime) return null;
    const [hours, minutes] = returnTime.split(':').map(Number);
    const returnDate = new Date();
    returnDate.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const diffMs = returnDate.getTime() - now.getTime();
    if (diffMs < 0) return { text: 'Proslo', color: 'text-red-600' };
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hoursLeft > 0) return { text: `${hoursLeft}h ${minutesLeft}m`, color: 'text-green-600' };
    return { text: `${minutesLeft}min`, color: 'text-yellow-600' };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Lista 86</h1>
            <p className="text-xs text-slate-500">Nedostupni artikli</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check size={16} /> Sačuvano
            </span>
          )}
          <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
            <Printer size={16} /> Štampa
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.active}</div>
            <div className="text-xs text-slate-500">Aktivno</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.kitchen}</div>
            <div className="text-xs text-slate-500">Kuhinja</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.bar}</div>
            <div className="text-xs text-slate-500">Bar</div>
          </div>
        </div>

        {/* Quick Add */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Plus size={16} /> Brzo dodavanje
          </h3>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex gap-1">
              <button
                onClick={() => setQuickAddSector('Kuhinja')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                  quickAddSector === 'Kuhinja' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <ChefHat size={14} /> Kuhinja
              </button>
              <button
                onClick={() => setQuickAddSector('Bar')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                  quickAddSector === 'Bar' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Wine size={14} /> Bar
              </button>
            </div>
            <input
              type="text"
              value={quickAddItem}
              onChange={(e) => setQuickAddItem(e.target.value)}
              placeholder="Naziv artikla..."
              className="input flex-1 min-w-[150px]"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <select
              value={quickAddReason}
              onChange={(e) => setQuickAddReason(e.target.value as any)}
              className="input w-32"
            >
              <option value="nabavka">Nabavka</option>
              <option value="kvalitet">Kvalitet</option>
              <option value="priprema">Priprema</option>
            </select>
            <input
              type="text"
              value={quickAddAlt}
              onChange={(e) => setQuickAddAlt(e.target.value)}
              placeholder="Zamjena..."
              className="input flex-1 min-w-[150px]"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <input
              type="text"
              value={quickAddNotes}
              onChange={(e) => setQuickAddNotes(e.target.value)}
              placeholder="Napomena..."
              className="input flex-1 min-w-[150px]"
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <button onClick={handleQuickAdd} className="btn btn-primary flex items-center gap-2">
              <Plus size={16} /> Dodaj
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pretraga artikala..."
              className="input pl-9"
            />
          </div>
          <button
            onClick={() => setFilterSector('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              filterSector === 'all' 
                ? 'bg-slate-800 text-white' 
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Svi
          </button>
          <button
            onClick={() => setFilterSector('Kuhinja')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
              filterSector === 'Kuhinja' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            <ChefHat size={14} /> Kuhinja
          </button>
          <button
            onClick={() => setFilterSector('Bar')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
              filterSector === 'Bar' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            <Wine size={14} /> Bar
          </button>
        </div>

        {/* Items List - Cards */}
        <div ref={printRef} className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <Check size={48} className="mx-auto text-green-500 mb-3" />
              <p className="text-slate-600 font-medium">Nema aktivnih artikala na listi 86</p>
              <p className="text-slate-400 text-sm">Svi artikli su dostupni ili arhivirani</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const sectorInfo = sectorConfig[item.sector as keyof typeof sectorConfig];
              const reasonInfo = reasonConfig[item.reason];
              const timeInfo = getTimeUntilReturn(item.returnTime);
              
              return (
                <div 
                  key={`${item.entryId}-${item.id}-${idx}`}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {sectorInfo && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${sectorInfo.color}`}>
                            {(() => {
                              const Icon = sectorInfo.icon;
                              return <Icon size={12} />;
                            })()} {item.sector}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${reasonInfo.color}`}>
                          {reasonInfo.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          <Clock size={12} className="inline" /> {item.time86 || '-'}
                        </span>
                        {timeInfo && (
                          <span className={`text-xs font-medium ${timeInfo.color}`}>
                            {timeInfo.text}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{item.item}</h4>
                      
                      {item.alternative && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <ArrowRight size={14} />
                          <span className="font-medium">Zamjena:</span>
                          <span>{item.alternative}</span>
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="font-medium">Napomena:</span> {item.notes}
                        </div>
                      )}
                      
                      {item.returnTime && (
                        <div className="text-xs text-slate-500 mt-1">
                          Povratak: {item.returnTime}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleResolve(item)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1"
                      >
                        <Check size={14} /> Riješeno
                      </button>
                      <button
                        onClick={() => handleArchiveItem(item)}
                        className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 flex items-center gap-1"
                        title="Arhiviraj bez rješavanja"
                      >
                        <Trash2 size={14} /> Arhiva
                      </button>
                      <button
                        onClick={() => {
                          const entry = entries.find(e => e.id === item.entryId);
                          if (entry) handleEdit(entry);
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-1"
                      >
                        <Pencil size={14} /> Uredi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Archive Section */}
        {entries.filter(e => e.archived).length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Trash2 size={16} /> Arhiva ({entries.filter(e => e.archived).length})
              </h3>
              <button
                onClick={handleDeleteAllArchived}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <Trash2 size={14} /> Obriši sve
              </button>
            </div>
            <div className="space-y-2 opacity-75">
              {entries.filter(e => e.archived).slice(0, 20).map((entry, idx) => {
                const sectorInfo = sectorConfig[entry.sector as keyof typeof sectorConfig];
                return (
                  <details key={entry.id || idx} className="group">
                    <summary className="cursor-pointer bg-slate-50 rounded-lg border border-slate-200 p-3 text-sm flex items-center justify-between hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        {sectorInfo && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${sectorInfo.color}`}>
                            {(() => { const Icon = sectorInfo.icon; return <Icon size={12} />; })()} {entry.sector}
                          </span>
                        )}
                        <span className="font-medium">{entry.date}</span>
                        <span className="text-slate-400">{entry.items.length} artikala</span>
                        {entry.responsible && <span className="text-slate-500">| {entry.responsible}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteArchived(entry.id); }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Obriši arhivu"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-slate-400 group-open:rotate-90 transition-transform">▶</span>
                      </div>
                    </summary>
                    {/* Kartica sa artiklima */}
                    <div className="mt-2 space-y-2 pl-2">
                      {entry.items && entry.items.map((item, itemIdx) => {
                        const reasonInfo = reasonConfig[item.reason] || reasonConfig.nabavka;
                        return (
                          <div key={item.id || itemIdx} className="bg-white rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${reasonInfo.color}`}>
                                {reasonInfo.label}
                              </span>
                              {item.time86 && <span className="text-xs text-slate-400">@ {item.time86}</span>}
                            </div>
                            <h4 className="font-medium text-slate-800">{item.item}</h4>
                            {item.alternative && (
                              <div className="text-sm text-green-600 mt-1">
                                → Zamjena: {item.alternative}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">
                                Napomena: {item.notes}
                              </div>
                            )}
                            {item.returnTime && (
                              <div className="text-xs text-slate-500 mt-1">
                                Povratak: {item.returnTime}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {(!entry.items || entry.items.length === 0) && (
                        <div className="text-sm text-slate-400 p-2">Nema artikala</div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Full Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {modalMode === 'new' ? 'Nova lista 86' : 'Uredi listu'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Datum</label>
                  <input
                    type="date"
                    value={currentEntry.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sektor</label>
                  <select
                    value={currentEntry.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className="input"
                  >
                    <option value="">Odaberite...</option>
                    <option value="Kuhinja">Kuhinja</option>
                    <option value="Bar">Bar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Odgovorno lice</label>
                  <input
                    type="text"
                    value={currentEntry.responsible}
                    onChange={(e) => handleInputChange('responsible', e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Items in Modal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Artikli</label>
                  <button
                    onClick={() => setCurrentEntry(prev => ({ ...prev, items: [...prev.items, emptyItem()] }))}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus size={14} /> Dodaj artikal
                  </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {currentEntry.items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => {
                              const newItems = [...currentEntry.items];
                              newItems[idx].item = e.target.value;
                              setCurrentEntry(prev => ({ ...prev, items: newItems }));
                            }}
                            placeholder="Naziv artikla"
                            className="input text-sm"
                          />
                          <div className="flex gap-2">
                            <select
                              value={item.reason}
                              onChange={(e) => {
                                const newItems = [...currentEntry.items];
                                newItems[idx].reason = e.target.value as OutOfStockItem['reason'];
                                setCurrentEntry(prev => ({ ...prev, items: newItems }));
                              }}
                              className="input text-sm w-32"
                            >
                              <option value="nabavka">Nabavka</option>
                              <option value="kvalitet">Kvalitet</option>
                              <option value="priprema">Priprema</option>
                            </select>
                            <input
                              type="text"
                              value={item.alternative}
                              onChange={(e) => {
                                const newItems = [...currentEntry.items];
                                newItems[idx].alternative = e.target.value;
                                setCurrentEntry(prev => ({ ...prev, items: newItems }));
                              }}
                              placeholder="Zamjena"
                              className="input text-sm flex-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs text-slate-500">Vrijeme 86</label>
                              <input
                                type="time"
                                value={item.time86}
                                onChange={(e) => {
                                  const newItems = [...currentEntry.items];
                                  newItems[idx].time86 = e.target.value;
                                  setCurrentEntry(prev => ({ ...prev, items: newItems }));
                                }}
                                className="input text-sm w-full"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-slate-500">Povratak</label>
                              <input
                                type="time"
                                value={item.returnTime}
                                onChange={(e) => {
                                  const newItems = [...currentEntry.items];
                                  newItems[idx].returnTime = e.target.value;
                                  setCurrentEntry(prev => ({ ...prev, items: newItems }));
                                }}
                                className="input text-sm w-full"
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <label className="text-xs text-slate-500">Napomena</label>
                            <textarea
                              value={item.notes || ''}
                              onChange={(e) => {
                                const newItems = [...currentEntry.items];
                                newItems[idx].notes = e.target.value;
                                setCurrentEntry(prev => ({ ...prev, items: newItems }));
                              }}
                              placeholder="Dodatna napomena..."
                              className="input text-sm min-h-[80px] resize-none"
                            />
                          </div>
                        </div>
                        {currentEntry.items.length > 1 && (
                          <button
                            onClick={() => {
                              const newItems = currentEntry.items.filter((_, i) => i !== idx);
                              setCurrentEntry(prev => ({ ...prev, items: newItems }));
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Napomene</label>
                <textarea
                  value={currentEntry.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="input min-h-[60px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Šef kuhinje/šanka</label>
                  <input
                    type="text"
                    value={currentEntry.kitchenSignature}
                    onChange={(e) => handleInputChange('kitchenSignature', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Menadžer smjene</label>
                  <input
                    type="text"
                    value={currentEntry.managerSignature}
                    onChange={(e) => handleInputChange('managerSignature', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Odustani
              </button>
              <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                <Save size={16} /> Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
