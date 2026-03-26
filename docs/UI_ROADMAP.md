# ROADMAP UI - SCHERMATA ALLENAMENTO E "MY ROUTINE"

## Obiettivi Concordati

### 1. Pulizia del "Main Screen" (`SchedeScreen.tsx`)
- Risolvere eventuali problemi grafici o sovrapposizioni attuali.

### 2. Flusso di Creazione Scheda (All-in-One Modal)

#### Trigger Points:
- Pulsante "+" principale nella schermata delle schede (o riquadri vuoti).
- **ATTENZIONE**: Il pulsante "+" NON deve aprire un piccolo riquadro per inserire solo Nome e Descrizione. Deve aprire DIRETTAMENTE la modale Full-Screen di creazione della scheda completa.

#### Architettura Modal Formazione Scheda (Stile Hevy/Strong):
La modale di creazione scheda include tutto il necessario in un'unica schermata.
- **Header**: Nome Scheda (TextInput) e Descrizione (TextInput) all'inizio.
- **Sezione Statistiche (Futuro)**: 
  - Durata stimata dell'allenamento.
  - Omino anatomico (mappa muscolare) con i muscoli coinvolti colorati in base agli esercizi inseriti.
- **Lista Esercizi**:
  - Elenco dinamico degli esercizi aggiunti.
  - Per ogni esercizio aggiunto: elenco dei Set (Serie, Ripetizioni, Peso, Recupero).
- **Aggiunta Esercizi**: 
  - Bottone `+ Add Exercise` che apre la libreria degli esercizi (`ExerciseLibrary`).
  - Nella libreria: ogni esercizio ha un bottone `+` per essere aggiunto direttamente alla scheda, oppure cliccandoci si apre il dettaglio per vederne l'esecuzione.

#### Gestione Tecniche d'Intensità e Premium:
- Ogni set può avere una "Tecnica di Intensità" (es. Drop Set, Rest Pause, Cluster, etc.).
- Le tecniche d'intensità avanzate sono bloccate dietro il **Premium**.
- **UI Premium**: Le tecniche bloccate devono essere VISIBILI nell'elenco a tendina o nei bottoni, ma contraddistinte da una grafica dedicata (es. icona lucchetto, colore diverso, badge "Premium").
- **Flusso Popup**: Se l'utente preme su una tecnica d'intensità Premium (e non è abbonato), si apre il **Pop-up Premium** (che in futuro gestirà i pagamenti). La funzione non si attiva finché non viene sbloccato l'abbonamento.

#### Flusso Dettagliato:
1. **Apertura Modale**: L'utente preme "+" → Si apre a schermo intero il form vuoto della scheda.
2. **Compilazione Base**: L'utente inserisce Titolo e Descrizione (opzionale).
3. **Selezione Esercizi**: L'utente preme `+ Add Exercise`, si apre l'ExerciseLibrary. Clicca il `+` di fianco all'esercizio desiderato.
4. **Configurazione Set**: 
   - L'esercizio appare nella scheda. Si inseriscono le Reps, i Kg e il Recupero.
   - Si sceglie la tecnica. Se è Premium e l'utente è Free -> Popup Premium.
5. **Salvataggio Globale**: L'utente preme "Salva Scheda" → Tutti i dati (Template, Esercizi, Set) vengono inviati in un'unica transazione/salvataggio al database.

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