# THE LAB: PRO - Monorepo 🦍🔬

Welcome to **THE LAB**! This is a professional monorepo containing the mobile application and its specialized backend.

## 📁 Project Structure

```
Gym App/
├── frontend/         # Expo App (UI & Supabase Client)
├── backend/          # Node/Express Server (AI Logic & Prisma ORM)
├── shared/           # Common TypeScript types/interfaces
└── docs/             # Technical Masterplan, Roadmap, and Mockups
```

---

## ⚙️ Team Setup (Getting Started)

### 1. Unified Installation
Run this command once from the project root to install all dependencies for both Frontend and Backend:
```bash
npm install
```

### 2. Configure Environment Variables
Ensure you have a `.env` file in the `frontend/` directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://avvcjadkhdwkrsbgvnio.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## 🚀 Running the Project

### Frontend (App)
```bash
npm run frontend:start
```

### Backend (Server)
```bash
npm run backend:dev
```

---

## 🤝 Team Collaboration

- **Frontend Specialist**: Focuses on `frontend/src/`. Can work independently using Supabase directly, or call the backend for advanced logic.
- **Backend Specialist**: Focuses on `backend/src/` and database schema via Prisma.
- **Shared Contracts**: Use the `shared/` folder to define types that both sides must follow.

Happy coding! 💪✨