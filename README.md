# Spotter AI - Gym App

Spotter AI e una app mobile per pianificazione e tracking allenamenti, con backend dedicato e integrazione Supabase.

Il repository e un monorepo con frontend React Native (Expo), backend Node.js/TypeScript e tipi condivisi.

## Stack Tecnologico

- Frontend: React Native, Expo, TypeScript, Zustand, React Query
- Backend: Node.js, Express, TypeScript
- Data/Auth: Supabase
- Tooling: npm workspaces, ESLint, TypeScript

## Struttura Repository

```text
Gym App/
├── frontend/       # App mobile Expo
├── backend/        # API server e script
├── shared/         # Tipi condivisi frontend/backend
└── package.json    # Script monorepo
```

## Requisiti

- Node.js 18+
- npm 9+
- Expo Go (opzionale, per test rapido su device)

## Setup Locale

1. Installa dipendenze dal root:

```bash
npm install
```

2. Crea i file ambiente partendo dagli example:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

3. Configura le variabili ambiente reali:

- `frontend/.env`
- `backend/.env`

4. Avvio in sviluppo (frontend + backend):

```bash
npm run dev
```

5. Avvio in tunnel (utile quando PC e telefono non sono nella stessa rete):

```bash
npm run dev:tunnel
```

## Variabili Ambiente

Frontend (`frontend/.env`):

- `EXPO_PUBLIC_SUPABASE_URL`: URL progetto Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: chiave anon pubblica Supabase

Backend (`backend/.env`):

- `PORT`: porta server Express (default 3001)
- `DATABASE_URL`: connection string Postgres/Supabase
- `TRANSLATE_LIMIT` (opzionale): limite record per script traduzioni
- `TRANSLATE_DELAY_MS` (opzionale): delay tra traduzioni in ms

## Script Principali

Dal root:

- `npm run dev` - avvia backend e frontend insieme
- `npm run dev:tunnel` - avvia backend + Expo tunnel
- `npm run lint` - lint frontend e backend
- `npm run typecheck` - typecheck frontend e backend

Per workspace:

- `npm run ios -w frontend`
- `npm run android -w frontend`
- `npm run build -w backend`
- `npm run seed:free -w backend`

## Stato Attuale

- Login social rimosso (Google/Facebook/Apple)
- Flusso auth mantenuto su email/password + reset password
- Branding allineato a Spotter AI

## Note

- Le credenziali non devono mai essere versionate.
- Prima di aprire PR o pubblicare, eseguire sempre `npm run lint` e `npm run typecheck`.
- I file `.env` non devono mai essere committati: usa solo i file `.env.example` come template.
