# Timeline Completa - Sistema Schede, Cronologia e Grafici

## Obiettivo
Portare a termine in modo completo il modulo allenamento dell'app:
- creazione schede
- tecniche di intensita
- salvataggio storico allenamenti
- dashboard cronologia con grafici
- rifinitura UX e rilascio

## Regole Piano Free vs Premium (vincolo prodotto)
- **Free:** può usare solo set base con `reps` e `rest_time_seconds` (tempo recupero).
- **Premium:** sblocca tecniche di intensita avanzate (`dropset`, `rest_pause`, `myo_reps`, `cluster`, `backoff`, `failure`, ecc).
- Tutti i flussi (UI + API + DB) devono rispettare questo gating lato prodotto.

## Orizzonte Temporale
Timeline consigliata: **6 settimane** (con margine realistico per test/fix).

---

## Settimana 1 - Fondazioni Dati e Architettura
### Obiettivo
Mettere basi solide su DB e tipi TypeScript per evitare refactor dolorosi dopo.

### Task
- Allineare schema Supabase per:
  - `workout_templates`
  - `workout_template_exercises`
  - `workouts`
  - `workout_sets`
- Definire/validare tipo `planned_sets` per supportare tecniche di intensita.
- Aggiungere campi mancanti in `shared/types.ts`.
- Scrivere migration SQL versionata in `docs/sql/`.
- Definire policy RLS per lettura/scrittura per utente autenticato.

### Deliverable
- Schema DB stabile + tipi TS allineati.
- Nessun errore TypeScript su modelli dati.

### Definition of Done
- CRUD base su template e sessioni funzionante da script test.

---

## Settimana 2 - Builder Schede (UI + Salvataggio)
### Obiettivo
Permettere creazione/modifica scheda con ordine esercizi e set pianificati.

### Task
- Schermata "Nuova Scheda" con:
  - nome scheda
  - selezione esercizi dalla library
  - riordino esercizi
- Salvataggio su `workout_templates` + `workout_template_exercises`.
- Edit/Delete scheda.
- Validazioni minime (nome obbligatorio, almeno 1 esercizio).

### Deliverable
- Flow completo: crea -> salva -> riapri -> modifica -> elimina.

### Definition of Done
- Una scheda persistita resta invariata dopo restart app.

---

## Settimana 3 - Tecniche di Intensita
### Obiettivo
Supportare davvero il motore avanzato delle serie.

### Task
- Editor set per ogni esercizio con supporto:
  - **Free:** `normal` (set/reps/rest)
  - **Premium:** `warmup`, `failure`, `dropset`, `backoff`, `cluster`, `myo_reps`, `rest_pause`
- Configurazione parametri specifici (es. `dropset_reductions`, `rir`, `rest_time_seconds`).
- UI intelligente (mostra solo i campi pertinenti alla tecnica selezionata).
- Serializzazione sicura del piano set in `planned_sets`.
- Gating esplicito in UI: badge/lock e messaggio upgrade per funzioni Premium.
- Validazione lato backend/DB: utenti Free non possono salvare set avanzati anche se manipolano la UI.

### Deliverable
- Scheda avanzata configurabile per utente powerlifting/bodybuilding.

### Definition of Done
- Almeno 3 tecniche diverse salvate e ricaricate correttamente da DB.

---

## Settimana 4 - Esecuzione Workout + Logging Reale
### Obiettivo
Eseguire scheda in sessione live e salvare cronologia reale.

### Task
- Schermata "Start Workout" da template.
- Timer rest (base) + input peso/reps/RPE o RIR per set.
- Salvataggio sessione in:
  - `workouts`
  - `workout_sets`
- Chiusura workout con summary (volume totale, durata, note).

### Deliverable
- Primo storico reale popolato da allenamenti utente.

### Definition of Done
- Sessione completa registrata e rileggibile in cronologia.

---

## Settimana 5 - Pagina Cronologia + Grafici
### Obiettivo
Trasformare i dati storici in insight leggibili.

### Task
- Schermata cronologia allenamenti (lista sessioni + dettagli).
- Grafici base:
  - volume settimanale
  - progressione carico per esercizio
  - reps medie nel tempo
- Filtri periodo: 7d / 30d / 90d.
- Empty states e loading states curate.

### Deliverable
- Dashboard cronologia utile e leggibile su mobile.

### Definition of Done
- Utente vede trend chiari su almeno 2 metriche reali.

---

## Settimana 6 - Stabilizzazione, QA e Rifinitura
### Obiettivo
Portare tutto a livello produzione (no demo fragile).

### Task
- Test end-to-end principali:
  - crea scheda
  - esegui workout
  - salva storico
  - visualizza grafico
- Hardening error handling rete/offline.
- Migliorie UX finali (feedback, animazioni, microcopy).
- Pulizia codice e componentizzazione.
- Aggiornamento documentazione tecnica.

### Deliverable
- Feature pronta per rollout controllato.

### Definition of Done
- Nessun blocco critico nei flussi core.
- TypeScript pulito e flussi principali testati.

---

## Backlog Post-Rilascio (Step 2)
- PR automatici (stima 1RM, suggerimenti carico).
- Algoritmo adattivo progressivo per overload.
- Caching/offline-first delle sessioni.
- Export PDF/CSV cronologia.
- Condivisione schede tra utenti.

---

## Dipendenze Critiche
- RLS Supabase corrette su tutte le tabelle workout.
- Coerenza tra `shared/types.ts` e schema SQL.
- Design decision su libreria grafici (es. `react-native-svg` + chart lib).
- Regole centralizzate piano utente (`isPremium`) condivise tra frontend e backend.

---

## KPI Minimi di Successo
- Tempo creazione scheda < 2 minuti.
- Crash rate nei flussi workout = 0 in test interni.
- 95% delle sessioni salvate senza errori.
- Pagina cronologia caricata < 2 secondi su dataset medio.
