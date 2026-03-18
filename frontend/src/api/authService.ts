import { supabase } from "./supabaseClient";
import { AuthResponse } from '@supabase/supabase-js';

export const authService = {
  // Login con email e password
  signIn: (email: string, password: string): Promise<AuthResponse> => {
    return supabase.auth.signInWithPassword({ email, password });
  },

  // Registrazione
  signUp: (email: string, password: string): Promise<AuthResponse> => {
    return supabase.auth.signUp({ email, password });
  },

  // Logout
  signOut: () => {
    return supabase.auth.signOut();
  },

  // Ottieni sessione attuale
  getSession: () => {
    return supabase.auth.getSession();
  },

  // Listener per i cambiamenti di stato
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
