import { supabase } from './supabaseClient';
import type { AuthChangeEvent, AuthResponse, Session } from '@supabase/supabase-js';

export const authService = {
  // Login con email e password
  signIn: (email: string, password: string): Promise<AuthResponse> => {
    return supabase.auth.signInWithPassword({ email, password });
  },

  // Registrazione
  signUp: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
  },

  // Logout
  signOut: () => {
    return supabase.auth.signOut();
  },

  // Ottieni sessione attuale
  getSession: () => {
    return supabase.auth.getSession();
  },

  // Reset password by email
  resetPassword: (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'spotterai://reset-password',
    });
  },

  // Listener per i cambiamenti di stato
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
