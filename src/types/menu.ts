// ===========================================
// Menu Types for RestoHub
// Digital Menu Card with Ingredients & Allergens
// ===========================================

export type AllergenCode = 
  | 'G'  // Gluten
  | 'D'  // Dairy
  | 'E'  // Eggs
  | 'P'  // Fish
  | 'N'  // Nuts
  | 'F'  // Fruit
  | 'C'  // Celery
  | 'Sy' // Sesame
  | 'Ss' // Soy
  | 'M'  // Molluscs
  | 'Sh' // Shellfish
  | 'L'  // Lupin
  | 'Mu' // Mustard
  | 'SO' // Sulphites
  | 'A'  // Alcohol
  | 'H'  // Hot (Spicy);

export interface Allergen {
  code: AllergenCode;
  name: string;
  icon?: string;
}

export const ALL_ALLERGENS: Allergen[] = [
  { code: 'G', name: 'Gluten', icon: '🌾' },
  { code: 'D', name: 'Mliječni', icon: '🥛' },
  { code: 'E', name: 'Jaja', icon: '🥚' },
  { code: 'P', name: 'Riba', icon: '🐟' },
  { code: 'N', name: 'Orašasti', icon: '🥜' },
  { code: 'F', name: 'Voće', icon: '🍎' },
  { code: 'C', name: 'Celer', icon: '🥬' },
  { code: 'Sy', name: 'Sezam', icon: '🫒' },
  { code: 'Ss', name: 'Soja', icon: '🫘' },
  { code: 'M', name: 'Mekušci', icon: '🦪' },
  { code: 'Sh', name: 'Školjke', icon: '🦐' },
  { code: 'L', name: 'Slanut', icon: '🌿' },
  { code: 'Mu', name: 'Senf', icon: '🟡' },
  { code: 'SO', name: 'Sulfiti', icon: '🍷' },
  { code: 'A', name: 'Alkohol', icon: '🍷' },
  { code: 'H', name: 'Ljuto', icon: '🌶️' },
];

export interface Ingredient {
  id: string;
  name: string;
  amount?: string;  // "100g", "2 kom", "po ukusu"
  isOptional?: boolean;
  allergens?: AllergenCode[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;  // EUR
  currency: string;
  category: MenuCategory;
  ingredients: Ingredient[];
  allergens: AllergenCode[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  preparationTime?: string;  // "15 min"
  calories?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  image?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type MenuCategory = 
  | 'appetizers'    // Predjela
  | 'soups'         // Supe
  | 'salads'        // Salate
  | 'meat'          // Meso
  | 'fish'          // Riba
  | 'vegetarian'   // Vegetarijanska
  | 'pasta'        // Paste
  | 'desserts'     // Deserti
  | 'drinks'       // Pića
  | 'specials';    // Specijaliteti

export const CATEGORIES: { key: MenuCategory; label: string; icon: string }[] = [
  { key: 'appetizers', label: 'Predjela', icon: '🥗' },
  { key: 'soups', label: 'Supe i Čorbe', icon: '🍜' },
  { key: 'salads', label: 'Salate', icon: '🥬' },
  { key: 'meat', label: 'Meso', icon: '🥩' },
  { key: 'fish', label: 'Riba i Plodovi Mora', icon: '🐟' },
  { key: 'vegetarian', label: 'Vegetarijanski', icon: '🥕' },
  { key: 'pasta', label: 'Pasta i Rižota', icon: '🍝' },
  { key: 'desserts', label: 'Deserti', icon: '🍰' },
  { key: 'drinks', label: 'Pića', icon: '🍷' },
  { key: 'specials', label: 'Specijaliteti', icon: '👨‍🍳' },
];

export interface MenuSection {
  category: MenuCategory;
  items: MenuItem[];
}

export interface MenuSettings {
  showPrices: boolean;
  showAllergens: boolean;
  showCalories: boolean;
  currency: string;
  language: 'sr' | 'en';
}
