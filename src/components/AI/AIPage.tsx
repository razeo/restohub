// ===========================================
// AI Page Component
// AI rules management
// ===========================================

import React, { useState, useEffect } from 'react';
import { 
  Bot, Save, X, RefreshCw, 
  Lightbulb, Settings, Trash2, Plus,
  FileText, Sparkles, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';
import { DEFAULT_AI_RULES } from '../../data/initialData';
import { processScheduleRequest, isAiConfigured } from '../../services/ai';

interface AIRule {
  id: string;
  text: string;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface AIResponse {
  success: boolean;
  message: string;
  generatedSchedule?: string;
}

export function AIPage() {
  const [rules, setRules] = useState<string>(() =>
    getStorageItem(STORAGE_KEYS.AI_RULES, DEFAULT_AI_RULES)
  );
  const [parsedRules, setParsedRules] = useState<AIRule[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<AIResponse | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(isAiConfigured());
  const [isEditing, setIsEditing] = useState(false);

  // Parse rules from text
  useEffect(() => {
    const lines = rules.split('\n').filter(line => line.trim());
    const parsed: AIRule[] = lines.map((line, index) => ({
      id: `rule-${index}`,
      text: line.replace(/^[•\-\*]\s*/, '').trim(),
      enabled: true,
      priority: 'medium',
    }));
    setParsedRules(parsed);
  }, [rules]);

  const handleSaveRules = () => {
    setStorageItem(STORAGE_KEYS.AI_RULES, rules);
    setIsEditing(false);
    toast.success('AI pravila sačuvana');
  };

  const handleTestRules = async () => {
    if (!isAiConfigured()) {
      toast.error('API ključ nije podešen. Dodajte VITE_GROQ_API_KEY u .env.local');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await processScheduleRequest(
        'Testiraj pravila - generiši raspored za sljedeću sedmicu',
        {
          employees: [],
          shifts: [],
          assignments: [],
          duties: [],
          currentWeekId: '2024-W01',
          aiRules: rules,
        }
      );

      setTestResult({
        success: true,
        message: response.message,
      });
      toast.success('Test završen');
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Nepoznata greška',
      });
      toast.error('Test neuspješan');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearRules = () => {
    if (window.confirm('Da li ste sigurni da želite resetovati pravila na podrazumijevane?')) {
      setRules(DEFAULT_AI_RULES);
      setStorageItem(STORAGE_KEYS.AI_RULES, DEFAULT_AI_RULES);
      toast.success('Pravila resetovana');
    }
  };

  const handleAddRule = () => {
    setRules(prev => prev + '\n• Nova pravilo');
  };

  const handleRemoveRule = (index: number) => {
    const lines = rules.split('\n').filter(line => line.trim());
    lines.splice(index, 1);
    setRules(lines.join('\n'));
  };

  // Render rules editor
  const renderRulesEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Uređivanje pravila</h2>
          <p className="text-sm text-slate-500">Unesite pravila za AI generisanje rasporeda</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <X size={18} />
            Odustani
          </button>
          <button
            onClick={handleSaveRules}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            Sačuvaj
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          AI Pravila
        </label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          placeholder="Unesite pravila za AI generisanje rasporeda..."
        />
        <p className="text-xs text-slate-400 mt-2">
          Koristite •, -, ili * za početak svakog pravila. Svako pravilo u novom redu.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Lightbulb size={18} />
          Savjeti za pisanje pravila
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Budite specifični: "Svaki kuvar ima max 4 smjene sedmično"</li>
          <li>• Definirajte dostupnost: "Petar radi samo jutarnje smjene"</li>
          <li>• Navedite izuzeke: "Vikendi su samo za iskusne radnike"</li>
          <li>• Balansirajte opterećenje: "Svi radnici imaju barem 1 vikend slobodan"</li>
        </ul>
      </div>
    </div>
  );

  // Render main view
  const renderMainView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">AI Pravila</h2>
          <p className="text-sm text-slate-500">Upravljajte pravilima za AI generisanje rasporeda</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Settings size={18} />
            Uredi pravila
          </button>
        </div>
      </div>

      {/* API Status */}
      <div className={`rounded-xl border p-4 ${
        apiKeyConfigured 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          {apiKeyConfigured ? (
            <Bot className="text-green-600" size={24} />
          ) : (
            <AlertCircle className="text-amber-600" size={24} />
          )}
          <div>
            <p className={`font-medium ${
              apiKeyConfigured ? 'text-green-800' : 'text-amber-800'
            }`}>
              {apiKeyConfigured ? 'AI Konfigurisan' : 'API ključ nedostaje'}
            </p>
            <p className={`text-sm ${
              apiKeyConfigured ? 'text-green-600' : 'text-amber-600'
            }`}>
              {apiKeyConfigured 
                ? 'AI funkcije su dostupne' 
                : 'Dodajte VITE_GROQ_API_KEY u .env.local za omogućenje AI'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Rules */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Trenutna pravila
        </h3>
        <div className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap text-slate-700">
          {rules || 'Nema definisanih pravila'}
        </div>
      </div>

      {/* Test Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={20} />
          Testiraj pravila
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Testirajte AI pravila generisanjem prijedloga rasporeda
        </p>
        <button
          onClick={handleTestRules}
          disabled={isTesting}
          className="btn btn-primary flex items-center gap-2"
        >
          {isTesting ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Testiranje...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Testiraj AI
            </>
          )}
        </button>

        {testResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.success ? 'Uspešno' : 'Greška'}
            </p>
            <p className="text-sm mt-1">{testResult.message}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Brze akcije</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleAddRule}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
          >
            <Plus className="text-primary-600" size={20} />
            <div>
              <p className="font-medium text-slate-800">Dodaj pravilo</p>
              <p className="text-sm text-slate-500">Dodaj novo pravilo u listu</p>
            </div>
          </button>
          <button
            onClick={handleClearRules}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            <Trash2 className="text-red-600" size={20} />
            <div>
              <p className="font-medium text-slate-800">Resetuj pravila</p>
              <p className="text-sm text-slate-500">Vrati na podrazumijevana</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-slate-100 p-6 overflow-auto">
      {isEditing ? renderRulesEditor() : renderMainView()}
    </div>
  );
}

export default AIPage;
