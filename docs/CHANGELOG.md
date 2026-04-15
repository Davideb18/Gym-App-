# 🚀 Changelog: The Lab Gym App

Tutte le modifiche e gli aggiornamenti del progetto, dai miglioramenti estetici alla messa in sicurezza dell'infrastruttura.

---

## [2026-04-15] - Security Overhaul & AI-Ready Infrastructure 🛡️
**Messa in sicurezza e preparazione per il futuro AI.**

### 🔐 Sicurezza e API
- **Rotazione Chiavi Supabase**: Migrazione completa dal sistema "Legacy" alle nuove **Project API Keys** (`sb_publishable` e `sb_secret`).
- **Protezione Environment**: Configurato `.gitignore` per escludere permanentemente i file `.env` ed eliminati i file sensibili dalla cronologia Git.
- **JWT Update**: Aggiornato il segreto JWT per garantire l'integrità delle sessioni utente.

### 🧹 Cleanup Totale
- **Rimozione MuscleWiki**: Eliminata ogni traccia dell'integrazione instabile (proxy backend, servizi frontend, script di migrazione).
- **Consolidamento Documentazione**: Unificata tutta la documentazione nella cartella root `/docs`, eliminando `frontend/docs/` e file obsoleti.
- **Pulizia Tipi**: Rimosso `musclewiki_id` da ogni interfaccia e tabella del database.

### 🤖 Backend AI-Ready
- **Semplificazione Backend**: Il backend Node.js è stato ridotto a un motore minimale per calcoli futuri.
- **Pose Estimation Ready**: Impostata la struttura per accogliere i futuri algoritmi di analisi dell'esecuzione tramite fotocamera.

---

## [2026-04-13] - UI Design & User Experience ✨
**Aggiornamento grafico premium "Apple Glassmorphism".**

### 🎨 Estetica Premium
- **Glassmorphism**: Implementate card in semi-trasparenza vitrea (`white/5`) su sfondo nero assoluto (`#040404`).
- **Emerald Accent**: Uniformato il colore di accento al verde smeraldo (`#10B981`) per un look più moderno e coerente.
- **Tab Bar**: Nuove icone con stato attivo luminescente.

### 🛠️ Funzionalità
- **Smart History**: Implementato il calendario a scorrimento (Swipe Calendar) che carica i workout reali dal database.
- **Refactoring UI**: Migliorata la `ActiveWorkoutScreen` con Counter delle serie distanziato e input sicuri.
- **Database Fix**: Corretti gli errori di "Numeric Overflow" per gestire volumi di allenamento elevati (numeric 10,2).

---
