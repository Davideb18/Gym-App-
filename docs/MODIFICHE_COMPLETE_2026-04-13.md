# Modifiche Complete - 2026-04-13

## Obiettivo

Raccogliere in un unico documento tutti i file modificati nella fase di refactor, hardening e quality gate, con una descrizione chiara del ruolo di ogni file.

## 1) Config, tooling e quality gate

- package.json
  - Script root per lint/typecheck su frontend e backend.
  - Setup pre-commit con Husky.
  - Configurazione lint-staged per eseguire controlli automatici sui file staged.

- package-lock.json
  - Aggiornamento lockfile per nuove dipendenze di lint e workflow qualità.

- .husky/pre-commit
  - Hook pre-commit che esegue lint-staged.

- backend/package.json
  - Script lint/lint:fix/typecheck backend.
  - Dipendenze ESLint/TypeScript aggiunte.

- backend/eslint.config.cjs
  - Config ESLint backend (TS parser/plugin, unused imports, regole base, ignore dist).

- frontend/package.json
  - Script lint/lint:fix/typecheck frontend.
  - Dipendenze ESLint React/TS aggiunte.

- frontend/eslint.config.cjs
  - Config ESLint frontend (TS/TSX, react-hooks, unused imports, ignore .expo/dist).

- docs/PROGRESSION_GRAPHICS_SYSTEM_PLAN.md
  - Documento di piano prodotto/UX su progression system, level, record e grafici.

## 2) App shell e flussi globali

- frontend/App.tsx
  - Integrazione schermate globali aggiuntive:
    - WorkoutSessionRecapScreen
    - PrCelebrationModal
  - Piccoli fix lifecycle/auth effect.
  - Uniformazione sfondo root.

## 3) Service layer e utility

- frontend/src/api/workoutService.ts
  - Nuove query:
    - getLastPerformanceByExercises
    - getBestE1RMByExercises
  - Salvataggio sessione completata con ritorno dati PR rilevati.
  - Parsing input numerici reso robusto con helper centralizzati.
  - Migliorie query recent sessions con join esercizi.

- frontend/src/services/progressionService.ts
  - Logica centralizzata per livello utente, tier, score e progress percent.

- frontend/src/utils/numberUtils.ts
  - Parser numerici condivisi:
    - parseFlexibleNumber
    - parsePositiveInt
    - parsePositiveFloat

## 4) Store globali (Zustand)

- frontend/src/store/useActiveWorkout.ts
  - Estensione LiveSet con last_reps/last_weight.
  - updateSet reso più sicuro su undefined/NaN.
  - Nuova action applyLastPerformance.
  - Stop timer centralizzato su start/finish/cancel.

- frontend/src/store/usePrCelebrationStore.ts
  - Stato globale modal celebrazione PR.

- frontend/src/store/useWorkoutSessionDetailStore.ts
  - Stato globale per apertura/chiusura recap dettagli sessione.

- frontend/src/store/useAuthStore.ts
  - Pulizia minore nel ritorno di signIn.

- frontend/src/store/useRestTimer.ts
  - Pulizia import non utilizzati.

## 5) Hook

- frontend/src/hooks/useWorkoutCreation.ts
  - Refactor builder routine:
    - estrazione mapTemplateToDraftExercises
    - estrazione validateDraft
    - costanti premium set types
  - Validazione input numerici tramite helper centralizzati.
  - Codice semplificato e più mantenibile.

## 6) Schermate principali

- frontend/src/screens/Main/HomeScreen.tsx
  - Uso header condiviso ScreenHeader.
  - Migliorie visual tipografia/contrasto.
  - Apertura recap sessione su tap sessione recente.

- frontend/src/screens/Main/HistoryScreen.tsx
  - Uso header condiviso.
  - Migliorie visual e spaziatura contenuti.
  - Apertura recap sessione dal dettaglio storico.
  - Piccoli fix useEffect/useCallback dipendenze.

- frontend/src/screens/Main/ActiveWorkoutScreen.tsx
  - Refactor in sotto-componenti active/\*.
  - Caricamento last performance e best e1RM con React Query.
  - Trigger celebrazione PR su completamento set.
  - Invalidazione query dopo salvataggio sessione.

