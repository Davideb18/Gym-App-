import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigationStore } from '../../store/useNavigationStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Flame, Trophy, Activity, ChevronRight, Quote } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import { useWorkoutSummaryStore } from '../../store/useWorkoutSummaryStore';
import WorkoutSummaryScreen from '../../components/workout/WorkoutSummaryScreen';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const { setTab } = useNavigationStore();
  const { openSummary } = useWorkoutSummaryStore();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['recentSessions', user?.id],
    queryFn: () => WorkoutService.getRecentSessions(user!.id),
    enabled: !!user?.id,
  });

  const quotes = t('home.motivation_quotes', { returnObjects: true }) as string[];
  const [quote] = useState(() => 
    Array.isArray(quotes) ? quotes[Math.floor(Math.random() * quotes.length)] : t('home.motivation_quote')
  );

  // Calcolo Statistiche
  const totalSessions = sessions?.length || 0;
  const totalSeconds = sessions?.reduce((acc: number, s: any) => acc + (s.duration_seconds || 0), 0) || 0;
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  
  const totalVolume = sessions?.reduce((acc: number, s: any) => acc + (s.total_volume || 0), 0) || 0;
  const avgVol = totalSessions > 0 ? (totalVolume / totalSessions) : 0;
  const formattedAvgVol = avgVol > 1000 ? `${(avgVol / 1000).toFixed(1)}k` : Math.round(avgVol).toString();

  const timeString = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Sfondo Unificato Ibrido (Nero -> Grigio Chiaro) */}
      <LinearGradient colors={['#171717', '#D1D5DB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', width: '100%', height: '100%' }} />

      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          
          {/* HEADER - LOGO SIGNATURE */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center">
              <Text className="text-white text-3xl font-[1000] tracking-tighter">THE</Text>
              <View className="ml-1 bg-[#10B981] px-1.5 py-0.5 rounded shadow-sm shadow-green-900/50">
                <Text className="text-black text-xl font-black italic">LAB</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-white/5 p-3 rounded-full border border-white/10">
              <Activity size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Sezione Quotation */}
          <BlurView intensity={20} tint="dark" className="p-8 rounded-[40px] mb-8 border border-white/5 overflow-hidden relative">
             <View className="absolute top-[-10] right-[-10] opacity-5">
                <Quote size={120} color="white" />
             </View>
             <Text className="text-[#10B981] font-black uppercase text-[10px] tracking-[4px] mb-4">
               {t('home.motivation_title')}
             </Text>
             <Text className="text-white text-2xl font-[1000] leading-tight tracking-tight">
               {quote}
             </Text>
             <View className="flex-row items-center mt-6">
                <View className="bg-[#10B981] w-8 h-[2px] mr-3" />
                <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  The Lab Protocol
                </Text>
             </View>
          </BlurView>

          {/* QUICK STATS */}
          <View className="bg-black/60 border border-white/5 rounded-[40px] p-8 mb-8 shadow-2xl">
            <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[4px] mb-6">
              {t('home.activity_overview')}
            </Text>
            {isLoading ? (
               <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">{t('home.total_sessions')}</Text>
                  <Text className="text-white text-3xl font-[1000] tracking-tighter">{totalSessions}</Text>
                </View>
                <View className="w-[1px] h-12 bg-white/10 mx-4" />
                <View>
                   <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">{t('home.total_time')}</Text>
                   <Text className="text-white text-3xl font-[1000] tracking-tighter">{timeString}</Text>
                </View>
                <View className="w-[1px] h-12 bg-white/10 mx-4" />
                <View className="flex-1">
                   <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1" numberOfLines={1}>{t('home.avg_vol')}</Text>
                   <View className="flex-row items-baseline mt-1">
                      <Text 
                        className="text-[#10B981] text-3xl font-[1000] tracking-tighter" 
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {formattedAvgVol}
                      </Text>
                      <Text className="text-[#10B981]/50 text-[10px] font-black ml-1 uppercase">kg</Text>
                   </View>
                </View>
              </View>
            )}
          </View>

          {/* RECENT SESSIONS */}
          <View className="mb-10">
            <View className="flex-row justify-between items-end mb-6 px-1">
              <Text className="text-gray-400 font-black uppercase text-[10px] tracking-[4px]">
                {t('home.recent_sessions')}
              </Text>
              <TouchableOpacity 
                onPress={() => setTab('History')}
                className="bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20"
              >
                <Text className="text-[#10B981] font-black uppercase text-[10px] tracking-widest">{t('common.view_all')}</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
               <ActivityIndicator size="small" color="#10B981" />
            ) : sessions && sessions.length > 0 ? (
              sessions.slice(0, 2).map((session: any, idx: number) => {
                const durationMin = Math.floor((session.duration_seconds || 0) / 60);
                const name = session.workout_templates?.name || 'Freestyle Session';
                const isYesterday = new Date(session.completed_at).toDateString() === new Date(Date.now() - 86400000).toDateString();
                const displayDate = isYesterday ? t('common.yesterday') : new Date(session.completed_at).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });
                
                return (
                  <TouchableOpacity 
                    key={session.id || idx}
                    onPress={() => openSummary({
                      routineName: name,
                      timeString: `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`,
                      completedSets: session.performed_sets?.length || 0,
                      totalVolume: session.total_volume,
                      exercises: session.performed_sets?.reduce((acc: any[], ps: any) => {
                        const existing = acc.find(a => a.name === ps.exercises.name);
                        if (existing) {
                          existing.setsCompleted += 1;
                        } else {
                          acc.push({ name: ps.exercises.name, setsCompleted: 1 });
                        }
                        return acc;
                      }, []) || []
                    })}
                    className="bg-black/60 border border-white/5 rounded-[32px] p-5 mb-4 flex-row items-center shadow-lg"
                  >
                    <View className="bg-[#10B981]/10 p-4 rounded-2xl mr-4 border border-[#10B981]/20">
                      <Flame size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>{name}</Text>
                      <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                        {displayDate} • {durationMin} min • {session.total_volume} kg
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                );
              })
            ) : (
                <View className="items-center py-6">
                  <Text className="text-gray-500 font-bold text-xs">{t('home.no_recent_sessions')}</Text>
                </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Tasto Start Workout Dinamico */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
        <TouchableOpacity 
          className="bg-black/90 py-5 rounded-full flex-row items-center justify-center shadow-2xl border border-white/10 backdrop-blur-md"
          activeOpacity={0.9}
        >
          <Trophy size={18} color="#10B981" className="mr-3" />
          <Text className="text-white font-[1000] uppercase tracking-[3px] text-sm">
            {t('home.start_blank_workout')}
          </Text>
        </TouchableOpacity>
      </View>

      <WorkoutSummaryScreen />
    </View>
  );
}
