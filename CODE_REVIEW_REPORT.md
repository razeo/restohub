# RestoHub Code Review Report

**Date:** 2026-02-09  
**Reviewer:** OpenClaw AI Assistant  
**Repository:** github.com/razeo/restohub  
**Version:** 2.0.0

---

## Executive Summary

RestoHub je solidan sistem za upravljanje restoranom sa dobrim arhitektonskim izborima, ali ima nekoliko kritičnih bugova i tehničkih dugova koji trebaju pažnju pre nego što sistem uđe u produkciju.

**Ukupno problema:** 15  
**🔴 Kritični:** 4  
**🟡 Srednji:** 7  
**🟢 Manji:** 4

---

## 🔴 KRITIČNI PROBLEMI

### 1. DUPLIKAT AI SERVISA
**Lokacija:** `src/services/ai.ts` i `src/services/gemini.ts`  
**Severity:** Kritičan  
**Status:** Neispravljeno

**Problem:**
Dva fajla eksportuju istu funkciju `processScheduleRequest`:

```typescript
// services/ai.ts
export const processScheduleRequest = async (...) => { ... }

// services/gemini.ts  
export const processScheduleRequest = async (...) => { ... }
```

**Uticaj:**
- Konflikt pri importu u `App.tsx`
- Nejasno koji servis se koristi
- Dupliciran kod

**Preporuka:**
1. Obrišite `services/gemini.ts` (koristi `services/ai.ts`)
2. ILI preimenujte jednu od funkcija

---

### 2. SIGURNOSNI RIZIK - DEFAULT KREDENCIJALI
**Lokacija:** `src/components/Auth/Login.tsx:74-75`  
**Severity:** Kritičan  
**Status:** Neispravljeno

**Problem:**
Login forma prikazuje default kredencijale:

```tsx
<div className="mt-6 text-center text-sm text-slate-500">
  <p>Podaci za prijavljivanje:</p>
  <p className="font-mono mt-1">admin / admin123</p>
</div>
```

**Uticaj:**
- Svako ko vidi ekran zna admin lozinku
- Nije prikladno za produkciju

**Preporuka:**
- Ukloniti ovaj blok koda
- ILI prikazati samo pri prvom login-u
- ILI koristiti `process.env` za podrazumevane vrednosti

---

### 3. LOCALSTORAGE KAO JEDINI STORAGE
**Lokacija:** Ceo sistem koristi `localStorage`  
**Severity:** Kritičan  
**Status:** Dizajn problem

**Problem:**
Svi podaci se čuvaju isključivo u `localStorage`:

```typescript
// src/utils/storage.ts
export function getStorageItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  // ...
}

export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
```

**Uticaj:**
- Brisanje cache-a = gubitak svih podataka
- Nema backup-a
- Nema sync-a između uređaja
- LocalStorage ima limit (~5-10MB)
- Podaci nisu dostupni na drugim uređajima

**Preporuka:**
- Implementirati Supabase sync
- Dodati export/import funkcionalnost
- Razmotriti IndexedDB za veće podatke

---

### 4. NEKONZISTENTAN API KEY NAME
**Lokacija:** `src/App.tsx:271`  
**Severity:** Kritičan  
**Status:** Neispravljeno

**Problem:**
Error poruka koristi pogrešan naziv environment variable-a:

```typescript
if (!isAiConfigured()) {
  toast.error('API ključ nije podešen. Dodajte VITE_GROQ_API_KEY u .env.local');
  return;
}
```

Ali `ai.ts` koristi `VITE_MINIMAX_API_KEY`:

```typescript
// services/ai.ts
const getMinimaxApiKey = (): string => import.meta.env.VITE_MINIMAX_API_KEY || '';
```

**Uticaj:**
- Korisnici će pogrešno konfigurisati .env
- AI funkcionalnost neće raditi

**Preporuka:**
Promeniti poruku u:
```typescript
toast.error('API ključ nije podešen. Dodajte VITE_MINIMAX_API_KEY u .env.local');
```

---

## 🟡 SREDNJI PROBLEMI

### 5. NEMA VALIDACIJE ZA VREME SMENA
**Lokacija:** `src/components/Shifts/ShiftsPage.tsx:113-133`  
**Severity:** Srednji  
**Status:** Neispravljeno

**Problem:**
Forma za dodavanje smena nema validaciju za logično vreme:

```typescript
const handleSave = () => {
  if (!formData.label.trim() || !formData.startTime || !formData.endTime) return;
  // NEMA PROVERE: startTime < endTime
  // NEMA PROVERE: startTime !== endTime
};
```

**Uticaj:**
- Može se kreirati smena: 08:00 - 08:00
- Može se kreirati smena: 16:00 - 07:00 (negativno trajanje)

