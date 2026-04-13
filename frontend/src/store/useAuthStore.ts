import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../api/authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setAuth: (session: Session | null) => void;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'facebook') => Promise<{ error: any }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true, // Iniziamo in caricamento finché non controlliamo la sessione

  setAuth: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, session: null, isLoading: false });
  },

  signIn: async (email, password) => {
    const { error } = await authService.signIn(email, password);
    return { error };
  },

  signUp: async (email, password, name) => {
    const { error } = await authService.signUp(email, password, name);
    return { error };
  },

  resetPassword: async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  },

  signInWithOAuth: async (provider: 'google' | 'apple' | 'facebook') => {
    const { error } = await authService.signInWithOAuth(provider);
    return { error };
  },
}));
