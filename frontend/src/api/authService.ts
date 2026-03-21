import { supabase } from "./supabaseClient";
import { AuthResponse } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const getQueryParam = (url: string, key: string) => {
  const safeUrl = url.includes('#') ? url.replace('#', '?') : url;
  const parsed = new URL(safeUrl);
  return parsed.searchParams.get(key);
};

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
  signInWithOAuth: async (provider: 'google'| 'apple' | 'facebook'): Promise<AuthResponse> => {
    // Standard Expo approach for OAuth callback.
    // In Expo Go: exp://<ip>:8081/--/
    const redirectTo = makeRedirectUri();
    console.log('[OAuth] Using redirectTo:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { data: { user: null, session: null }, error };
    }

    if (!data?.url) {
      return {
        data: { user: null, session: null },
        error: {
          name: 'OAuthError',
          message: 'URL OAuth non ricevuto da Supabase.',
        } as any,
      };
    }

    console.log('[OAuth] provider URL ricevuto');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log('[OAuth] result.type =', result.type);
    console.log('[OAuth] result URI:', JSON.stringify(result, null, 2));
    if (result.type === 'success' && result.url) {
      console.log('[OAuth] callback URL ricevuto:', result.url);
    }
    if (result.type !== 'success' || !result.url) {
      return {
        data: { user: null, session: null },
        error: {
          name: 'OAuthCancelled',
          message: 'Accesso OAuth annullato o non completato.',
        } as any,
      };
    }

    const accessToken = getQueryParam(result.url, 'access_token');
    const refreshToken = getQueryParam(result.url, 'refresh_token');

    if (!accessToken || !refreshToken) {
      return {
        data: { user: null, session: null },
        error: {
          name: 'OAuthTokenError',
          message: 'Token OAuth mancanti nel callback URL.',
        } as any,
      };
    }

    return supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  },

  // Listener per i cambiamenti di stato
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
