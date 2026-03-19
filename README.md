# Gym App - AI-Driven Fitness Pro

Welcome to the Gym App! This is a professional, AI-driven fitness application built with React Native (Expo) and a Node.js (Express) backend.

## 🚀 Getting Started

Follow these steps to set up the project locally for development and testing.

### 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Expo Go** app installed on your physical device (available on [App Store](https://apps.apple.com/app/expo-go/id982107779) and [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Git**

### ⚙️ Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd "Gym App"
   ```

2. **Install dependencies:**
   It is recommended to install dependencies for both the root, backend, and frontend.

   ```bash
   # Root
   npm install

   # Backend
   cd backend && npm install && cd ..

   # Frontend
   cd frontend && npm install && cd ..
   ```

3. **Set up the Backend:**
   - Navigate to the `backend` folder.
   - Create a `.env` file and add your database credentials (template below):
     ```env
     DATABASE_URL="postgresql://..."
     DIRECT_URL="postgresql://..."
     PORT=3001
     JWT_SECRET="your-secret-key"
     SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
     ```
   - Initialize the database:
     ```bash
     npx prisma generate
     npx prisma db push
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

4. **Start the Frontend:**
   - Navigate to the `frontend` folder.
   - Start the Expo server:
     ```bash
     npx expo start
     ```

## 📱 How to Test on Expo Go

Testing on a physical device ensures the best experience for animations and UI.

1. **Network**: Ensure your phone and computer are on the **same Wi-Fi network**.
2. **Start Expo**: Run `npx expo start` in the `frontend` directory.
3. **Scan the QR Code**:
   - **Android**: Open the **Expo Go** app and tap "Scan QR Code".
   - **iOS**: Open the **Camera** app and scan the QR code presented in the terminal.
4. **Interactive Commands**:
   - Press `r` to reload the app.
   - Press `d` to open the developer menu.

## 🛠 Tech Stack

- **Frontend**: React Native, Expo, NativeWind (Tailwind CSS), Lucide Icons, Zustand (State Management).
- **Backend**: Node.js, Express, Prisma (ORM), Supabase (Auth/Database).
- **Shared**: Shared TypeScript types used by both frontend and backend.

## 📁 Project Structure

- `/frontend`: Mobile application source code.
- `/backend`: API server and database schema.
- `/shared`: Common utilities and types.
