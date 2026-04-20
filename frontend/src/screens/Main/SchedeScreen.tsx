import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Plus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../api/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import ExerciseLibrary from '../../components/exercises/ExerciseLibrary';
import { WorkoutService } from '../../api/workoutService';
import { WorkoutTemplate } from '../../../../shared/types';
import PremiumModal from '../../components/ui/PremiumModal';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SchedeQuickActions from '../../components/schede/SchedeQuickActions';
import SchedeTemplatesList from '../../components/schede/SchedeTemplatesList';

import { useWorkoutPreviewStore } from '../../store/useWorkoutPreviewStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';
import { useFormCoachStore } from '../../store/useFormCoachStore';

type WorkoutTemplateRow = Pick<WorkoutTemplate, 'id' | 'name' | 'description' | 'created_at'>;

export default function SchedeScreen() {
  const { session } = useAuthStore();
  const { t } = useTranslation();
  const userId = session?.user?.id;
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);

  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Global Stores per le schermate a tutto schermo (no Modals)
  const { openPreview } = useWorkoutPreviewStore();
  const { openCreate } = useCreateRoutineStore();
  const { openCoach } = useFormCoachStore();

  useEffect(() => {
    let mounted = true;
    const loadPremiumStatus = async () => {
      if (!userId) {
        if (mounted) setIsPremium(false);
        return;
      }
      try {
        setIsLoadingPremium(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', userId)
          .single();

        if (error) {
          if (mounted) setIsPremium(false);
          return;
        }

        if (mounted) {
          setIsPremium(!!data?.is_premium);
        }
      } catch {
        if (mounted) setIsPremium(false);
      } finally {
        if (mounted) setIsLoadingPremium(false);
      }
    };

    loadPremiumStatus();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const openCreateRoutineFlow = () => {
    if (isLoadingPremium) return;
    const templatesCount = templates?.length ?? 0;
    const freeLimitReached = !isPremium && templatesCount >= 4;
    if (freeLimitReached) {
      setIsPremiumModalOpen(true);
      return;
    }
    openCreate(); // Usa lo store globale per aprire la schermata
  };

  const openCoachQuickFlow = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('id, name, image_url, videos_data')
      .order('name', { ascending: true })
      .limit(30);

    const extractMediaUrls = (rawVideoData: unknown, fallbackImage?: string | null) => {
      if (Array.isArray(rawVideoData)) {
        const cleaned = rawVideoData.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0,
        );
        if (cleaned.length > 0) return cleaned;
      }

      if (typeof rawVideoData === 'string' && rawVideoData.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(rawVideoData);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (item): item is string => typeof item === 'string' && item.trim().length > 0,
            );
            if (cleaned.length > 0) return cleaned;
          }
        } catch {
          // Ignore malformed JSON and continue with image fallback.
        }
      }

      return fallbackImage ? [fallbackImage] : [];
    };

    const firstWithMedia = (data || []).find(
      (exercise) => extractMediaUrls(exercise.videos_data, exercise.image_url).length > 0,
    );
    const pick = firstWithMedia || data?.[0] || null;

    const mediaUrls = pick ? extractMediaUrls(pick.videos_data, pick.image_url) : [];
    const mediaUrl = mediaUrls[0] || null;

    openCoach({
      exerciseId: pick?.id || 'coach-quick-start',
      exerciseName: pick?.name || t('workouts.coach_default_exercise'),
      mediaUrl,
      mediaUrls,
    });
  };

  const openRoutine = (templateId: string) => {
    openPreview(templateId); // Usa lo store globale
  };

  const handleDeleteRoutine = (templateId: string, templateName: string) => {
    Alert.alert(t('workouts.delete_title'), t('workouts.delete_confirm', { name: templateName }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await WorkoutService.deleteTemplate(templateId, userId!);
            await refetchTemplates();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('workouts.delete_error');
            Alert.alert(t('common.error'), message);
          }
        },
      },
    ]);
  };

  const {
    data: templates,
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
    refetch: refetchTemplates,
  } = useQuery<WorkoutTemplateRow[]>({
    queryKey: ['templates', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: false })
        .eq('profile_id', userId);

      if (error) throw error;
      return (data ?? []) as WorkoutTemplateRow[];
    },
    enabled: !!userId,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchTemplates();
    setRefreshing(false);
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
          className="px-5 pt-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 240 }}
        >
          {/* HEADER */}
          <ScreenHeader
            subtitle={t('workouts.templates_title')}
            rightAction={
              <TouchableOpacity
                onPress={openCreateRoutineFlow}
                className="bg-white/10 p-3.5 rounded-2xl shadow-xl border border-white/5"
                activeOpacity={0.8}
              >
                <Plus size={24} color="white" strokeWidth={3} />
              </TouchableOpacity>
            }
          />

          <SchedeQuickActions
            customLabel={t('workouts.custom')}
            coachLabel={t('workouts.coach')}
            exerciseLabel={t('workouts.exercise')}
            onOpenCreate={openCreateRoutineFlow}
            onOpenCoach={openCoachQuickFlow}
            onOpenLibrary={() => setIsWikiOpen(true)}
          />

          <SchedeTemplatesList
            loading={isLoadingTemplates}
            isError={!!isTemplatesError}
            templates={templates || []}
            title={t('workouts.my_routines')}
            retryLabel={t('common.retry')}
            addLabel={t('workouts.add_new')}
            emptyLabel={t('workouts.no_routines')}
            onRetry={() => refetchTemplates()}
            onOpenTemplate={openRoutine}
            onLongPressTemplate={handleDeleteRoutine}
            onOpenCreate={openCreateRoutineFlow}
          />
        </ScrollView>
      </SafeAreaView>

      <ExerciseLibrary visible={isWikiOpen} onClose={() => setIsWikiOpen(false)} />

      <PremiumModal
        visible={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => {
          Alert.alert('Premium', 'Logica di upgrade in arrivo!');
          setIsPremiumModalOpen(false);
        }}
      />
    </View>
  );
}
