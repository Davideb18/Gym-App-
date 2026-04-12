import { View, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

import './src/locales/i18n'; // Inizializza le lingue
import './global.css'; 
import { useAuthStore } from './src/store/useAuthStore';
import { authService } from './src/api/authService';

import LoginScreen from './src/screens/Auth/LoginScreen';
import SignupScreen from './src/screens/Auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';

import HomeScreen from './src/screens/Main/HomeScreen';
import SchedeScreen from './src/screens/Main/SchedeScreen';
import HistoryScreen from './src/screens/Main/HistoryScreen';
import ProfileScreen from './src/screens/Main/ProfileScreen';
import ActiveWorkoutScreen from './src/screens/Main/ActiveWorkoutScreen';
import SmartWorkoutWidget from './src/components/workout/SmartWorkoutWidget';
import ExerciseDetailModal from './src/components/exercises/ExerciseDetailModal';
import WorkoutPreviewScreen from './src/components/workout/WorkoutPreviewScreen';
import CreateRoutineScreen from './src/components/schede/CreateRoutineScreen';
import WorkoutSummaryScreen from './src/components/workout/WorkoutSummaryScreen';
import { Home, Layout, History, User } from 'lucide-react-native';
import { useActiveWorkout } from './src/store/useActiveWorkout';
import { useNavigationStore } from './src/store/useNavigationStore';

const queryClient = new QueryClient();

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export default function App() {
  const { session, setAuth } = useAuthStore();
  const { isExpanded, setIsExpanded } = useActiveWorkout();
  const { currentTab, setTab } = useNavigationStore();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    // 1. Controlla la sessione iniziale
    authService.getSession().then(({ data: { session } }) => {
      setAuth(session);
    });

    // 2. Listener per i cambiamenti di stato auth
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setAuth(session);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('reset-password');
      }
    });

    // 3. Gestisci Deep Links (per quando l'app è chiusa o in background)
    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      // Se l'URL contiene hash con access_token e type=recovery, Supabase lo gestirà in onAuthStateChange
      // Ma forziamo il cambio di UI per sicurezza
      if (url.includes('type=recovery') || url.includes('reset-password')) {
        setAuthMode('reset-password');
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkingSubscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const renderAuthScreen = () => {
    switch (authMode) {
      case 'login':
        return <LoginScreen onOpenForgotPassword={() => setAuthMode('forgot-password')} onGoToSignUp={() => setAuthMode('signup')} />;
      case 'signup':
        return <SignupScreen onGoToLogin={() => setAuthMode('login')} />;
      case 'forgot-password':
        return <ForgotPasswordScreen onBack={() => setAuthMode('login')} />;
      case 'reset-password':
        return <ResetPasswordScreen onSuccess={() => setAuthMode('login')} />;
      default:
        return <LoginScreen onOpenForgotPassword={() => setAuthMode('forgot-password')} onGoToSignUp={() => setAuthMode('signup')} />;
    }
  };

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
        {session && authMode !== 'reset-password' ? (
          <View className="flex-1 bg-[#0A0A0A]">
            {renderScreen()}
            {/* TAB BAR ... */}

            {/* GLOBAL ACTIVE WORKOUT MODAL */}
            <ActiveWorkoutScreen />

            {!isExpanded && (
              <>
                <SmartWorkoutWidget onPressExpand={() => setIsExpanded(true)} />
                
                {/* CUSTOM PREMIUM TAB BAR */}
                <View className="absolute bottom-8 left-6 right-6 h-20 bg-black/90 rounded-[35px] flex-row items-center justify-around px-4 shadow-2xl border border-white/5 backdrop-blur-md">
                  <TouchableOpacity onPress={() => setTab('Home')} className="items-center p-2">
                    <Home size={24} color={currentTab === 'Home' ? '#10B981' : '#FFF'} strokeWidth={currentTab === 'Home' ? 3 : 2} />
                    {currentTab === 'Home' && <View className="w-1 h-1 rounded-full bg-[#10B981] mt-1.5" />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => setTab('Schede')} className="items-center p-2">
                    <Layout size={24} color={currentTab === 'Schede' ? '#10B981' : '#FFF'} strokeWidth={currentTab === 'Schede' ? 3 : 2} />
                    {currentTab === 'Schede' && <View className="w-1 h-1 rounded-full bg-[#10B981] mt-1.5" />}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setTab('History')} className="items-center p-2">
                    <History size={24} color={currentTab === 'History' ? '#10B981' : '#FFF'} strokeWidth={currentTab === 'History' ? 3 : 2} />
                    {currentTab === 'History' && <View className="w-1 h-1 rounded-full bg-[#10B981] mt-1.5" />}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setTab('Profile')} className="items-center p-2">
                    <User size={24} color={currentTab === 'Profile' ? '#10B981' : '#FFF'} strokeWidth={currentTab === 'Profile' ? 3 : 2} />
                    {currentTab === 'Profile' && <View className="w-1 h-1 rounded-full bg-[#10B981] mt-1.5" />}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* MODALE DETTAGLI ESERCIZIO GLOBALE (Sotto i Full Screens) */}
            <ExerciseDetailModal />

            {/* FULL SCREENS GLOBALI (Sostituiscono le modali di React Native) */}
            <WorkoutPreviewScreen />
            <CreateRoutineScreen />
            <WorkoutSummaryScreen />

          </View>
        ) : (
          renderAuthScreen()
        )}
      </View>
    </QueryClientProvider>
  );
}
