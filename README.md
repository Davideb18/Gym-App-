# Gym App - Development Guide 🚀

This project is a professional, AI-driven fitness application. This guide focuses on the frontend development and testing workflow for existing collaborators.

## 📱 Frontend Development & Testing

Since the backend and database are already shared, follow these steps to run the mobile app:

### 1. Start the Frontend
Navigate to the `frontend` directory and start the Expo server:
```bash
cd frontend
npx expo start
```

### 2. Test on Expo Go
To test on your physical device with **Expo Go**:
1. Ensure your phone and computer are on the **same Wi-Fi network**.
2. Scan the QR code from the terminal:
   - **Android**: Open the **Expo Go** app and tap "Scan QR Code".
   - **iOS**: Open the **Camera** app and scan the QR code.
3. The app will bundle and open on your device!

## 🛠 Useful Commands

Once the Expo server is running, you can use these shortcuts in the terminal:
- `r`: Reload the app.
- `d`: Open the developer menu (useful for inspection).
- `shift + i`: Open on an iOS simulator.
- `shift + a`: Open on an Android emulator.

## 📁 Project Structure Recap
- `/frontend`: React Native source code (Screens, Components, Store).
- `/backend`: API Server & Prisma Schema (Sharing the same Supabase DB).
- `/shared`: Shared TypeScript interfaces.
