import { supabase } from "./supabaseClient";
import { AuthResponse } from '@supabase/supabase-js';

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
        } 
      } 
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
      redirectTo: 'thelabfit://reset-password',
    });
  },

  // Login with social
  signInWithOAuth: (provider: 'google'| 'apple' | 'facebook') => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'thelabfit://auth-callback', // Questo servirà per tornare nell'app dopo il login
      }});
  },

  // Listener per i cambiamenti di stato
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
