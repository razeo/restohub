// ===========================================
// AI Service for RestoHub
// Uses MiniMax API for scheduling
// ===========================================

import { ScheduleState, AIResponse, ALL_DAYS } from '../types/index';

// MiniMax API Configuration
const MINIMAX_API_BASE = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

// Get MiniMax API key from environment
const getMinimaxApiKey = (): string => import.meta.env.VITE_MINIMAX_API_KEY || '';

const cleanJsonOutput = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

export const processScheduleRequest = async (
  prompt: string,
  currentState: ScheduleState,
  signal?: AbortSignal
): Promise<AIResponse> => {
  const apiKey = getMinimaxApiKey();

  if (!apiKey) {
    throw new Error('MiniMax API ključ nije podešen. Dodaj VITE_MINIMAX_API_KEY u .env.local.');
  }

  const allowedDuties = currentState.duties.map(d => d.label).join(', ');

  const employeesWithAvailability = currentState.employees.map(e => ({
    id: e.id,
    name: e.name,
    role: e.role,
    availability: e.availability || ALL_DAYS
  }));

  const systemMessage = `Ti si RestoHub AI, precizan algoritam za raspoređivanje osoblja u restoranu.

CILJ: Generiši ili ažuriraj JSON objekat koji predstavlja raspored smjena.

PRIORITET 1: KORISNIČKA PRAVILA (OBAVEZNO)
${currentState.aiRules || 'Nema posebnih pravila.'}

PRIORITET 2: OGRANIČENJA
- Dostupnost: Radnik se NE SMIJE dodijeliti smjeni ako dan nije u availability listi.
- Uloge: Poštuj uloge (Chef, Bartender, Server, itd.)

PRIORITET 3: KONTEKST
- Radnici: ${JSON.stringify(employeesWithAvailability)}
- Smjene: ${JSON.stringify(currentState.shifts)}
- Trenutni raspored: ${JSON.stringify(currentState.assignments)}
- Dozvoljene dužnosti: [${allowedDuties}]
- Trenutna sedmica: ${currentState.currentWeekId}

IZLAZ (SAMO JSON, bez markdown):
{
  "message": "Objašnjenje na srpskom/hrvatskom šta je urađeno",
  "newAssignments": [{"shiftId": "id", "employeeId": "id", "specialDuty": "duty"}],
  "employeesToAdd": [{"name": "Ime", "role": "Uloga"}]
}`;

  try {
    const response = await fetch(MINIMAX_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_output_tokens: 4096,
      }),
      signal,
    });

    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('MiniMax API Error:', response.status, errorData);
      throw new Error(`API greška (${response.status}): ${(errorData as Record<string, { msg?: string }>).base_resp?.msg || 'Nepoznata greška'}`);
    }

    const data = await response.json();
    
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    // Parse MiniMax response
    const choices = (data as Record<string, unknown>).choices as Array<{ message?: { content?: string } }> | undefined;
    const content = choices?.[0]?.message?.content || '';
    const cleanedText = cleanJsonOutput(content);

    try {
      const parsed = JSON.parse(cleanedText);
      return {
        message: parsed.message || 'Raspored je generisan.',
        assignments: parsed.newAssignments || [],
        newEmployees: parsed.employeesToAdd || [],
      };
    } catch {
      console.error('JSON Parse Error. Raw:', content);
      throw new Error('Format odgovora nije ispravan. Pokušajte ponovo.');
    }
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.message === 'AbortError')) {
      throw error;
    }
    console.error('AI Service Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Došlo je do greške';
    throw new Error(errMsg);
  }
};

// Helper to check if API is configured
export const isAiConfigured = (): boolean => {
  return !!getMinimaxApiKey();
};

// Helper to get API status
export const getAiStatus = (): { configured: boolean; message: string } => {
  const key = getMinimaxApiKey();
  if (!key) {
    return { 
      configured: false, 
      message: 'MiniMax API ključ nije podešen. Dodajte VITE_MINIMAX_API_KEY u .env.local' 
    };
  }
  return { configured: true, message: 'AI je spreman za korištenje.' };
};

// Export ALL_DAYS for use in prompts
export { DayOfWeek, ALL_DAYS } from '../types/index';
