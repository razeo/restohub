# Implementation Plan - RestoHub Refactoring & Hardening

## Proposed Changes

### [State Management & Bug Fixes]
Summary of critical fixes for shift replication and race conditions.

#### [MODIFY] [useShifts.ts](file:///c:/Users/zeljk/.gemini/antigravity/scratch/restohub/src/hooks/useShifts.ts)
- Added `addShifts` for batch creation.
- Converted all updates to functional state updates.

#### [MODIFY] [useEmployees.ts](file:///c:/Users/zeljk/.gemini/antigravity/scratch/restohub/src/hooks/useEmployees.ts)
- Converted all updates to functional state updates.

#### [MODIFY] [useAssignments.ts](file:///c:/Users/zeljk/.gemini/antigravity/scratch/restohub/src/hooks/useAssignments.ts)
- Converted all updates to functional state updates.

#### [MODIFY] [ShiftsPage.tsx](file:///c:/Users/zeljk/.gemini/antigravity/scratch/restohub/src/components/Shifts/ShiftsPage.tsx)
- Integrated `addShifts` batch call for "Replicate to all days" feature.

### [AI Service Hardening]
Improving reliability of AI-generated schedules.

#### [MODIFY] [ai.ts](file:///c:/Users/zeljk/.gemini/antigravity/scratch/restohub/src/services/ai.ts)
- Implemented `cleanJsonOutput` to strip markdown from AI responses.
- Updated system prompt for strict JSON enforcement.
- Integrated `MiniMax-M2.5` model configuration.

## Verification Plan
1. **Manual Testing**: Create a shift and use "Replicate to all days" – verified all 7 days are created.
2. **AI Verification**: Trigger schedule generation via chat – verified JSON parsing handles markdown backticks.
3. **Build**: Run `npm run build` to ensure type safety and bundling.
