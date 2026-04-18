# 📝 Project TODOs: The Lab Gym App

Checklist di sviluppo per portare l'applicazione alla release ufficiale e oltre.

---

## 🎯 Priorità Immediate

### 🏁 Preparazione al Lancio (Apple Store)

- [ ] **Asset Grafici**: Creazione icone in tutte le risoluzioni e Splash Screen con logo "The Lab".
- [ ] **Bundle ID & Provisioning**: Configurazione identificatori ufficiali su Apple Developer Portal.
- [ ] **Legal**: Creazione Privacy Policy e Terms of Service (necessari per il login).
- [ ] **Licenses In-App**: Creare una schermata "Licenze" nell'app con attribuzioni media e testo licenze open-source principali.
- [ ] **License Audit Completo**: Verificare compatibilita/obblighi di tutte le dipendenze NPM e degli asset esterni (attribution, NOTICE, eventuale share-alike).

### 🏋️ Ecosistema Esercizi (Libreria Cloud)

- [ ] **Database Open-Source**: Importare un dataset di esercizi di alta qualità con licenza libera (es. `free-exercise-db`).
- [ ] **Media Hosting**: Caricare le GIF/Video su Supabase Storage o un CDN dedicato (niente più proxy backend).
- [ ] **Smart Filters**: Implementare filtri per muscolo, equipaggiamento e difficoltà (Novizio, Intermedio, Avanzato).

---

## 🚀 Sviluppo Feature Premium

### 💰 Monetizzazione & Paywall

- [ ] **Integrazione Provider**: Implementare RevenueCat o Stripe per la gestione degli abbonamenti.
- [ ] **Premium UI**: Realizzare il modale dei piani con tabella comparativa.
- [ ] **Gating Feature**: Associare `is_premium` dal profilo utente per sbloccare limiti (es. schede illimitate).

### 🤖 AI Pose Estimation (Killer Feature)

- [ ] **Video Analysis**: Implementare l'invio di frame al backend per l'analisi dell'angolo di esecuzione (Squat, Panca, ecc.).
- [ ] **Real-Time Feedback**: Mostrare correzioni visive sulla fotocamera mentre l'utente esegue l'esercizio.

---

## 🫂 Social & Gamification

### 📈 Progressione (XP System)

- [ ] **XP Engine**: Calcolare punti esperienza basati su Volume totale e Costanza.
- [ ] **Gradi Animati**: Visualizzare badge dinamici (Gorilla, Lion, Rhino) nel profilo.

### 👥 Community

- [ ] **Workout Sharing**: Generare link condivisibili per scambiarsi le schede d'allenamento.
- [ ] **Social Feed**: Visualizzare gli allenamenti completati dagli amici (stile Strava/Hevy).

---

## 🔐 Sicurezza & Man manutenzione

- [ ] **OAuth Hardening**: Registrare gli URI Scheme ufficiali per il login con Google/Apple su build standalone.
- [ ] **Refresh Token logic**: Assicurarsi che la sessione non scada durante un workout lungo.
- [ ] **Audit Dipendenze**: `npm audit` periodico per prevenire vulnerabilità nel frontend.
