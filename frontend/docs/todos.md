# 📋 THE LAB GYM APP - Next Steps & TODOs

Questo documento traccia gli elementi ancora in sospeso e le prossime feature per procedere allo sviluppo come pianificato, portando l'applicazione alla release ufficiale.

## 🎯 Prossimi Obiettivi Principali

### 1. Sistema di Monetizzazione & Paywall (Premium Features)
- [ ] **Integrazione provider pagamenti:** Scegliere e implementare RevenueCat o Stripe per la gestione degli abbonamenti.
- [ ] **Paywall Screen:** Realizzare la UI `PremiumModal` (attualmente in mock) con tabelle comparative tra piano Free e Premium.
- [ ] **Sblocco Feature lato Client:** Associare la variabile globale `isPremium` al profilo utente per rimuovere i limiti hard-coded (es. limite 4 schede, esercizi premium bloccati).

### 2. Ecosistema Esercizi (Libreria Cloud-Based)
- [ ] **API MuscleWiki / API Database Esterno:** Consolidare il fetching dei video (attualmente c'è un mock `https://www.w3schools.com/html/mov_bbb.mp4`) utilizzando chiavi API ufficiali di MuscleWiki o hosting S3 privato.
- [ ] **Ricerca e Filtri:** Migliorare l'UX di ricerca introducendo la possibilità di filtrare per muscolo esatto, equipaggiamento o livello di forza (es. Calisthenics vs Pesi).

### 3. Sistema di Progressione Utente (Gamification)
- [ ] **Calcolo Punti Esp (XP):** Salvare lato database l'aumento dell'esperienza utente in base al Volume Sollevato e al Tempo d'Allenamento.
- [ ] **Gradi Animati (Gorilla, Lion, ecc.):** Sostituire l'etichetta manuale statica ("Silver Gorilla") nella `HomeScreen` tramite chiamate live a un Custom Hook che controlla i punti totali dell'utente nel DB.

### 4. Condivisione e Componente Social (Community - Opzionale ma consigliato)
- [ ] Generazione "Link Condivisibile" per i custom workout, per scambiare e copiare protocolli d'allenamento tra gli atleti.

---
*Nota: Tutti i backend endpoint per queste feature sono compatibili con la base dati Supabase attuale e richiederanno l'aggiunta di poche tabelle/colonne (es. `user_xp`, `subscription_tier`).*
