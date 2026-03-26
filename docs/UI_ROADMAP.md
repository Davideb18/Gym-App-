# ROADMAP UI - SCHERMATA ALLENAMENTO E "MY ROUTINE"

## Obiettivi Concordati

### 1. Pulizia del "Main Screen" (`SchedeScreen.tsx`)
- Risolvere eventuali problemi grafici o sovrapposizioni attuali.

### 2. Attivazione del Flusso "Creazione Scheda (Custom)" - ALL-IN-ONE Modal
**PREMIUM FEATURE ONLY** 🔒

#### Trigger Points:
- Bottone in alto a destra ("Custom")
- Riquadro tratteggiato grande sotto "My Routine" (quando non ci sono schede)
- Pulsante "+" nella lista schede

#### Architettura Modal:
**CreateWorkoutModal** (Nuova componente)
```
┌─────────────────────────────────────┐
│   [Nome Scheda] TextInput           │  ← Titolo della routine
├─────────────────────────────────────┤
│                                     │
│  ESERCIZI:                          │
│  ┌─────────────────────────────┐    │
│  │ [Esercizio 1]               │    │
│  │ Set 1: [Reps] [Intensità]   │    │
│  │ Set 2: [Reps] [Intensità]   │    │
│  │ [+ Add Set]                 │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ [Esercizio 2]               │    │
│  │ Set 1: [Reps] [Intensità]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  [+ Add Exercise]                   │ ← Apre ExerciseLibrary
│                                     │
├─────────────────────────────────────┤
│  [Annulla]  [Salva Scheda]          │
└─────────────────────────────────────┘
```

#### Flusso Dettagliato:
1. **Inizializzazione Modal**: Input per nome scheda in alto
2. **Aggiungi Esercizio**: Click `+ Add Exercise` → apre ExerciseLibrary
   - Seleziona esercizio → si aggiunge con 1 set vuoto
3. **Per Ogni Esercizio**: 
   - Nome esercizio (leggibile, non editabile)
   - List di Set con input fields:
     - `Reps` (numero)
     - `Intensità` (peso/% 1RM)
     - `Recupero` (secondi, opzionale)
   - Bottone `+ Add Set` → aggiunge nuovo set vuoto
4. **Salvataggio**: Click salva → insert in `workout_templates` + loop insert in `workout_exercises` + loop insert in `workout_sets`

#### Premium Gate:
```typescript
// Nel trigger handler:
if (!isPremium) {
  showPremiumPopup();
  return;
}
openCreateWorkoutModal();
```

### 3. Logica Schede Pubbliche e Gestione Premium
- Sotto la sezione "My Routine", se l'utente clicca su una delle schede pre-impostate (Pubbliche / Premium):
  - Deve scattare il controllo: "È un utente Premium?".
  - Se NO: Mostriamo il **Pop-Up Premium**.
  - Se SÌ: Lo facciamo accedere/salvare l'intero processo di creazione della scheda.

### 4. UI Dinamica per Tipologia di Serie (Set Types)
- Durante la creazione dell'allenamento, l'interfaccia deve adattarsi al tipo di set scelto.
- Esempio: Se l'utente seleziona "Cluster" o "Dropset", l'interfaccia deve mostrare campi aggiuntivi o diversi rispetto a quelli previsti per un set "Normale".

---

## Database Flow per Creazione Scheda All-in-One

Quando l'utente clicca **"Salva Scheda"** nel modal:

```
1. INSERT workout_templates {
     name: string,
     description: optional,
     profile_id: user_id,
     created_at: NOW()
   }
   → Restituisce template_id

2. FOR EACH esercizio nel modal:
   INSERT workout_exercises {
     template_id: template_id,
     exercise_id: selected_exercise_id,
     exercise_order: index,
     notes: optional
   }
   → Restituisce exercise_id

3. FOR EACH set di quell'esercizio:
   INSERT workout_sets {
     exercise_id: exercise_id,
     reps: number,
     weight_kg: number,  ← "Intensità"
     rest_seconds: number,
     set_type: 'normal' | 'cluster' | 'dropset' | ...
     set_order: index
   }

4. Refresh routine list → Torna a SchedeScreen
```

---

## Architecture Pattern - Code Organization

### Separation of Concerns per Mantenere Leggibilità

**SchedeScreen.tsx** (Container - ~80 righe)
- State: `isCreateOpen`, `isSubmitting`, `error`
- Query: templates list (già implementato)
- Handlers: `handleOpenCreate()`, `handleSaveWorkout()`
- Render: Loading | Error | List | CreateWorkoutModal

**hooks/useWorkoutCreation.ts** (Logic - ~60 righe)
- State: `exercises[]`, `currentIndexes`, `isSubmitting`
- Methods: `addExercise()`, `removeExercise()`, `updateSet()`, `addSet()`
- Validations: nome obbligatorio, almeno 1 esercizio, almeno 1 set per esercizio
- Return: { exercises, addExercise, removeExercise, updateSet, addSet }

**api/workoutService.ts** (Database - ~50 righe)
```typescript
export async function saveWorkout(userId, workoutData) {
  const { name, exercises } = workoutData;
  // 1. Insert workout_templates → template_id
  // 2. For each exercise: Insert workout_exercises → exercise_id
  // 3. For each set: Insert workout_sets with full data
  // 4. Return created template
}
```

**components/schede/CreateWorkoutModal.tsx** (UI - ~150 righe)
- Props: `visible`, `onClose`, `exercises`, `onAddExercise`, `onRemoveExercise`, `onUpdateSet`, `onAddSet`, `onSave`, `isPremium`
- Solo UI: Input fields, lista esercizi, lista sets
- Delega logica al parent (SchedeScreen tramite useWorkoutCreation)

### Vantaggi di questo Pattern
✅ SchedeScreen rimane leggibile e manutenibile
✅ Logica di workout separata → riusabile in altre schermate (edit, copy, etc.)
✅ Database operations testabili separatamente
✅ Modal non contiene logica, solo UI
✅ Facile aggiungere nuove feature (undo, draft save, etc.)

---