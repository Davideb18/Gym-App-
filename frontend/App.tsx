import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from './src/screens/Auth/LoginScreen';
import './global.css'; // Se usi NativeWind 4 serve l'import del CSS globale
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useAuthStore } from './src/store/useAuthStore';
import { authService } from './src/api/authService';

import HomeScreen from './src/screens/Main/HomeScreen';
import SchedeScreen from './src/screens/Main/SchedeScreen';
import HistoryScreen from './src/screens/Main/HistoryScreen';
import ProfileScreen from './src/screens/Main/ProfileScreen';
import { Home, Layout, History, User } from 'lucide-react-native';

const queryClient = new QueryClient();

export default function App() {
  const { session, setAuth } = useAuthStore();
  const [currentTab, setCurrentTab] = useState('Home');

  useEffect(() => {
    authService.getSession().then(({ data: { session } }) => {
      setAuth(session);
    });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setAuth(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home': return <HomeScreen />;
      case 'Schede': return <SchedeScreen />;
      case 'History': return <HistoryScreen />;
      case 'Profile': return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 bg-white">
        {session ? (
          <View className="flex-1">
            {renderScreen()}

            {/* CUSTOM PREMIUM TAB BAR */}
            <View className="absolute bottom-8 left-6 right-6 h-20 bg-black/90 rounded-[35px] flex-row items-center justify-around px-4 shadow-2xl border border-white/10">
              <TouchableOpacity onPress={() => setCurrentTab('Home')} className="items-center p-2">
                <Home size={24} color={currentTab === 'Home' ? '#00FF00' : '#FFF'} strokeWidth={currentTab === 'Home' ? 3 : 2} />
                {currentTab === 'Home' && <View className="w-1.5 h-1.5 rounded-full bg-[#00FF00] mt-1" />}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setCurrentTab('Schede')} className="items-center p-2">
                <Layout size={24} color={currentTab === 'Schede' ? '#00FF00' : '#FFF'} strokeWidth={currentTab === 'Schede' ? 3 : 2} />
                {currentTab === 'Schede' && <View className="w-1.5 h-1.5 rounded-full bg-[#00FF00] mt-1" />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTab('History')} className="items-center p-2">
                <History size={24} color={currentTab === 'History' ? '#00FF00' : '#FFF'} strokeWidth={currentTab === 'History' ? 3 : 2} />
                {currentTab === 'History' && <View className="w-1.5 h-1.5 rounded-full bg-[#00FF00] mt-1" />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTab('Profile')} className="items-center p-2">
                <User size={24} color={currentTab === 'Profile' ? '#00FF00' : '#FFF'} strokeWidth={currentTab === 'Profile' ? 3 : 2} />
                {currentTab === 'Profile' && <View className="w-1.5 h-1.5 rounded-full bg-[#00FF00] mt-1" />}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <LoginScreen />
        )}
      </View>
    </QueryClientProvider>
  );
}