**Preporuka:**
```typescript
if (formData.startTime >= formData.endTime) {
  toast.error('Vreme kraja mora biti posle vremena početka');
  return;
}
```

---

### 6. NEDOVRŠENE STRANICE
**Lokacija:** `src/App.tsx:412-448`  
**Severity:** Srednji  
**Status:** Neimplementirano

**Problem:**
Tri stranice imaju samo placeholder tekst:

**Duties stranica:**
```tsx
{currentPage === 'duties' && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-xl font-bold text-slate-800 mb-4">
      Upravljanje dužnostima
    </h2>
    <p className="text-slate-600">
      Ovdje će biti lista dužnosti (glavni kuvar, pomoćni, itd.).
    </p>
  </div>
)}
```

**Templates stranica:**
```tsx
{currentPage === 'templates' && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-xl font-bold text-slate-800 mb-4">
      Šabloni rasporeda
    </h2>
    <p className="text-slate-600">
      Ovdje će biti sačuvani šabloni za brzo kreiranje rasporeda.
    </p>
  </div>
)}
```

**AI stranica:**
```tsx
{currentPage === 'ai' && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h2 className="text-xl font-bold text-slate-800 mb-4">
      AI Pravila
    </h2>
    <p className="text-slate-600">
      Ovdje će biti pravila za AI generisanje rasporeda.
    </p>
  </div>
)}
```

**Preporuka:**
- Kreirati `DutiesPage.tsx`, `TemplatesPage.tsx`, `AIPage.tsx`
- Povezati sa postojećim state-om

---

### 7. NEMA PROVERE ROLA ZA STRANICE
**Lokacija:** `src/App.tsx:375-448`  
**Severity:** Srednji  
**Status:** Neimplementirano

**Problem:**
Sve stranice su dostupne svim korisnicima, bez obzira na rolu:

```typescript
{currentPage === 'settings' && ( ... )}
{currentPage === 'users' && ( ... )}
{currentPage === 'permissions' && ( ... )}
```

**Uticaj:**
- Employee role može pristupiti admin stranicama
- Nema kontrole pristupa

**Preporuka:**
Koristiti `usePermissionCheck()`:

```typescript
{currentPage === 'settings' && canAccessSettings && ( ... )}
{currentPage === 'users' && canManageUsers && ( ... )}
```

---

### 8. INKONSISTENTAN HANDLING NULL/UNDEFINED
**Lokacija:** `src/components/Schedule/ScheduleGrid.tsx:71-82`  
**Severity:** Srednji  
**Status:** Neispravljeno

**Problem:**
Nekonzistentan handling kada employee nije pronađen:

```typescript
const getEmployeeById = (id: string) => {
  return employees.find(e => e.id === id);
};

// Kasnije:
<span className="text-xs font-medium truncate">
  {employee?.name || '?'}
</span>
```

**Preporuka:**
Definisati fallback na jednom mestu ili koristiti typed funkciju.

---

### 9. HARDCODOVANA LOKACIJA U FOOTERU
**Lokacija:** `src/components/Schedule/ScheduleGrid.tsx:254`  
**Severity:** Manji  
**Status:** Neispravljeno

**Problem:**
```tsx
<p className="text-sm text-slate-400">
  Made with <span className="inline-block animate-pulse">❤️</span> 
  for Aleksandar Conference & Spa, Žabljak, Montenegro 🇲🇪
</p>
```

**Preporuka:**
Prebaciti u konfiguraciju ili `constants.ts`

---

### 10. NEMA ERROR BOUNDARY-A
**Lokacija:** Ceo app  
**Severity:** Srednji  
**Status:** Neimplementirano

**Problem:**
Ako bilo koja komponenta baci error, cela aplikacija može da padne.

