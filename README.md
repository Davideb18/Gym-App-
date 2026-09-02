# Spotter AI - Gym Workout Tracker 🏋️‍♂️

Spotter AI is a comprehensive mobile application for workout planning and tracking. Built with a modern tech stack, it features a React Native frontend and a robust Node.js/TypeScript backend, fully integrated with Supabase for data and authentication.

## 🚀 Features

- **Workout Planning:** Create and customize workout routines.
- **Progress Tracking:** Log sets, reps, and weights to monitor your fitness journey.
- **Secure Authentication:** Email and password authentication with secure session management.
- **Cross-Platform:** Available for both iOS and Android via Expo.

## 🛠 Tech Stack

This project is structured as a monorepo containing both the frontend and backend applications, sharing common TypeScript types.

### Frontend (Mobile App)

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** Zustand, React Query
- **UI/UX:** Custom design system

### Backend (API Server)

- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL)

## 📁 Repository Structure

```text
Gym App/
├── frontend/       # React Native Expo mobile app
├── backend/        # Express.js API server
├── shared/         # Shared TypeScript types across frontend and backend
└── package.json    # Monorepo configuration
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- Expo Go (optional, for testing on a physical device)

### Local Setup

1. **Clone the repository and install dependencies:**

   ```bash
   git clone <your-repo-url>
   cd "Gym App"
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment files and fill in your actual credentials.

   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

   **Important:** Never commit your `.env` files. Ensure you have your own Supabase project configured.

3. **Run the Development Server:**
   This command starts both the backend API and the Expo frontend simultaneously.
   ```bash
   npm run dev
   ```
   _(Use `npm run dev:tunnel` if your PC and mobile device are on different networks)._

## 📜 Scripts

**Root Workspace:**

- `npm run dev` - Start backend and frontend simultaneously
- `npm run dev:tunnel` - Start backend and Expo via tunnel
- `npm run lint` - Run ESLint on both workspaces
- `npm run typecheck` - Run TypeScript compiler checks on both workspaces

**Specific Workspaces:**

- `npm run ios -w frontend` - Launch iOS simulator
- `npm run android -w frontend` - Launch Android emulator
- `npm run build -w backend` - Build the backend API
- `npm run seed:free -w backend` - Seed the database

## 🛡️ Status & Notes

- Social login (Google/Facebook/Apple) is currently disabled; relying on Email/Password authentication.
- To ensure code quality, always run `npm run lint` and `npm run typecheck` before pushing changes.
