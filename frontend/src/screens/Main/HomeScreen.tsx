import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigationStore } from '../../store/useNavigationStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Flame, Activity, ChevronRight, Quote } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import { useWorkoutSessionDetailStore } from '../../store/useWorkoutSessionDetailStore';
import ScreenHeader from '../../components/ui/ScreenHeader';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const { setTab } = useNavigationStore();
  const { openSessionDetail } = useWorkoutSessionDetailStore();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['recentSessions', user?.id],
    queryFn: () => WorkoutService.getRecentSessions(user!.id),
    enabled: !!user?.id,
  });

  const quotes = t('home.motivation_quotes', { returnObjects: true }) as string[];
  const [quote] = useState(() =>
    Array.isArray(quotes)
      ? quotes[Math.floor(Math.random() * quotes.length)]
      : t('home.motivation_quote'),
  );

  // Calcolo Statistiche
  const totalSessions = sessions?.length || 0;
  const totalSeconds =
    sessions?.reduce((acc: number, s: any) => acc + (s.duration_seconds || 0), 0) || 0;
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);

  const totalVolume =
    sessions?.reduce((acc: number, s: any) => acc + (s.total_volume || 0), 0) || 0;
  const avgVol = totalSessions > 0 ? totalVolume / totalSessions : 0;
  const formattedAvgVol =
    avgVol > 1000 ? `${(avgVol / 1000).toFixed(1)}k` : Math.round(avgVol).toString();

  const timeString = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  const handleOpenRecentSession = (session: any) => {
    openSessionDetail(session);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Sfondo Unificato Ibrido (Nero -> Grigio Chiaro) */}
      <LinearGradient
        colors={['#171717', '#D1D5DB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5 pt-8"
          contentContainerStyle={{ paddingBottom: 240 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <ScreenHeader
            subtitle={t('home.hub_title')}
            rightAction={
              <TouchableOpacity className="bg-white/5 p-3 rounded-full border border-white/10">
                <Activity size={20} color="#FFF" />
              </TouchableOpacity>
            }
          />

          {/* Sezione Quotation */}
          <BlurView
            intensity={20}
            tint="dark"
            className="p-8 rounded-[40px] mb-8 border border-white/5 overflow-hidden relative"
          >
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
              <Text className="text-white/85 font-bold uppercase text-[10px] tracking-[2px]">
                The Lab Protocol
              </Text>
            </View>
          </BlurView>

          {/* QUICK STATS */}
          <View className="bg-black/60 border border-white/5 rounded-[40px] p-8 mb-8 shadow-2xl">
            <Text className="text-white font-black text-base tracking-tight mb-6">
              {t('home.activity_overview')}
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-white font-bold uppercase text-[11px] tracking-[1px] mb-1 text-center">
                    {t('home.total_sessions').replace(' ', '\n')}
                  </Text>
                  <Text className="text-white text-3xl font-[1000] tracking-tighter mt-1">
                    {totalSessions}
                  </Text>
                </View>
                <View className="w-[1px] h-12 bg-white/10 mx-4" />
                <View className="items-center flex-1">
                  <Text className="text-white font-bold uppercase text-[11px] tracking-[1px] mb-1 text-center">
                    {t('home.total_time').replace(' ', '\n')}
                  </Text>
                  <Text className="text-white text-3xl font-[1000] tracking-tighter mt-1">
                    {timeString}
                  </Text>
                </View>
                <View className="w-[1px] h-12 bg-white/10 mx-4" />
                <View className="flex-1 items-center">
                  <Text className="text-white font-bold uppercase text-[11px] tracking-[1px] mb-1 text-center">
                    {t('home.avg_vol')}
                  </Text>
                  <View className="flex-row items-baseline mt-1">
                    <Text
                      className="text-[#10B981] text-3xl font-[1000] tracking-tighter"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {formattedAvgVol}
                    </Text>
                    <Text className="text-[#10B981]/50 text-[10px] font-black ml-1 uppercase">
                      kg
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* RECENT SESSIONS */}
          <View className="mb-10">
            <View className="flex-row justify-between items-end mb-6 px-1">
              <Text className="text-white font-black uppercase text-[10px] tracking-[4px]">
                {t('home.recent_sessions')}
              </Text>
              <TouchableOpacity
                onPress={() => setTab('History')}
                className="bg-[#065F46] px-3 py-1.5 rounded-full border border-[#047857]"
              >
                <Text className="text-white font-black uppercase text-[10px] tracking-widest">
                  {t('common.view_all')}
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : sessions && sessions.length > 0 ? (
              sessions.map((session: any, idx: number) => {
                const durationMin = Math.floor((session.duration_seconds || 0) / 60);
                const name = session.workout_templates?.name || 'Freestyle Session';
                const isYesterday =
                  new Date(session.completed_at).toDateString() ===
                  new Date(Date.now() - 86400000).toDateString();
                const displayDate = isYesterday
                  ? t('common.yesterday')
                  : new Date(session.completed_at).toLocaleDateString(i18n.language, {
                      month: 'short',
                      day: 'numeric',
                    });

                return (
                  <TouchableOpacity
                    key={session.id || idx}
                    onPress={() => handleOpenRecentSession(session)}
                    className="bg-black/60 border border-white/5 rounded-[32px] p-5 mb-4 flex-row items-center shadow-lg"
                  >
                    <View className="bg-[#10B981]/10 p-4 rounded-2xl mr-4 border border-[#10B981]/20">
                      <Flame size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-white font-black text-lg tracking-tight"
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      <Text
                        className="text-white/90 font-bold text-[10px] uppercase tracking-[1px] mt-1"
                        numberOfLines={1}
                      >
                        {displayDate} • {durationMin} min • {session.total_volume} kg
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="items-center py-6">
                <Text className="text-white/90 font-bold text-xs">
                  {t('home.no_recent_sessions')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