**Preporuka:**
Dodati React Error Boundary:

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <AppContent />
</ErrorBoundary>
```

---

## 🟢 MANJI PROBLEMI

### 11. PRAZAN TOAST USPEHA
**Lokacija:** `src/components/Schedule/ScheduleGrid.tsx:123-126`  
**Severity:** Manji  
**Status:** Neispravljeno

**Problem:**
```typescript
if (alreadyAddedInThisBatch.length > 0) {
  // Prazan blok - ništa se ne dešava
}
```

**Preporuka:**
```typescript
if (alreadyAddedInThisBatch.length > 0) {
  toast.success(`Dodato ${alreadyAddedInThisBatch.length} radnika`);
}
```

---

### 12. NEISKORIŠĆENE VARIJABLE
**Lokacija:** `src/services/gemini.ts`  
**Severity:** Manji  
**Status:** Neiskorišćeno

**Problem:**
Fajl je importovan ali se možda ne koristi.

---

### 13. NEMA LOADING STATE-A ZA NKE STRANICE
**Lokacija:** `src/App.tsx`  
**Severity:** Manji  
**Status:** Neimplementirano

**Problem:**
prilikom učitavanja podataka iz localStorage nema loading indicator-a.

---

### 14. DUPLI IMPORT
**Lokacija:** `src/App.tsx:51-52`  
**Severity:** Manji  
**Status:** Puko

**Problem:**
```typescript
import { EmployeesPage } from './components/Employees';
import { ShiftsPage } from './components/Shifts';
```

Nije problem, samo napomena.

---

### 15. HARDCODED EMPLOYEE/SHIFT DATA
**Lokacija:** `src/App.tsx:66-92`  
**Severity:** Manji  
**Status:** Dizajn

**Problem:**
```typescript
const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Marko Marković', role: Role.SERVER },
  { id: 'emp-2', name: 'Jovan Jovanović', role: Role.CHEF },
  // ...
];
```

**Preporuka:**
Prebaciti u zaseban fajl `data/initialData.ts`

---

## 📊 STATISTIKA KODA

| Metrika | Vrednost |
|---------|----------|
| Ukupno fajlova | 50+ |
| TypeScript fajlovi | ~40 |
| Komponente | ~25 |
| Servisi | 6 |
| Hooks | 3 |
| Utils | 3 |
| Contexts | 2 |

---

## ✅ DOBRI ARHITEKTONSKI IZBORI

1. **TypeScript** - dobra tipizacija
2. **Modularna struktura** - komponente su zasebni fajlovi
3. **Tailwind CSS** - konzistentan styling
4. **Custom hooks** - `useAuth`, `useNotifications`, `useMobile`
5. **Context API** - za auth i permissions
6. **Zasebni tipovi** - `types/index.ts`
7. **Migrations** - za localStorage verzioniranje
8. **Export/Import** - JSON i CSV podrška

---

## 🎯 PREPORUKA ZA POPRAVKE

### Prioritet 1 (Hitno - Pred produkcijom)
1. 🔴 Obrišite `services/gemini.ts` ili rešite konflikt
2. 🔴 Ispravite `VITE_GROQ_API_KEY` → `VITE_MINIMAX_API_KEY` grešku
3. 🔴 Uklonite default kredencijale sa login ekrana
4. 🟡 Dodajte validaciju za vreme smena
5. 🟡 Kreirajte `DutiesPage` komponentu

### Prioritet 2 (Važno - Pre redovnog korišćenja)
6. 🟡 Dodajte proveru rola za sve stranice
7. 🟡 Implementirajte `TemplatesPage` i `AIPage`
8. 🟡 Dodajte backup funkcionalnost
9. 🟢 Implementirajte Error Boundary

### Prioritet 3 (Poželjno - Kasnije)
10. 🟢 Dodajte loading state-ove
11. 🟢 Prebacite hardkodovane podatke u zasebne fajlove
12. 🟢 Dodajte meaningful toast poruke
13. 🟢 Razmotrite Supabase sync za cloud backup

---

## 📁 STRUKTURA PROJEKTA

```
restohub/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   ├── AllergenGuide/
│   │   ├── Auth/
│   │   ├── Chat/
│   │   ├── DailyMenu/
│   │   ├── DailyReport/
│   │   ├── Employees/
│   │   ├── Layout/
│   │   ├── Loading/
│   │   ├── MenuCard/
│   │   ├── mobile/
│   │   ├── OutOfStock/
│   │   ├── ResponsibilityPlan/
│   │   ├── RoomService/
│   │   ├── Schedule/
│   │   ├── Shifts/
│   │   ├── Sidebar/
│   │   ├── ShiftHandover/
│   │   ├── WasteList/
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── PermissionsContext.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useMobile.ts
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── ai.ts
│   │   ├── auth.ts
│   │   ├── gemini.ts          ⚠️ DUPLIKAT
│   │   ├── notifications/
│   │   │   ├── fcm.ts
│   │   │   ├── index.ts
│   │   │   ├── supabase.ts
│   │   │   ├── telegram.ts
│   │   │   ├── trigger.ts
│   │   │   └── types.ts
│   │   └── ...
│   ├── types/
│   │   ├── index.ts
│   │   ├── menu.ts
│   │   ├── permissions.ts
│   │   └── users.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── id.ts
│   │   └── storage.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔗 RELATED FILES

- `src/App.tsx:51-52` - Import konflikat
- `src/components/Auth/Login.tsx:74-75` - Default kredencijali
- `src/services/ai.ts` - AI servis
- `src/services/gemini.ts` - DUPLIKAT AI servis
- `src/components/Shifts/ShiftsPage.tsx` - Validacija smena
- `src/components/Schedule/ScheduleGrid.tsx` - UI bugovi

---

**Report generated:** 2026-02-09  
**Next review:** After bug fixes
