# 🛠️ Guida all'uso di Supabase (Direct Mode)

Ora che abbiamo rimosso il backend "pesante", gestirai tutto dal pannello di Supabase, esattamente come facevi con Appwrite. Ecco come muoverti:

## 1. Pulizia Database (Rimuovere Prisma)
Per togliere le tabelle "spazzatura" create da Prisma (come `_prisma_migrations`), esegui questo script nello **SQL Editor** di Supabase:

```sql
-- Rimuove la tabella delle migrazioni di Prisma
DROP TABLE IF EXISTS "_prisma_migrations";

-- Rimuove eventuali tabelle vecchie se vuoi ripartire pulito 
-- (ATTENZIONE: cancella i dati se presenti!)
-- DROP TABLE IF EXISTS "Set";
-- DROP TABLE IF EXISTS "Workout";
-- DROP TABLE IF EXISTS "User";
```

---

## 2. Come guardare i dati (Dashboard)
D'ora in poi userai queste sezioni del sito di Supabase:

### 📊 Table Editor (Il tuo Spreadsheet)
*   **A cosa serve**: È come Excel o la tabella di Appwrite.
*   **Cosa fai**: Clicca sull'icona della tabella a sinistra. Qui vedi la tabella `User`, `Workout`, ecc. Puoi aggiungere righe a mano, modificarle o cancellarle cliccando due volte sulle celle.

### 🔐 Authentication (Gestione Utenti)
*   **A cosa serve**: Vedere chi si è registrato.
*   **Cosa fai**: Clicca sull'icona dell'omino. Qui vedi le email, l'ultimo accesso e puoi resettare le password o cancellare gli utenti manualmente.

### 📝 SQL Editor (Il tuo telecomando)
*   **A cosa serve**: Per fare modifiche "strutturali" (come lo script del Trigger che ti ho dato).
*   **Cosa fai**: Incolli il codice SQL e premi "Run". È molto più veloce che creare tabelle a mano se hai tanti campi.

---

## 3. La "Regola d'Oro" della Sicurezza (RLS)
Senza un backend che controlla tutto, devi usare le **Policies (RLS)**:
1.  Vai su **Database** -> **Policies**.
2.  Per ogni tabella, devi dire: *"L'utente può leggere solo se il suo ID è uguale a quello della riga"*.
3.  Supabase ha dei "Template" già pronti (clicca su "New Policy" -> "Get started quickly").

**Esempio per la tabella User:**
*   `USING (auth.uid() = id)` -> Questo impedisce a un utente di spiare i dati di un altro.

---

## 🚀 Prossimo Passo
Appena hai pulito il DB con lo script sopra, la tua "casa" Supabase è pronta. Ora ogni volta che l'App farà `supabase.from('User').insert(...)`, vedrai apparire magicamente la riga nel **Table Editor**.
