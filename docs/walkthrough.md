# Project Walkthrough - RestoHub

RestoHub is a premium restaurant management application designed with a modern "Alpine Luxe" aesthetic. It provides tools for scheduling, employee management, and AI-assisted automation.

## Core Features

### 📅 Advanced Scheduling
A dynamic, interactive grid for managing shifts and assignments.
![Schedule Grid Preview](file:///C:/Users/zeljk/.gemini/antigravity/brain/b5d413d6-0be1-4103-9618-48ec6125ccdf/debug_ai_interaction_1771189149314.webp)

- **Drag & Drop Simulation**: Assign employees to shifts by clicking their toolbox items.
- **Weekly Navigation**: Easily move between weeks with automatic state isolation.
- **Real-time Validation**: Prevents double assignments and respects employee availability.

### 🤖 AI Schedule Generation
Powered by **MiniMax M2.5**, RestoHub allows managers to generate entire weekly schedules via natural language commands.

- **Strict JSON Mode**: Ensures generated schedules are always valid and ready for review.
- **Pending Review**: AI-generated changes are presented as proposals that can be applied or discarded.
- **Custom Rules**: Define specific operational rules (e.g., "Always have 2 servers for breakfast") that the AI will follow.

### 👥 Employee & Shift Management
- **Centralized Registry**: Manage employee details, roles, and availability.
- **Flexible Shifts**: Create complex shift patterns and replicate them across the week with one click.
- **State Hardening**: Batch creation and functional updates ensure data integrity.

## Design System: "Alpine Luxe"
The application uses a sophisticated design system focused on vertical spacing, glassmorphism, and premium typography.

- **Color Palette**: `Vibrant Indigo`, `Slate Blue`, and `Emerald Accent`.
- **Typography**: `Outfit` and `Inter` for a modern, legible feel.
- **Interactions**: Smooth micro-animations and hover effects on all interactive elements.

## Recent Improvements

### Bug Fixes
- **Shift Replication Fix**: Resolved an issue where "Replicate to all days" would only save a single day due to stale state closures.
- **AI Response Hardening**: Implemented a robust JSON cleaner to handle AI responses that include markdown or explanatory text.
- **State Consistency**: Migrated all core hooks to functional updates (`setShifts(prev => ...)`) to eliminate race conditions in rapid operations.

### Performance & Security
- **Optimized Storage**: Efficient localStorage synchronization for offline-first capabilities.
- **Minimax Configuration**: Unified API key management via `.env.local` for secure integration.
