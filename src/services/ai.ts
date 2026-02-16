// ===========================================
// AI Service for RestoHub
// Uses MiniMax API for scheduling
// ===========================================

import { ScheduleState, AIResponse, ALL_DAYS } from '../types/index';

// MiniMax API Configuration
const MINIMAX_API_BASE = 'https://api.minimaxi.chat/v1/text/chatcompletion_v2';

// Get MiniMax API key from environment
const getMinimaxApiKey = (): string => import.meta.env.VITE_MINIMAX_API_KEY || '';

const cleanJsonOutput = (text: string): string => {
  try {
    // Attempt to find JSON block in markdown
    const markdownRegex = /```json\s*([\s\S]*?)\s*```/g;
    const match = markdownRegex.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }

    // fallback: find everything between first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1).trim();
    }
  } catch (e) {
    console.error('Error cleaning JSON output:', e);
  }
  return text.trim();
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

  const systemMessage = `Ti si RestoHub AI, stručnjak za optimizaciju radne snage u ugostiteljstvu.
Tvoj zadatak je da kreiraš ili ažuriraš raspored radnika na osnovu upita korisnika, poštujući stroga pravila.

Dostupni podaci:
- Radnici: ${JSON.stringify(employeesWithAvailability)}
- Smjene: ${JSON.stringify(currentState.shifts)}
- Trenutni raspored: ${JSON.stringify(currentState.assignments)}
- Dozvoljene dužnosti: [${allowedDuties}]
- Trenutna sedmica: ${currentState.currentWeekId}

Glavna pravila:
1. ${currentState.aiRules || 'Pridržavaj se standardnih pravila ugostiteljstva.'}
2. Radnik se NE SMIJE dodijeliti smjeni ako dan smjene nije u njegovoj listi 'availability'.
3. 'shiftId' i 'employeeId' u tvom odgovoru MORAJU biti tačno oni koji su ti dati u kontekstu. Ne izmišljaj nove ID-jeve osim ako korisnik ne traži novog radnika.
4. 'specialDuty' mora biti jedna od dozvoljenih dužnosti: [${allowedDuties}].

VAŽNO: Odgovori ISKLJUČIVO validnim JSON objektom. Bez uvodnog teksta, bez objašnjenja van JSON-a.
Odgovor MORA imati sljedeću strukturu:
{
  "message": "Kratko objašnjenje na srpskom/hrvatskom šta si uradio",
  "newAssignments": [
    {
      "shiftId": "string (obavezan)",
      "employeeId": "string (obavezan)",
      "specialDuty": "string (opciono, npr. 'Glavni kuvar')",
      "day": "DayOfWeek (npr. 'Monday')"
    }
  ],
  "employeesToAdd": [
    {
      "name": "string",
      "role": "Role (Bartender, Chef, Server, Host, Manager, Other)"
    }
  ]
}`;

  try {
    const response = await fetch(MINIMAX_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
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
      throw new Error(`API greška (${response.status}): ${(errorData as any).base_resp?.msg || (errorData as any).message || 'Nepoznata greška'}`);
    }

    const data = await response.json();

    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    // Try multiple formats for MiniMax response
    let content = '';

    // Format 1: OpenAI style
    if (data.choices?.[0]?.message?.content) {
      content = data.choices[0].message.content;
    }
    // Format 2: Older MiniMax/Anthropic-like style
    else if (data.content?.[0]?.text) {
      content = data.content[0].text;
    }
    // Format 3: Direct content
    else if (data.reply) {
      content = data.reply;
    }

    if (!content) {
      throw new Error(`AI je vratio odgovor bez sadržaja. (Status: ${response.status})`);
    }

    const cleanedText = cleanJsonOutput(content);

    try {
      const parsed = JSON.parse(cleanedText);

      // Basic Validation
      if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid JSON structure');

      const message = parsed.message || 'Raspored je ažuriran.';
      const newAssignmentsRaw = Array.isArray(parsed.newAssignments) ? parsed.newAssignments : [];
      const newEmployees = Array.isArray(parsed.employeesToAdd) ? parsed.employeesToAdd : [];

      // Validate IDs and integrity
      const validAssignments = newAssignmentsRaw.filter((a: any) => {
        const hasShift = currentState.shifts.some(s => s.id === a.shiftId);
        const hasEmployee = currentState.employees.some(e => e.id === a.employeeId);
        return hasShift && hasEmployee && a.day;
      });

      return {
        message,
        assignments: validAssignments,
        newEmployees,
      };
    } catch (parseError) {
      console.error('JSON Parse Error:', cleanedText, parseError);
      throw new Error(`AI je vratio neispravan format. Tekst: ${cleanedText.substring(0, 50)}...`);
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
