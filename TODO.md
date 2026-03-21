# 📝 TODO E NOTE FUTURE - THE LAB PRO

Questo file funge da "promemoria" continuo per lo sviluppo futuro.

---

## 1. 🏋️ DATABASE ESERCIZI (Lancio App & Feat. Premium)
Attualmente usiamo un DB provvisorio (12 esercizi perfetti per testare la UI).
- [ ] **Azione per la pubblicazione finale:** Prima di lanciare l'app sui dispositivi, attivare il piano "TESTING ($5/mo)" su MuscleWiki.
- [ ] Eseguire uno script `Node.js` dal nostro backend per fare il fetch ufficiale di tutti i 500+ esercizi.
- [ ] Subito dopo l'importazione massiva su Supabase, chiudere/disdire l'abbonamento MuscleWiki.
- [ ] **IMPORTANTE - DATI AGGIUNTIVI:** Quando faremo il fetch col piano Testing, dovremo estrarre anche i parametri Premium (riportati dalla loro doc) e mapparli nelle tabelle Supabase: 
  - `difficulty` (novice, intermediate, advanced)
  - `mechanic` (isolation, compound)
  - `force` (push, pull, static)
  - Inserirli in `shared/types.ts` e aggiungere le colonne tramite ALTER TABLE nel database.
- [ ] **Video Unbranded:** Assicurarsi che lo script peschi dall'endpoint `/stream/videos/unbranded/{filename}` invece che branded, per scaricare video fluidi e SENZA loghi di terzi.

---

## 2. 💡 NUOVE FUNZIONALITÀ DA IMPLEMENTARE NELL'APP (Basate sui dati)
Sfruttando le variabili descritte sopra, implementare in futuro queste sezioni logiche:
- [ ] **Smart Filters:** Aggiungere i filtri "Principiante/Avanzato" e "Push/Pull" per la ricerca allenamenti.
- [ ] **Generatore Schede / Try Something New:** Replicare localmente o chiamare dal db un algoritmo `/random` che offra variazioni casuali a chi è stanco del solito allenamento.
- [ ] **Ricerca Full-Text:** Modificare o aggiungere una ricerca Postgres che permetta di trovare la barra di ricerca anche se un utente digita parole contenute "dentro le istruzioni" (Es. "panca declinata").

---

## 3. 🔐 SICUREZZA DATI (Pericolo Leak)
Attenzione alla gestione delle chiavi di ambiente in produzione!
- [ ] **Regola del doppio ambiente:** Mantenere sempre separato il `.env` del Frontend dal `.env` del Backend.
- [ ] NON inserire per nessun motivo la chiave `SERVICE_ROLE` di Supabase all'interno della cartella Frontend (`/frontend`). Inserire questa chiave comporterebbe esporla al pbblico in bundle con l'APK/IPA dell'App.
- [ ] Nel frontend deve esserci **solo** la chiave `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Pubblica) ed ogni azione dovrà essere regolata esclusivamente dalle Policy RLS lato Supabase.

---

## 4. 🔑 LOGIN E AUTENTICAZIONE
Le funzionalità di autenticazione sono basate su Expo Auth Session, ma richiedono attenzioni per il build reale.
- [ ] **Configurazione OAuth (Google/Apple OAuth):** Il sistema attuale genera un reindirizzamento `exp://` che funziona bene dentro Expo Go. Prima della pubblicazione in app store standalone (`.apk`, `.aab`, o TestFlight), bisognerà registrare gli **App ID ufficiali** o gli URI Scheme personalizzati (es: `thelabfit://`) sia dentro `app.json` sia nei pannelli Cloud di Google e Apple (altrimenti l'apertura tramite social login tornerà schermate bianche o di errore sul telefono reale).
- [ ] **Flusso Email/Password:** Controllare il processo di Re-indirizzamento sulle email di Reset-Password. Quando Supabase invia il link via mail, deve puntare al custom Scheme Nativo per far "risvegliare" l'app dalla posta in arrivo. 
- [ ] Scrivere e testare gli interceptor per far "scadere" e "rinnovare" il token (refreshToken logic) dolcemente, per non scollegare di colpo gli utenti nel bel mezzo di un allenamento.

