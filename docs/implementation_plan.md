# Architettura e Roadmap della "Fase 2" dell'App

Abbiamo appena completato in pieno e con successo la **UI ROADMAP Fase 1** per la costruzione della scheda in quel grande modale (All-In-One Form).
L'errore TypeScript dei tipi che vedevi è stato corretto al volo ed expo non dovrebbe darti più problemi.

Ora dobbiamo prepararci alla "Fase 2", che è il nodo cruciale dell'app, ovvero il player di allenamento. Prima di quello dobbiamo sistemare i bug da te suggeriti.

Ecco il piano lento, ragionato e step-by-step per affrontare i tuoi audio:

## User Review Required

> [!IMPORTANT]
> - Prima di iniziare a programmare ti serve approvare questa mappa mentale, specialmente per il punto 3 sul Live Workout.
> - Fammi sapere se vuoi dividere le modifiche in due blocchi (es: Prima sistemiamo il backend e il bottone, e POI attacchiamo il colossale Live Workout).

---

## 🏗 STEP 1: Sistemazione del Backend e Filtro Utenti

Nel database potremmo avere decine di migliaia di schede di altri utenti. Attualmente tu le stai scaricando tutte.

#### [MODIFY] `frontend/src/api/workoutService.ts`
- Modificheremo `getTemplates()` aggiungendo `.eq('profile_id', userId)` nella query Supabase. In questo modo il telefono scaricherà **solo** le schede del profilo attualmente loggato. Una sicurezza assoluta.
- Applicheremo la stessa validazione alle chiamate per la cancellazione e la modifica (così nessuno può cancellare schede di altri inviando richieste false).

## 🏗 STEP 2: Il bottone "+ Crea Scheda" sempre Visibile e Gating Premium

Attualmente, se hai raggiunto le 4 schede (Limite Free), Nascondiamo il bottone gigante. Sotto tuo saggio consiglio, cambieremo questo comportamento per favorire la conversione Premium.

#### [MODIFY] `frontend/src/screens/Main/SchedeScreen.tsx`
- Rimuoveremo la logica che nasconde il riquadro "Aggiungi Scheda". Il riquadro ci sarà sempre.
- Nel `handleOpenCreate()`, inseriremo un controllo: 
  - *L'utente è Free e ha >= 4 schede?* → Invece che aprire la modale `CreateRoutineModal`, esce il **Pop-Up Premium** con sfondo scuro che gli dice "Sblocca le schede infinite".
  - *L'utente non ha raggiunto il limite?* → Si apre la modale di creazione.

## 🏗 STEP 3: Il Flusso di Avvio dell'Allenamento (Live Player) 🚀

Questo è il componente più massiccio da creare. Il flusso sarà diviso in due macro-fasi, l'**Analisi** e l'**Esecuzione**.

### 3.1 La Schermata di Anteprima (Workout Preview)
Quando tu cliccherai su una tua "Routine" nella home (invece che tenere premuto per eliminarla o entrarci in modo strano), si aprirà una Modale (o Schermata intera).
#### [NEW] `WorkoutPreviewScreen.tsx` (o Modal)
- Apparirà la scheda riassunta.
- **Pulsante "Modifica"**: Riaprirà `CreateRoutineModal` (quello che abbiamo faticosamente costruito in questi giorni) passandogli dentro i dati della scheda per editarla/cambiarla.
- **Pulsante Gigante "AVVIA ALLENAMENTO ⚡"**: Sarà in fondo alla pagina per far iniziare a tutti gli effetti la sessione Live.

### 3.2 Il Live Workout Player State Manager
#### [NEW] `frontend/src/hooks/useActiveWorkout.ts`
Un hook speciale che sarà il "motore" in background. Conterrà:
- Il tempo trascorso globale (`workoutDuration`).
- L'allenamento che stai facendo, con lo stato di ogni set (`completed: boolean`).
- Cronometro per le pause "Rest Timer". Se riposi 90 secondi, l'app sa contare.
- Funzione generatrice: andrà a pescare i chili che avevi usato precedentemente in questo esercizio per dirti "La settimana scorsa hai fatto 80kg".

### 3.3 L'Interfaccia Live (Mini e Maxi)
#### [NEW] `ActiveWorkoutScreen.tsx`
- Come in Hevy o Strong, qui vedrai la lista scorrevole degli esercizi, e accanto ad ogni Set avrai le spunte cliccabili (Checkbox verde) per confermare il completamento della serie.
- Avremo un bottone globale in basso rosso/blu con scritto "Termina Spingendo al Limite".
- **Mini-Player (PiP)**: Se premo la freccia indietro perché voglio cambiare canzone su Spotify o guardare un vecchio grafico, il timer e l'allenamento scendono in una piccola "Barra fluttuante" in basso, sopra la BottomTab, in modo che tu non perda la sessione e possa riaprirla toccandola.

---

## Open Questions

> [!CAUTION]
> 1. Sei d'accordo sul fatto che la **Anteprima della Scheda** sia una Modale dal basso, prima di premere l'effettivo "Avvia Allenamento"?
> 2. L'errore TypeScript di cui parlavi è già stato patchato 1 secondo fa ma per cominciare ad implementare tutto ciò (STEP 1 e 2 per cominciare), posso avere la tua approvazione con un "Vai col backend"?
