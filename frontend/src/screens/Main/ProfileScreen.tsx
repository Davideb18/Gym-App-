import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { User, Settings, ChevronRight, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../api/supabaseClient';
import { changeLanguage } from '../../locales/i18n';
import { useExerciseModal } from '../../store/useExerciseModal';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { ProgressionService } from '../../services/progressionService';
import ProfileStatsGrid from '../../components/profile/ProfileStatsGrid';
import ProfilePrList from '../../components/profile/ProfilePrList';
import LanguageSelectorModal from '../../components/profile/LanguageSelectorModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const { openExercise } = useExerciseModal();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(i18n.language, {
        month: 'short',
        year: 'numeric',
      })
    : 'Mar 2026';

  const handleSignOut = () => {
    Alert.alert(t('profile.sign_out'), t('profile.sign_out_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.sign_out'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleLanguageSelect = (lng: string) => {
    changeLanguage(lng);
    setLangModalVisible(false);
  };

  const { data: prs, isLoading: loadingPRs } = useQuery({
    queryKey: ['personalRecords', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performed_sets')
        .select(
          `
          weight,
          reps,
          exercises(id, name, target_muscle_group, equipment, instructions),
          workout_sessions!inner(profile_id)
        `,
        )
        .eq('workout_sessions.profile_id', user!.id)
        .order('weight', { ascending: false })
        .limit(200);

      if (error || !data) return [];

      const bestLifts = new Map();
      data.forEach((set: any) => {
        const ex = set.exercises;
        const w = Number(set.weight) || 0;
        if (ex?.name && w > 0) {
          if (!bestLifts.has(ex.name)) {
            bestLifts.set(ex.name, { weight: w, reps: set.reps, exercise: ex });
          } else {
            if (w > bestLifts.get(ex.name).weight) {
              bestLifts.set(ex.name, { weight: w, reps: set.reps, exercise: ex });
            }
          }
        }
      });
      return Array.from(bestLifts.entries())
        .map(([name, stats]: any) => ({
          name,
          weight: stats.weight,
          reps: stats.reps,
          exercise: stats.exercise,
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);
    },
    enabled: !!user?.id,
  });

  const { data: workoutsCount = 0 } = useQuery({
    queryKey: ['completedWorkoutCount', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user!.id)
        .eq('status', 'completed');

      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const { data: progressionSessions = [] } = useQuery({
    queryKey: ['profileProgressionSessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('total_volume, completed_at')
        .eq('profile_id', user!.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error || !data) return [];
      return data;
    },
    enabled: !!user?.id,
  });

  const progression = useMemo(() => {
    const now = Date.now();
    const days30 = 30 * 24 * 60 * 60 * 1000;

    const totalVolume = progressionSessions.reduce(
      (acc: number, s: any) => acc + (Number(s.total_volume) || 0),
      0,
    );
    const last30Workouts = progressionSessions.filter((s: any) => {
      if (!s?.completed_at) return false;
      return now - new Date(s.completed_at).getTime() <= days30;
    }).length;

    return ProgressionService.computeUserLevel({
      workoutsCount,
      totalVolume,
      prCount: prs?.length || 0,
      last30Workouts,
    });
  }, [progressionSessions, workoutsCount, prs]);

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
          className="px-5 pt-8"
          contentContainerStyle={{ paddingBottom: 240 }}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            subtitle={t('profile.main_page_title')}
            rightAction={
              <TouchableOpacity
                className="bg-black/40 p-3 rounded-full border border-white/5 shadow-md"
                onPress={handleSignOut}
              >
                <Settings size={20} color="#FFF" />
              </TouchableOpacity>
            }
          />

          {/* Sezione Avatar e Nome */}
          <View className="items-center mb-10 mt-4">
            <View className="w-32 h-32 bg-black/60 rounded-[48px] items-center justify-center border border-white/10 shadow-[8px_8px_20px_rgba(0,0,0,0.3)] mb-6">
              <User size={60} color="#FFF" strokeWidth={1.5} />
            </View>
            <Text className="text-white text-3xl font-[1000] tracking-tighter uppercase drop-shadow-md">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </Text>
            <View className="bg-black/40 px-4 py-2 rounded-full mt-3 border border-white/5">
              <Text
                className="text-white font-black text-[10px] uppercase tracking-[2px]"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t('profile.member_since', { date: memberSince })}
              </Text>
            </View>
          </View>

          <ProfileStatsGrid
            workoutsCount={workoutsCount}
            prCount={prs?.length || 0}
            level={progression.level}
            progressPercent={progression.progressPercent}
            workoutsLabel={t('profile.workouts_count')}
            prsLabel={t('profile.prs_set')}
            levelLabel={t('profile.level')}
          />

          {/* Menu Impostazioni */}
          <Text className="text-white text-[10px] font-black uppercase tracking-[4px] mb-4 mt-2 px-1">
            {t('profile.settings')}
          </Text>
          <View className="bg-black/40 border border-white/5 rounded-[32px] p-2 mb-10 shadow-lg">
            <TouchableOpacity
              onPress={() => setLangModalVisible(true)}
              className="flex-row items-center justify-between p-4 px-5"
            >
              <View className="flex-row items-center">
                <View className="bg-white/5 p-2.5 rounded-xl mr-4 border border-white/5">
                  <Globe size={20} color="#FFF" />
                </View>
                <Text className="text-white font-black text-base">{t('profile.language')}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white font-bold mr-2 uppercase text-xs">
                  {i18n.language.toUpperCase()}
                </Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Lista Protocolli Personali */}
          <Text className="text-white text-[10px] font-black uppercase tracking-[4px] mb-4 px-1">
            {t('profile.prs_set')}
          </Text>
          <ProfilePrList
            prs={prs || []}
            loading={loadingPRs}
            noRecordsLabel={t('profile.no_records')}
            bestLabel={(weight, reps) => t('profile.best', { weight, reps })}
            onOpenExercise={openExercise}
          />
        </ScrollView>
      </SafeAreaView>

      <LanguageSelectorModal
        visible={langModalVisible}
        currentLanguage={i18n.language}
        title={t('profile.language')}
        closeLabel={t('common.close')}
        onClose={() => setLangModalVisible(false)}
        onSelectLanguage={handleLanguageSelect}
      />
    </View>
  );
}
