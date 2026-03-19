# Implementation Plan - Gym App Login System Completion

The goal is to provide a fully functional, premium login system for "The Lab" that matches the provided mockup and includes Social Login (Google, Apple, Facebook), Password Reset, and correct user synchronization with the backend database.

## User Review Required

> [!IMPORTANT]
> **Social Login Configuration**: Implementing Google, Apple, and Facebook sign-in requires configuration in the Supabase Dashboard and potentially platform-specific setups (Google Cloud Console, Apple Developer Portal, Meta for Developers). I will implement the code, but you may need to provide the necessary credentials/configuration in Supabase.

> [!NOTE]
> **Phone Reset**: Password reset via phone number requires Supabase Auth with SMS enabled (Twilio or similar). I will implement the UI and service call, but it depends on your Supabase SMS configuration.

## Proposed Changes

### Frontend (Expo / React Native)

#### [MODIFY] [authService.ts](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/src/api/authService.ts)
- Add `signInWithProvider(provider: Provider)` for Social Logins.
- Add `resetPasswordForEmail(email: string)` and `resetPasswordForPhone(phone: string)`.
- Add `updatePassword(password: string)`.

#### [MODIFY] [LoginScreen.tsx](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/src/screens/Auth/LoginScreen.tsx)
- Complete UI redesign to match the "The Lab" mockup exactly.
- Implement the "The Lab" logo with barbell icon.
- Add Google, Apple, and Facebook sign-in buttons with brand-correct styling.
- Add "Forgot Password?" link inside the password field area.
- Link to Sign Up screen.

#### [NEW] [SignUpScreen.tsx](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/src/screens/Auth/SignUpScreen.tsx)
- Create a dedicated Sign Up screen matching the design language.
- Fields: Full Name, Email, Password, Confirm Password.

#### [NEW] [ForgotPasswordScreen.tsx](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/src/screens/Auth/ForgotPasswordScreen.tsx)
- Create a screen to handle password resets via Email or Phone.

#### [MODIFY] [App.tsx](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/App.tsx)
- Implement a simple navigation state ([Login](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/src/screens/Auth/LoginScreen.tsx#34-253), `SignUp`, `ForgotPassword`) to switch between auth screens when no session is present.

---

### Backend (Node.js / Express / Prisma)

#### [MODIFY] [userController.ts](file:///Users/davide/Desktop/Personal_project/Gym%20App/backend/src/controllers/userController.ts)
- Ensure [syncProfile](file:///Users/davide/Desktop/Personal_project/Gym%20App/backend/src/controllers/userController.ts#5-32) is called after any successful authentication (Social or Email).
- (Optional) Enhance to handle premium status flags if available from metadata.

## Verification Plan

### Automated Tests
- No automated tests are currently present in the project. I will focus on manual verification via Expo Go.

### Manual Verification
1. **Visual Audit**: Compare the new [LoginScreen](file:///Users/davide/Desktop/Personal_project/Gym%20App/frontend/src/screens/Auth/LoginScreen.tsx#34-253) side-by-side with the mockup image.
2. **Email Login/Signup**:
   - Register a new user and verify they appear in the Supabase Auth dashboard AND the Prisma `User` table.
   - Login with the new credentials.
3. **Social Login (Mock/Real)**:
   - Attempt to sign in with Google/Apple/Facebook. If credentials are not yet set up in Supabase, verify the service call is correctly triggered.
4. **Password Reset**:
   - Trigger a reset email and verify Supabase sends it (requires Supabase SMTP config).
5. **Navigation**:
   - Verify switching between Login, SignUp, and ForgotPassword screens works smoothly.
6. **Persistence**:
   - Close and reopen the app to ensure the session is persisted via `useAuthStore`.