- frontend/src/screens/Main/ProfileScreen.tsx
  - Refactor in componenti modulari profile/\*.
  - Nuove query per workouts count e progression sessions.
  - Calcolo livello/progressione con ProgressionService.
  - Modal lingua estratta in componente dedicato.

- frontend/src/screens/Main/SchedeScreen.tsx
  - Refactor in componenti modulari schede/\*.
  - Separazione quick actions e lista template.

## 7) Componenti workout

- frontend/src/components/workout/SmartWorkoutWidget.tsx
  - Refactor in pannelli dedicati per stato rest/current set.
  - Parsing numerico condiviso via numberUtils.

- frontend/src/components/workout/WorkoutPreviewScreen.tsx
  - Pulizia import inutilizzati.

- frontend/src/components/workout/WorkoutSummaryScreen.tsx
  - Pulizia import inutilizzati.

- frontend/src/components/workout/WorkoutSessionRecapScreen.tsx
  - Nuova schermata full-screen recap sessione con grouping per esercizio.

- frontend/src/components/workout/PrCelebrationModal.tsx
  - Nuova schermata celebrativa PR con animazioni e lista PR.

### Sotto-componenti active workout (nuovi)

- frontend/src/components/workout/active/ActiveWorkoutHeader.tsx
  - Header workout con timer, set completati e volume.

- frontend/src/components/workout/active/ActiveWorkoutExerciseCard.tsx
  - Card esercizio con input set e toggle completamento.

- frontend/src/components/workout/active/ActiveWorkoutRestTimer.tsx
  - Timer recupero fixed bottom, comandi -15/+15/skip.

- frontend/src/components/workout/active/SmartWorkoutRestPanel.tsx
  - Pannello recupero per widget smart.

- frontend/src/components/workout/active/SmartWorkoutCurrentSetPanel.tsx
  - Pannello set corrente per widget smart.

## 8) Componenti esercizi

- frontend/src/components/exercises/ExerciseDetailModal.tsx
  - Refactor forte con estrazione header/tabs/content/card.

- frontend/src/components/exercises/ExerciseCharts.tsx
  - Miglioramento metrica 1RM (Epley), labels intelligenti, delta trend.

- frontend/src/components/exercises/ExerciseLibrary.tsx
  - Pulizia stato/import non utilizzati.

### Sotto-componenti detail esercizio (nuovi)

- frontend/src/components/exercises/detail/ExerciseDetailHeader.tsx
  - Header dettaglio esercizio.

- frontend/src/components/exercises/detail/ExerciseDetailTabs.tsx
  - Tab descrizione/storico.

- frontend/src/components/exercises/detail/ExerciseDescriptionContent.tsx
  - Corpo tab descrizione (video + istruzioni + grafici).

- frontend/src/components/exercises/detail/ExerciseHistorySessionCard.tsx
  - Card sessione storica con note editabili.

## 9) Componenti schede/routine

- frontend/src/components/schede/CreateRoutineScreen.tsx
  - Pulizia import inutilizzati.

- frontend/src/components/schede/CreateRoutine/RoutineStatsSummary.tsx
  - Parsing robusto reps/rest con helper centralizzati.

- frontend/src/components/schede/SchedeQuickActions.tsx
  - Nuovo blocco azioni rapide modulare.

- frontend/src/components/schede/SchedeTemplatesList.tsx
  - Nuova lista template modulare con stati loading/error/empty.

## 10) Componenti profilo e UI condivisa

- frontend/src/components/profile/ProfileStatsGrid.tsx
  - Nuova griglia statistiche + progress bar livello.

- frontend/src/components/profile/ProfilePrList.tsx
  - Nuova lista PR modulare.

- frontend/src/components/profile/LanguageSelectorModal.tsx
  - Nuova modal selezione lingua.

- frontend/src/components/ui/ScreenHeader.tsx
  - Header condiviso usato nelle schermate principali.

- frontend/src/components/ui/PremiumModal.tsx
  - Pulizia import inutilizzati.

## 11) Localizzazione

- frontend/src/locales/en.json
  - Nuove stringhe home/history/profile/records e fallback template.

- frontend/src/locales/it.json
  - Nuove stringhe equivalenti in italiano.

## Stato validazione

- Lint: OK
- Typecheck: OK

## Nota

Questo documento riflette i file modificati nella fase corrente già verificata con quality gate attivo.
