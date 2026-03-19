# Gym App - Complete Development Guide 🚀

Welcome to the **Gym App**! This is a professional, AI-driven fitness application built with React Native (Expo) and a Node.js (Express) backend. This guide provides step-by-step instructions for downloading, setting up, and testing the project.

## 📋 Prerequisites

Before you start, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Git**
- **Expo Go** app installed on your physical device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Gym App"
```

### 2. Install Dependencies
It is essential to install dependencies for the root, backend, and frontend directories:
```bash
# Root
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Backend Configuration
The backend uses Prisma with PostgreSQL (Supabase).
1. Navigate to the `backend` folder.
2. Create a `.env` file and add the database credentials (ask the team for the exact keys):
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   PORT=3001
   JWT_SECRET="your-secret-key"
   SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
   ```
3. Initialize the database client:
   ```bash
   npx prisma generate
   ```

---

## 🚀 Running the Project

To test the full functionality, you need to run both the backend and the frontend.

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
In a new terminal:
```bash
cd frontend
npx expo start
```

---

## 📱 How to Test on Expo Go

Testing on a physical device is the best way to verify animations and performance.

1. **Network**: Ensure your phone and computer are on the **same Wi-Fi network**.
2. **Start Expo**: Run `npx expo start` in the `frontend` directory.
3. **Scan the QR Code**:
   - **Android**: Open **Expo Go** and tap "Scan QR Code".
   - **iOS**: Open the **Camera** app and scan the code.
4. **Commands**:
   - `r`: Reload the app.
   - `d`: Open the developer menu.
   - `shift + i`: Open iOS simulator.
   - `shift + a`: Open Android emulator.

---

## 📁 Project Structure

- `/frontend`: Mobile app source code (React Native, NativeWind, Zustand).
- `/backend`: API Server (Express, Prisma, PostgreSQL).
- `/shared`: Common TypeScript types and utilities.
- `/docs`: (Optional) PDF guides and PRD documents.
