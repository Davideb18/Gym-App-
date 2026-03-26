# 📝 TODO E NOTE FUTURE - THE LAB PRO

Questo file funge da "promemoria" continuo per lo sviluppo futuro.

---

## 1. 🏋️ DATABASE ESERCIZI (Lancio App & Feat. Premium)
Attualmente usiamo un DB provvisorio (12 esercizi perfetti per testare la UI).
- [ ] **Azione per la pubblicazione finale:** Attivare il piano "TESTING ($5/mo)" su MuscleWiki solo per la finestra di import.
- [ ] Eseguire uno script `Node.js` dal backend per fare il fetch ufficiale dei 500+ esercizi e salvarli su Supabase.
- [ ] **TRADUZIONI AI (i18n):** Scrivere uno script automatico (es. con DeepL o OpenAI) per tradurre tutte le descrizioni e i nomi degli esercizi in Italiano e Spagnolo, salvando i dati su Supabase senza farlo a mano.
- [ ] **Dopo l'import completo:** chiudere/disdire l'abbonamento MuscleWiki (non deve restare attivo in modo permanente).
- [ ] **IMPORTANTE - DATI AGGIUNTIVI:** Quando faremo il fetch col piano Testing, dovremo estrarre anche i parametri Premium (riportati dalla loro doc) e mapparli nelle tabelle Supabase: 
  - `difficulty` (novice, intermediate, advanced)
  - `mechanic` (isolation, compound)
  - `force` (push, pull, static)
  - Inserirli in `shared/types.ts` e aggiungere le colonne tramite ALTER TABLE nel database.
- [ ] **Video Unbranded:** Assicurarsi che lo script peschi dall'endpoint `/stream/videos/unbranded/{filename}` invece che branded, per scaricare video fluidi e SENZA loghi di terzi.
- [ ] **Fix UI immagini ExerciseLibrary (nota tecnica):** ora in app vediamo avatar fallback perché le URL dirette `musclewiki.com/media/...` possono fallire (Cloudflare/hotlink). Durante l'import definitivo dobbiamo salvare le immagini in `Supabase Storage` (bucket pubblico tipo `exercise-assets`) e scrivere in `exercises.image_url` il link del bucket, così a sinistra compaiono le preview reali.

### ✅ Approccio consigliato (completo, economico, sicuro, low-sbatti)
- [ ] **Fase 1 - Import una tantum:** tenere attivo MuscleWiki solo il tempo necessario per importare e normalizzare i dati su Supabase.
- [ ] **Fase 2 - Testo sempre su DB:** conservare in `public.exercises` tutti i campi testuali/tecnici (nome, muscolo, difficoltà, istruzioni, equipment, ecc).
- [ ] **Fase 3 - Immagini locali:** scaricare immagini durante import e caricarle su `Supabase Storage` (`exercise-assets/images/...`), poi usare solo URL Supabase nel frontend.
- [ ] **Fase 4 - Video economici:** inizialmente NON copiare tutti i video su Storage (costo alto). Salvare `video_url` esterno o usare proxy leggero.
- [ ] **Fase 5 - Sicurezza chiavi:** `SERVICE_ROLE` solo backend/edge function; frontend solo con `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] **Fase 6 - Policy/RLS:** mantenere policy minime: lettura pubblica per libreria esercizi, scrittura solo da backend con service role.
- [ ] **Fase 7 - Ottimizzazione costi futura:** copiare su Storage solo i video più usati (cache on-demand), basandosi su utilizzo reale.

---

## 2. 💡 NUOVE FUNZIONALITÀ DA IMPLEMENTARE NELL'APP (Basate sui dati)
Sfruttando le variabili descritte sopra, implementare in futuro queste sezioni logiche:
- [ ] **Smart Filters:** Aggiungere i filtri "Principiante/Avanzato" e "Push/Pull" per la ricerca allenamenti.
- [ ] **Generatore Schede / Try Something New:** Replicare localmente o chiamare dal db un algoritmo `/random` che offra variazioni casuali a chi è stanco del solito allenamento.
- [ ] **Ricerca Full-Text:** Modificare o aggiungere una ricerca Postgres che permetta di trovare la barra di ricerca anche se un utente digita parole contenute "dentro le istruzioni" (Es. "panca declinata").
- [ ] **Statistiche Avanzate Creazione Scheda (Premium):** Mostrare durata stimata e omino anatomico dei muscoli coinvolti nella scheda durante la sua configurazione.

---

## 3. 🔐 SICUREZZA DATI (Pericolo Leak)
Attenzione alla gestione delle chiavi di ambiente in produzione!
- [ ] **Regola del doppio ambiente:** Mantenere sempre separato il `.env` del Frontend dal `.env` del Backend.
- [ ] NON inserire per nessun motivo la chiave `SERVICE_ROLE` di Supabase all'interno della cartella Frontend (`/frontend`). Inserire questa chiave comporterebbe esporla al pbblico in bundle con l'APK/IPA dell'App.
- [ ] Nel frontend deve esserci **solo** la chiave `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Pubblica) ed ogni azione dovrà essere regolata esclusivamente dalle Policy RLS lato Supabase.

