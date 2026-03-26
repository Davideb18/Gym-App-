# Workout Master Status e Piano Operativo

Ultimo aggiornamento: 2026-03-23
Documento canonico: questo file sostituisce la timeline separata.

## 1) Stato attuale

### Gia presente
- Libreria esercizi con filtri/sort e modal dettaglio.
- Tipi base in `shared/types.ts`:
  - `WorkoutTemplate`
  - `WorkoutTemplateExercise`
  - `PlannedSet`
  - `Workout`
  - `WorkoutSet`
- Tabelle gia presenti lato prodotto:
  - `workout_templates`
  - `workout_template_exercises`

### Gap da chiudere subito
- Aggiungere `workout_template_sets` (normalizzazione set pianificati).
- Aggiungere sessioni live:
  - `workout_sessions`
  - `performed_sets`
- Aggiungere analytics:
  - `pr_history`
  - opzionale `daily_exercise_stats` (aggregata)
- Applicare gating Free/Premium su UI + API + DB.

## 2) Obiettivo architetturale

Pipeline completa:

1. Builder scheda (template)
2. Definizione set pianificati per esercizio
3. Live tracking set reali durante il workout
4. Salvataggio storico sessioni
5. Calcolo PR
6. Grafici trend
7. Predizione carico per esercizio

## 3) Regole Free vs Premium

### Free
- Solo set base (`set_type = 'normal'`) con reps/rest e target peso opzionale.

### Premium
- `warmup`, `failure`, `dropset`, `backoff`, `cluster`, `myo_reps`, `rest_pause`.

### Enforcement obbligatorio
1. UI: lock e badge premium.
2. API/service: validazione pre-insert.
3. DB: trigger/policy che blocca set avanzati a utenti free.

## 5) Timeline unica (6 settimane)

### Settimana 1: Fondazioni dati
1. Migrazioni DB e indici.
2. RLS/policy sicurezza.
3. Tipi TS allineati al DB.

DoD:
1. CRUD base template/sessioni funzionante da test script.

### Settimana 2: Builder schede
1. Nuova scheda: nome, selezione esercizi, riordino.
2. Salvataggio su template + template exercises + template sets.
3. Edit/Delete e validazioni minime.

DoD:
1. Scheda persistita resta identica dopo restart app.

### Settimana 3: Tecniche intensita
1. Editor set avanzato.
2. Free: solo normal.
3. Premium: tutte le tecniche avanzate.
4. Validazione robusta UI + API + DB.

DoD:
1. Almeno 3 tecniche salvate e ricaricate correttamente.

### Settimana 4: Esecuzione workout live
1. Start da template.
2. Tracking set (peso/reps/rpe/rir/rest).
3. Chiusura sessione con summary volume/durata.

DoD:
1. Sessione completa rileggibile in cronologia.

### Settimana 5: Cronologia e grafici
1. Lista sessioni + dettaglio set.
2. Grafici base: volume settimanale, progressione carico, reps medie.
3. Filtri periodo 7/30/90 giorni.

DoD:
1. Almeno 2 trend chiari su dati reali.

### Settimana 6: Stabilizzazione
1. Test end-to-end flussi core.
2. Hardening rete/offline.
3. Rifinitura UX e pulizia codice.

DoD:
1. Nessun blocco critico nei flussi principali.

## 6) Predizione carico exercise-specific

Non globale, ma per esercizio.

Input principali:
1. Ultimi N set dello stesso esercizio (N >= 20 se disponibili).
2. e1RM storico (Epley/Brzycki).
3. Fatica recente (RPE medio 7/14 giorni).
4. Volume recente del gruppo muscolare.
5. Variabilita esercizio (es. spalle meno stabili, pressa piu stabile).

Output:
1. Peso suggerito set successivo.
2. Range reps suggerito.
3. Confidenza alta/media/bassa.

Rollout:
1. Fase 1: euristiche semplici.
2. Fase 2: regressione lineare su storico personale.
3. Fase 3: readiness giornaliera.

## 7) KPI minimi di successo

1. Tempo creazione scheda < 2 minuti.
2. Crash rate flussi workout = 0 in test interni.
3. 95% sessioni salvate senza errori.
4. Cronologia caricata < 2 secondi su dataset medio.

## 8) Checklist operativa immediata

1. Creare migration SQL con 4 tabelle nuove + indici.
2. Applicare RLS e policy base.
3. Aggiornare `shared/types.ts` con `workout_template_set`, `workout_session`, `performed_set`, `pr_record`.
4. Refactor `workoutService` per CRUD template + sets normalizzati.
5. Implementare Builder manuale.
6. Implementare Live Tracking.
7. Implementare PR detection post-workout.
8. Implementare cronologia e grafici base.

## 9) Definition of Done MVP

1. Creazione scheda manuale con set multipli e persistenza corretta.
2. Workout completo con salvataggio set-by-set.
3. Cronologia sessioni con dettaglio completo.
4. Almeno due grafici funzionanti.
5. Rilevamento PR automatico.
6. Enforcement Free/Premium reale su UI + DB.
