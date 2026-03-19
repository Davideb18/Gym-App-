# 🧠 Gym App Architecture: Frontend, Backend, and Shared

Per collaborare al meglio, è fondamentale capire come "parlano" tra loro le tre parti principali del progetto. Immagina l'app come un ristorante:

---

### 1. Frontend (L'App Mobile)
**Ruolo**: È il cameriere e il menu. È quello che l'utente vede e tocca.
- **Cosa fa**: Gestisce i pulsanti, i grafici, le animazioni e l'inserimento dei dati (reps, peso, esercizi).
- **Compito speciale**: Comunica direttamente con **Supabase** per il Login (Auth) e per caricare/scaricare i dati più semplici in tempo reale.

### 2. Backend (Il Server API)
**Ruolo**: È lo chef in cucina. Fa il lavoro pesante e intelligente.
- **Cosa fa**: Gestisce la logica complessa che non vogliamo far pesare sul telefono (es. intelligenza artificiale per generare schede, calcoli statistici avanzati, sincronizzazione profili).
- **Compito speciale**: Usa **Prisma** per parlare con il Database (PostgreSQL) e salvare i dati in modo strutturato e sicuro.

### 3. Shared (Il Contratto)
**Ruolo**: È la lingua comune parlata da cameriere e chef.
- **Cosa fa**: Contiene solo "Tipi" (interfacce). Definisce come deve essere fatto un oggetto (es. un Esercizio deve avere un nome e un gruppo muscolare).
- **Perché serve**: Serve a evitare errori. Se lo chef (backend) prepara un piatto che il cameriere (frontend) non riconosce, il ristorante chiude (l'app crasha).

---

## 💡 Esempi Pratici per la nostra Gym App

### Esempio A: Salvare una Serie (Set) in un Allenamento
1.  **Shared**: Nel file [shared/types.ts](file:///Users/davide/Desktop/Personal_project/Gym%20App/shared/types.ts) diciamo che un [Set](file:///Users/davide/Desktop/Personal_project/Gym%20App/shared/types.ts#9-15) ha sempre `reps` (numero) e `weight` (numero).
2.  **Frontend**: L'utente inserisce "12 reps x 80kg". L'app controlla che siano numeri (come dice lo *Shared*) e li manda al Backend.
3.  **Backend**: Riceve i dati, calcola il massimale teorico (1RM) e lo salva stabilmente nel Database principale usando *Prisma*.

### Esempio B: Creazione del Profilo Utente
1.  **Frontend**: L'utente si registra tramite la schermata di Login (comunica con Supabase).
2.  **Backend**: Una volta loggato, l'app chiama il backend (`/sync`). Il backend prende l'ID dell'utente e crea "lo spazio" nel nostro database Prisma per salvare i suoi futuri allenamenti.

### Esempio C: Generazione AI di una Scheda (In futuro)
1.  **Frontend**: Tu premi "Genera Scheda AI".
2.  **Backend**: Lo chef (backend) contatta un servizio di AI, elabora la scheda perfetta e la rispedisce al cameriere (frontend) nel formato esatto (Workout) definito nello *Shared*.

---

### In Breve:
- Se vuoi cambiare un **bottone** o una **schermata** ➡️ Vai nel `frontend/`.
- Se vuoi cambiare **come viene calcolato un dato** o **salvato nel DB** ➡️ Vai nel `backend/`.
- Se vuoi aggiungere un **nuovo campo** (es. aggiungere il "RPE" a un Set) ➡️ Prima aggiungilo nello `shared/`, così sia frontend che backend sapranno di cosa parli.