### 🔄 Refactoring e Pulizia Database
- [ ] **Eliminare le tabelle legacy (workouts, sets):** Questo va fatto **solo dopo** aver completato tutto il refactoring del frontend (`workoutService.ts`) e aver verificato che gli utenti (se ce ne fossero già) poggino tutti la loro logica sul nuovo modello a 6 tabelle (`workout_templates`, `workout_sessions`, `performed_sets`, etc). Quando il passaggio sarà completato e collaudato, eseguire un bel `DROP TABLE workouts CASCADE;` e `DROP TABLE sets CASCADE;` da Supabase per tenere il backend pulito.

---

## 4. 🔑 LOGIN E AUTENTICAZIONE
Le funzionalità di autenticazione sono basate su Expo Auth Session, ma richiedono attenzioni per il build reale.
- [ ] **Configurazione OAuth (Google/Apple OAuth):** Il sistema attuale genera un reindirizzamento `exp://` che funziona bene dentro Expo Go. Prima della pubblicazione in app store standalone (`.apk`, `.aab`, o TestFlight), bisognerà registrare gli **App ID ufficiali** o gli URI Scheme personalizzati (es: `thelabfit://`) sia dentro `app.json` sia nei pannelli Cloud di Google e Apple (altrimenti l'apertura tramite social login tornerà schermate bianche o di errore sul telefono reale).
- [ ] **Flusso Email/Password:** Controllare il processo di Re-indirizzamento sulle email di Reset-Password. Quando Supabase invia il link via mail, deve puntare al custom Scheme Nativo per far "risvegliare" l'app dalla posta in arrivo. 
- [ ] Scrivere e testare gli interceptor per far "scadere" e "rinnovare" il token (refreshToken logic) dolcemente, per non scollegare di colpo gli utenti nel bel mezzo di un allenamento.

---

## 5. ✅ Follow-up Immediati (Marzo 2026)
- [x] **Fix FK `workout_templates.profile_id`:** backfill profili mancanti in `public.profiles` da `auth.users`.
- [x] **Trigger auto-profilo:** creato `on_auth_user_created_profile` su `auth.users` per inserire automaticamente riga in `public.profiles`.
- [x] **Fix warning SecureStore (>2048 bytes):** migration storage sessione Supabase da SecureStore a AsyncStorage in `frontend/src/api/supabaseClient.ts`.
- [ ] **Verifica manuale post-fix auth storage:** riavviare Expo, fare logout/login e confermare che il warning SecureStore non compare più.
- [ ] **Hardening trigger profilo:** valutare trigger anche su update email/user_metadata (non solo insert) per mantenere `profiles` allineata.
- [ ] **Pulizia tabelle legacy:** rinominare `workouts` e `sets` in `*_legacy_20260326`, testare app 2-3 giorni, poi drop definitivo solo se zero regressioni.
- [ ] **Audit dipendenze frontend:** valutare `npm audit` e applicare fix non-breaking prima della release.

