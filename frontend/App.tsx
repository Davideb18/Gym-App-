import { View, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './src/screens/Auth/LoginScreen';
import './global.css'; // Se usi NativeWind 4 serve l'import del CSS globale
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/api/supabaseClient';

const queryClient = new QueryClient();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Controlla la sessione attuale al caricamento
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Resta in ascolto: se fai login o logout, aggiorna la variabile 'session'
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      {session ? (
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white' }}>SEI NEL LABORATORIO! 🦍</Text>
        </View>
      ) : (
        <LoginScreen />
      )}
    </QueryClientProvider>
  );
}
