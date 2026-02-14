// ===========================================
// Shift Handover Component
// Primopredaja smjene - Continuity Log
// ===========================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { Printer, Save, RotateCcw, Check, X, FileText, ArrowLeft, Clock, ArrowRight, ChefHat, Wine } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

// Types from OutOfStock
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
  archived: boolean;
  archivedAt?: number;
}

// Config for rendering
const reasonConfig = {
  nabavka: { label: 'Nabavka', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  kvalitet: { label: 'Kvalitet', color: 'bg-red-100 text-red-700 border-red-200' },
  priprema: { label: 'Priprema', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
};

const sectorConfig = {
  'Kuhinja': { label: 'Kuhinja', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'Bar': { label: 'Bar', color: 'bg-purple-100 text-purple-700 border-purple-200' }
};

interface HandoverEntry {
  id: string;
  date: string;
  fromShift: string;
  fromManager: string;
  toManager: string;
  
  // Finance & Documentation
  reservedTables: string;
  vipArrivals: string;
  cashStatus: string;
  reportSubmitted: boolean;
  otherDocs: string;
  
  // Inventory & Technical
  missingItems: string;
  technicalIssues: string;
  restockNeeded: string;
  inventoryChecked: boolean;
  cleanlinessOk: boolean;
  
  // Key Messages
  specialRequests: string;
  
  // Checklist
  briefingDone: boolean;
  keysHandedOver: boolean;
  posOk: boolean;
  hygieneOk: boolean;
  
  // Signatures
  fromSignature: string;
  toSignature: string;
  createdAt: number;
}

interface ShiftHandoverProps {
  onClose?: () => void;
}

export function ShiftHandover({ onClose }: ShiftHandoverProps) {
  const [entries, setEntries] = useState<HandoverEntry[]>(() => {
    try {
      const stored = localStorage.getItem('shift_handover_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<HandoverEntry>(() => ({
    id: '',
    date: formatDateToId(new Date()),
    fromShift: 'JUTARNJA',
    fromManager: '',
    toManager: '',
    reservedTables: '',
    vipArrivals: '',
    cashStatus: '',
    reportSubmitted: false,
    otherDocs: '',
    missingItems: '',
    technicalIssues: '',
    restockNeeded: '',
    inventoryChecked: false,
    cleanlinessOk: false,
    specialRequests: '',
    briefingDone: false,
    keysHandedOver: false,
    posOk: false,
    hygieneOk: false,
    fromSignature: '',
    toSignature: '',
    createdAt: Date.now(),
  }));
  
  const [isSaved, setIsSaved] = useState(false);
  const [importedMissingItems, setImportedMissingItems] = useState<Array<OutOfStockItem & { sector: string; date: string }>>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Load today's entry if exists
  useEffect(() => {
    const today = formatDateToId(new Date());
    const existing = entries.find(e => e.date === today);
    if (existing) {
      
      setCurrentEntry(existing);
    }
  }, [entries]);

  const handleInputChange = (field: keyof HandoverEntry, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const entry: HandoverEntry = {
      ...currentEntry,
      id: currentEntry.id || `handover-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('shift_handover_entries', JSON.stringify(updated));
    setIsSaved(true);
    
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      fromShift: currentEntry.fromShift === 'JUTARNJA' ? 'VECERNJA' : 'JUTARNJA',
      fromManager: '',
      toManager: '',
      reservedTables: '',
      vipArrivals: '',
      cashStatus: '',
      reportSubmitted: false,
      otherDocs: '',
      missingItems: '',
      technicalIssues: '',
      restockNeeded: '',
      inventoryChecked: false,
      cleanlinessOk: false,
      specialRequests: '',
      briefingDone: false,
      keysHandedOver: false,
      posOk: false,
      hygieneOk: false,
      fromSignature: '',
      toSignature: '',
      createdAt: Date.now(),
    });
    setIsSaved(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Povratak na raspored"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Primopredaja Smjene</h1>
            <p className="text-xs text-slate-500">Shift Handover & Continuity Log</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check size={16} /> Sačuvano
            </span>
          )}
          <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
            <Save size={16} /> Sačuvaj
          </button>
          <button onClick={handleNew} className="btn btn-secondary flex items-center gap-2">
            <RotateCcw size={16} /> Nova
          </button>
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

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
          
          {/* Header - Print Only */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold text-center uppercase">Primopredaja Smjene</h1>
            <p className="text-center text-sm text-slate-500">Shift Handover & Continuity Log</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-3 gap-4 mb-6 print:grid-cols-3">
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Smjena</label>
              <select
                value={currentEntry.fromShift}
                onChange={(e) => handleInputChange('fromShift', e.target.value)}
                className="input"
              >
                <option value="JUTARNJA">Jutarnja (07:00 - 15:00)</option>
                <option value="VECERNJA">Večernja (15:00 - 23:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Menadžer</label>
              <input
                type="text"
                value={currentEntry.fromManager}
                onChange={(e) => handleInputChange('fromManager', e.target.value)}
                placeholder="Ime i prezime"
                className="input"
              />
            </div>
          </div>

          {/* Sections - Stacked */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            
            {/* Inventory & Technical - FIRST */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={16} /> Inventar i Tehnika
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-slate-600 font-medium">Nedostajući artikli (86)</label>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const stored = localStorage.getItem('outofstock_entries');
                          if (stored) {
                            const allEntries: OutOfStockEntry[] = JSON.parse(stored);
                            // Get all non-archived items with full info for cards
                            const activeItems = allEntries
                              .filter((e: OutOfStockEntry) => !e.archived && e.items)
                              .flatMap((e: OutOfStockEntry) => 
                                e.items
                                  .filter((it: OutOfStockItem) => it.item && it.item.trim())
                                  .map((it: OutOfStockItem) => ({
                                    ...it,
                                    sector: e.sector,
                                    date: e.date
                                  }))
                              );
                            
                            if (activeItems.length > 0) {
                              setImportedMissingItems(activeItems);
                              // Also update the text field for backward compatibility
                              const itemsStr = activeItems.map((it: OutOfStockItem & { sector: string; date: string }) => {
                                return `${it.item} [${it.date}] (${it.sector})`;
                              }).join('\n');
                              handleInputChange('missingItems', itemsStr);
                            } else {
                              alert('Nema aktivnih nedostajućih artikala. Svi su arhivirani ili nema unesenih artikala.');
                            }
                          }
                        } catch (e) {
                          console.error('Error loading outofstock:', e);
                          alert('Greška pri učitavanju artikala.');
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded"
                    >
                      +86 Uvezi artikle
                    </button>
                  </div>
                  
                  {/* Cards umjesto textarea */}
                  {importedMissingItems.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {importedMissingItems.map((item, idx) => {
                        const sectorInfo = sectorConfig[item.sector as keyof typeof sectorConfig] || { label: item.sector, color: 'bg-slate-100 text-slate-700' };
                        const reasonInfo = reasonConfig[item.reason] || reasonConfig.nabavka;
                        
                        return (
                          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${sectorInfo.color}`}>
                                {item.sector}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${reasonInfo.color}`}>
                                {reasonInfo.label}
                              </span>
                              <span className="text-xs text-slate-400">{item.date}</span>
                              {item.time86 && <span className="text-xs text-slate-400">@ {item.time86}</span>}
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1">{item.item}</h4>
                            {item.alternative && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <ArrowRight size={14} />
                                <span className="font-medium">Zamjena:</span>
                                <span>{item.alternative}</span>
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">
                                <span className="font-medium">Napomena:</span> {item.notes}
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
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 bg-slate-50 p-4 rounded-lg text-center">
                      Klikni "+86 Uvezi artikle" za prikaz nedostajućih artikala
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tehnički kvarovi</label>
                  <input
                    type="text"
                    value={currentEntry.technicalIssues}
                    onChange={(e) => handleInputChange('technicalIssues', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Potrebna dopuna (Bar/Kuhinja)</label>
                  <input
                    type="text"
                    value={currentEntry.restockNeeded}
                    onChange={(e) => handleInputChange('restockNeeded', e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inventoryChecked"
                    checked={currentEntry.inventoryChecked}
                    onChange={(e) => handleInputChange('inventoryChecked', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="inventoryChecked" className="text-sm">Provjera sitnog inventara</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cleanlinessOk"
                    checked={currentEntry.cleanlinessOk}
                    onChange={(e) => handleInputChange('cleanlinessOk', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="cleanlinessOk" className="text-sm">Čistoća radnih stanica</label>
                </div>
              </div>
            </div>

            {/* Finance & Documentation - SECOND */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={16} /> Finansije i Dokumentacija
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Rezervisani stolovi</label>
                  <input
                    type="text"
                    value={currentEntry.reservedTables}
                    onChange={(e) => handleInputChange('reservedTables', e.target.value)}
                    className="input"
                    placeholder="npr. Stolovi 5, 7, 12"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">VIP dolasci / Sobe</label>
                  <input
                    type="text"
                    value={currentEntry.vipArrivals}
                    onChange={(e) => handleInputChange('vipArrivals', e.target.value)}
                    className="input"
                    placeholder="npr. Gost X, Soba 205"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Stanje kase (Depozit)</label>
                  <input
                    type="text"
                    value={currentEntry.cashStatus}
                    onChange={(e) => handleInputChange('cashStatus', e.target.value)}
                    className="input"
                    placeholder="€ iznos"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reportSubmitted"
                    checked={currentEntry.reportSubmitted}
                    onChange={(e) => handleInputChange('reportSubmitted', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="reportSubmitted" className="text-sm">Izvještaj kase predat</label>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Ostala dokumentacija</label>
                  <input
                    type="text"
                    value={currentEntry.otherDocs}
                    onChange={(e) => handleInputChange('otherDocs', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Messages - Full Width */}
          <div className="border border-slate-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={16} /> Ključne poruke i specijalni zahtjevi
            </h3>
            <textarea
              value={currentEntry.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Unesite specifične zahtjeve gostiju, eventualna kašnjenja ili važne napomene..."
            />
          </div>

          {/* Checklist */}
          <div className="border border-slate-200 rounded-lg p-4 mb-6 bg-slate-50 print:bg-white">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Check size={16} /> Potvrda primopredaje
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'briefingDone' as const, label: 'Brifing završen' },
                { key: 'keysHandedOver' as const, label: 'Ključevi predati' },
                { key: 'posOk' as const, label: 'POS sistem OK' },
                { key: 'hygieneOk' as const, label: 'Higijena OK' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={currentEntry[item.key]}
                    onChange={(e) => handleInputChange(item.key, e.target.checked)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 print:border-t-2 print:border-black">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Predao (odlazeća smjena)</label>
              <input
                type="text"
                value={currentEntry.fromSignature}
                onChange={(e) => handleInputChange('fromSignature', e.target.value)}
                placeholder="Potpis"
                className="input mb-1"
              />
              <p className="text-xs text-slate-400">Ime i prezime</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primio (dolazeća smjena)</label>
              <input
                type="text"
                value={currentEntry.toSignature}
                onChange={(e) => handleInputChange('toSignature', e.target.value)}
                placeholder="Potpis"
                className="input mb-1"
              />
              <p className="text-xs text-slate-400">Ime i prezime</p>
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-6 text-center text-xs text-slate-400">
            Generisano putem RestoHub - {formatDateToId(new Date())}
          </div>
        </div>

        {/* History */}
        {entries.length > 1 && (
          <div className="mt-6 max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodne primopredaje</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">Smjena {entry.fromShift}</span>
                    <span className="text-sm text-slate-600">{entry.fromManager}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {entry.briefingDone && entry.keysHandedOver && entry.posOk && entry.hygieneOk ? '✓ Kompletno' : '⚠ Nepotpun'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-t-2 { border-top-width: 2px !important; }
          .print\\:border-black { border-color: black !important; }
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
