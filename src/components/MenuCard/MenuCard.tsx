// ===========================================
// MenuCard - Digital Menu Display
// RestoHub Restaurant Management System
// ===========================================

import { useState, useMemo } from 'react';
import { 
  Printer, Search, Filter, X, ChevronDown, ChevronUp, 
  Leaf, Flame, Wheat, AlertTriangle, Info, Star,
  Utensils, ArrowLeft
} from 'lucide-react';
import { 
  MenuItem, MenuCategory, CATEGORIES, ALL_ALLERGENS, 
  AllergenCode, MenuSettings 
} from '../../types/menu';
import { STORAGE_KEYS, getStorageItem } from '../../utils/storage';

interface MenuCardProps {
  onClose?: () => void;
}

// Sample menu items for demo
const SAMPLE_MENU: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Brusketa sa paradajzom',
    description: 'Domaci hljeb, svježi paradajz, bosiljak, maslinovo ulje, bijeli luk',
    price: 5.50,
    currency: 'EUR',
    category: 'appetizers',
    ingredients: [
      { id: 'i1', name: 'Domaći hljeb', amount: '100g' },
      { id: 'i2', name: 'Svježi paradajz', amount: '80g' },
      { id: 'i3', name: 'Bosiljak', amount: 'po ukusu' },
      { id: 'i4', name: 'Maslinovo ulje', amount: '20ml' },
      { id: 'i5', name: 'Bijeli luk', amount: '5g' },
    ],
    allergens: ['G'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    preparationTime: '10 min',
    isAvailable: true,
    isFeatured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'm-2',
    name: 'Karađorđeva šnicla',
    description: 'Punjena sunka i sir, prženi krompirići, tartar sos',
    price: 14.00,
    currency: 'EUR',
    category: 'meat',
    ingredients: [
      { id: 'i6', name: 'Svinjsko meso', amount: '200g' },
      { id: 'i7', name: 'Sunka', amount: '50g' },
      { id: 'i8', name: 'Kačkavalj', amount: '50g' },
      { id: 'i9', name: 'Krompir', amount: '150g' },
      { id: 'i10', name: 'Tartar sos', amount: '50ml' },
    ],
    allergens: ['G', 'D', 'E'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    preparationTime: '20 min',
    calories: 850,
    isAvailable: true,
    isFeatured: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'm-3',
    name: 'Dagnje na buzaru',
    description: 'Dagnje, bijelo vino, bijeli luk, peršun, maslinovo ulje',
    price: 16.00,
    currency: 'EUR',
    category: 'fish',
    ingredients: [
      { id: 'i11', name: 'Dagnje', amount: '500g' },
      { id: 'i12', name: 'Bijelo vino', amount: '100ml' },
      { id: 'i13', name: 'Bijeli luk', amount: '10g' },
      { id: 'i14', name: 'Peršun', amount: 'po ukusu' },
      { id: 'i15', name: 'Maslinovo ulje', amount: '30ml' },
    ],
    allergens: ['M', 'Sy', 'SO', 'A'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    preparationTime: '25 min',
    isAvailable: true,
    isFeatured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'm-4',
    name: 'Pasta Carbonara',
    description: 'Tagliatelle, slanina, jaja, parmezan, vrhnje',
    price: 12.00,
    currency: 'EUR',
    category: 'pasta',
    ingredients: [
      { id: 'i16', name: 'Tagliatelle', amount: '200g' },
      { id: 'i17', name: 'Slanina', amount: '80g' },
      { id: 'i18', name: 'Jaja', amount: '2 kom' },
      { id: 'i19', name: 'Parmezan', amount: '40g' },
      { id: 'i20', name: 'Vrhnje', amount: '50ml' },
    ],
    allergens: ['G', 'D', 'E'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    preparationTime: '18 min',
    calories: 720,
    isAvailable: true,
    isFeatured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'm-5',
    name: 'Palačinke sa Nutellom',
    description: 'Tradicionalne palačinke, Nutella, šećer u prahu, šlag',
    price: 6.50,
    currency: 'EUR',
    category: 'desserts',
    ingredients: [
      { id: 'i21', name: 'Brašno', amount: '100g' },
      { id: 'i22', name: 'Jaja', amount: '1 kom' },
      { id: 'i23', name: 'Mlijeko', amount: '150ml' },
      { id: 'i24', name: 'Nutella', amount: '50g' },
      { id: 'i25', name: 'Šlag', amount: '30g' },
    ],
    allergens: ['G', 'D', 'E', 'N'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    preparationTime: '15 min',
    isAvailable: true,
    isFeatured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'm-6',
    name: 'Pikantna čorba',
    description: 'Govedina, povrće, ljuta paprika, začini',
    price: 4.50,
    currency: 'EUR',
    category: 'soups',
    ingredients: [
      { id: 'i26', name: 'Govedina', amount: '100g' },
      { id: 'i27', name: 'Šargarepa', amount: '50g' },
      { id: 'i28', name: 'Krompir', amount: '80g' },
      { id: 'i29', name: 'Ljuta paprika', amount: 'po ukusu' },
    ],
    allergens: ['C'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: true,
    preparationTime: '12 min',
    calories: 180,
    isAvailable: true,
    isFeatured: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const getAllergenInfo = (code: AllergenCode) => {
  return ALL_ALLERGENS.find(a => a.code === code) || { code, name: code };
};

const MenuCard = ({ onClose }: MenuCardProps) => {
  // Load menu from storage or use sample
  const [menuItems] = useState<MenuItem[]>(() => {
    const stored = getStorageItem<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, SAMPLE_MENU);
    return stored.length > 0 ? stored : SAMPLE_MENU;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [filterAllergens, setFilterAllergens] = useState<AllergenCode[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const settings: MenuSettings = {
    showPrices: true,
    showAllergens: true,
    showCalories: false,
    currency: 'EUR',
    language: 'sr',
  };

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      // Allergen filter (exclude items with any of the selected allergens)
      const matchesAllergens = filterAllergens.length === 0 || 
        !filterAllergens.some(allergen => item.allergens.includes(allergen));
      
      return matchesSearch && matchesCategory && matchesAllergens && item.isAvailable;
    });
  }, [menuItems, searchQuery, selectedCategory, filterAllergens]);

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<MenuCategory, MenuItem[]> = {} as Record<MenuCategory, MenuItem[]>;
    
    if (selectedCategory === 'all') {
      CATEGORIES.forEach(cat => {
        groups[cat.key] = filteredItems.filter(item => item.category === cat.key);
      });
    } else {
      groups[selectedCategory] = filteredItems;
    }
    
    return groups;
  }, [filteredItems, selectedCategory]);

  const toggleAllergenFilter = (code: AllergenCode) => {
    setFilterAllergens(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilterAllergens([]);
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${settings.currency}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Utensils size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Jelovnik</h1>
              <p className="text-xs text-slate-500">RestoHub Digitalna Karta</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-secondary flex items-center gap-2 ${filterAllergens.length > 0 ? 'ring-2 ring-amber-400' : ''}`}
            >
              <Filter size={16} />
              Filter
              {filterAllergens.length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center">
                  {filterAllergens.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => window.print()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer size={16} />
              Štampa
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži jela, sastojke..."
            className="input pl-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Izuzmi alergene:</span>
              <button 
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Očisti sve
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_ALLERGENS.map(allergen => {
                const isFiltered = filterAllergens.includes(allergen.code);
                return (
                  <button
                    key={allergen.code}
                    onClick={() => toggleAllergenFilter(allergen.code)}
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                      isFiltered 
                        ? 'bg-red-100 text-red-700 border border-red-300' 
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                    title={allergen.name}
                  >
                    <span>{allergen.icon}</span>
                    <span>{allergen.code}</span>
                    {isFiltered && <X size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-slate-200 px-2 py-2 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sve
          </button>
          {CATEGORIES.map(cat => {
            const count = menuItems.filter(i => i.category === cat.key && i.isAvailable).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
                <span className="ml-1 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
          
          {/* No Results */}
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Utensils size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Nema jela koja odgovaraju pretrazi</p>
              <button 
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Očisti filtere
              </button>
            </div>
          )}

          {/* Categories with Items */}
          {CATEGORIES.map(cat => {
            const items = groupedItems[cat.key];
            if (!items || items.length === 0) return null;
            
            return (
              <div key={cat.key} className="print:break-inside-avoid">
                <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  {cat.label}
                </h2>
                
                <div className="grid gap-3 print:grid print:gap-2">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-all ${
                        expandedItem === item.id ? 'ring-2 ring-blue-300' : 'hover:shadow-sm'
                      } print:border-1 print:border-black`}
                    >
                      {/* Item Header */}
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {item.isFeatured && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium flex items-center gap-1">
                                  <Star size={12} /> SPECIAL
                                </span>
                              )}
                              {item.isVegetarian && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                                  <Leaf size={12} /> V
                                </span>
                              )}
                              {item.isVegan && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium flex items-center gap-1">
                                  <Leaf size={12} /> VG
                                </span>
                              )}
                              {item.isSpicy && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1">
                                  <Flame size={12} /> HOT
                                </span>
                              )}
                              {item.isGlutenFree && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs flex items-center gap-1">
                                  <Wheat size={12} /> GF
                                </span>
                              )}
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                          </div>
                          
                          <div className="text-right ml-4">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(item.price)}
                            </span>
                            {expandedItem === item.id ? (
                              <ChevronUp size={20} className="text-slate-400 ml-2" />
                            ) : (
                              <ChevronDown size={20} className="text-slate-400 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedItem === item.id && (
                        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50">
                          {/* Ingredients */}
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                              <Info size={14} /> Sastojci:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {item.ingredients.map(ing => (
                                <span 
                                  key={ing.id}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                >
                                  {ing.name}
                                  {ing.amount && <span className="text-slate-400 ml-1">({ing.amount})</span>}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Allergens */}
                          {item.allergens.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                <AlertTriangle size={14} className="text-amber-500" /> Alergeni:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {item.allergens.map(code => {
                                  const allergen = getAllergenInfo(code);
                                  return (
                                    <span 
                                      key={code}
                                      className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium flex items-center gap-1"
                                      title={allergen.name}
                                    >
                                      {allergen.icon} {allergen.code}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                            {item.preparationTime && (
                              <span>🕐 {item.preparationTime}</span>
                            )}
                            {item.calories && settings.showCalories && (
                              <span>🔥 {item.calories} kcal</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-400">
        <p>RestoHub Digitalna Karta • Pitanja o alergenima pitajte osoblje</p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { margin: 1cm; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:border-1 { border-width: 1px !important; }
          .print\\:border-black { border-color: black !important; }
          .print\\:grid { display: block !important; }
          .print\\:gap-2 { margin-bottom: 1rem !important; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default MenuCard;
