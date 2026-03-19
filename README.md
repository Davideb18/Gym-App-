# Gym App - Team Development Guide 🚀

Welcome to the **Gym App**! This guide helps team members set up and collaborate on the project.

## 📋 Prerequisites

Ensure you have:
- **Node.js** (v18+)
- **npm** or **yarn**
- **Git**
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## ⚙️ Setup Instructions for Team Members

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Gym App"
```

### 2. Install Dependencies
Run these commands in order:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Generate Prisma Client
The backend uses Prisma ORM. Generate the client:
```bash
cd backend
npx prisma generate
```

---

## 🚀 Running the Application

### Option 1: Development Mode (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npx expo start
```

### Option 2: Testing on Physical Device

1. Make sure your phone and computer are on the **same Wi-Fi network**
2. Scan the QR code displayed in the terminal:
   - **Android**: Open **Expo Go** → Tap "Scan QR Code"
   - **iOS**: Open **Camera** app → Scan the code
3. The app will load on your device

**Keyboard Shortcuts (development):**
- `r`: Reload the app
- `d`: Open developer menu
- `shift + i`: Open iOS simulator
- `shift + a`: Open Android emulator

---

## 📁 Project Structure

```
Gym App/
├── backend/          # Express API server with Prisma ORM
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── services/
│   └── prisma/       # Database schema & migrations
├── frontend/         # React Native (Expo) mobile app
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── store/
├── shared/          # Shared TypeScript types
└── .env             # Environment variables (shared for team)
```

---

## 🔐 Environment Variables

The `.env` file is already included in the repository and contains shared database credentials for the team.

**Important:** 
- Database URL and JWT secret are configured
- Never commit additional `.env.local` files with personal changes
- If you need local overrides, create a `.env.local` file (it's in `.gitignore` and won't be committed)

---

## 🐛 Troubleshooting

### Issue: `node_modules` folder is missing after clone
**Solution:**
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Issue: "Prisma schema not found" or database errors
**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue: Backend won't start on port 3001
**Solution:** Check if port is in use or update `PORT` in `.env`:
```bash
cd backend
# Kill process on port 3001 (macOS/Linux)
lsof -ti:3001 | xargs kill -9
npm run dev
```

### Issue: Expo app won't connect on physical device
**Checklist:**
- [ ] Phone and computer are on same Wi-Fi
- [ ] Phone has Expo Go installed
- [ ] Try restarting the Expo dev server (`Ctrl+C` then `npx expo start`)
- [ ] Try using IP address instead of localhost

---

## 📞 Need Help?

1. Check the **Troubleshooting** section above
2. Run `git status` to verify all files are tracked correctly
3. Make sure `.env` exists in the `backend` folder

---

## 🚀 Ready to Start Coding?

Once the app is running, you can:
- **Edit screens** in `frontend/src/screens/`
- **Modify API routes** in `backend/src/routes/`
- **Update database schema** in `backend/prisma/schema.prisma` (then run migrations)

Happy coding! 💪