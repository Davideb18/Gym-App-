# THE LAB: PRO - Training Management System 🦍🔬

Welcome to **THE LAB**. This is a professional-grade fitness application built with Expo (React Native), Node.js, and Supabase.

This repository is a **monorepo**, meaning it contains both the mobile application and the backend server in a single place.

---

## 🚀 Guida Rapida per Collaboratori (Start Here)

Sei nuovo nel progetto? Ecco come configurare tutto sul tuo computer in pochi minuti.

### 1. Prerequisiti
Assicurati di avere installato:
- **Node.js** (Versione 18 o superiore): [Scarica qui](https://nodejs.org/)
- **Git**: [Scarica qui](https://git-scm.com/)
- **Expo Go** (App sul tuo telefono): Scaricala da App Store o Google Play per testare l'app.

### 2. Clonazione del Progetto
Apri il terminale e scrivi:
```bash
git clone https://github.com/Davideb18/Gym-App-.git
cd "Gym App"
```

### 3. Installazione Unificata
Installa tutte le dipendenze per frontend e backend con un solo comando:
```bash
npm install
```

### 4. Configurazione Ambiente (.env)
Il progetto include già i file `.env` necessari per connettersi al database di test e a Supabase. Non devi cambiare nulla, ma assicurati che esistano questi file:
- `frontend/.env` (Contiene le chiavi Supabase)
- `backend/.env` (Contiene la connessione al Database)

---

## 🛠️ Sviluppo (Running the App)

Per avviare sia l'App (Frontend) che il Server (Backend) contemporaneamente, usa il comando magico:

```bash
npm run dev
```

### Cosa Succede?
1. **Frontend**: Si aprirà il server di Expo. Inquadra il QR code con la fotocamera del tuo telefono (aprendo l'app **Expo Go**) per vedere l'app dal vivo.
2. **Backend**: Il server Express partirà sulla porta `3001` per gestire la logica avanzata e l'AI.

---

## 📁 Struttura del Progetto

```text
Gym App/
├── frontend/         # App Mobile (React Native + Expo)
├── backend/          # Server API (Node.js + Prisma)
├── shared/           # Tipi e Interfacce condivise (TypeScript)
├── docs/             # Documentazione, Mockup e Roadmap
└── package.json      # Gestione script globali
```

---

## 🤝 Collaborazione

- **Push/Pull**: Prima di iniziare a lavorare, fai sempre un `git pull` per avere l'ultima versione.
- **Branch**: Crea un nuovo branch per ogni funzionalità (`git checkout -b feature/nome-feature`).
- **Database**: Usiamo Supabase. Se modifichi il database, ricordati di aggiornare lo schema Prisma nel backend.

Buon allenamento e buon codice! 💪✨