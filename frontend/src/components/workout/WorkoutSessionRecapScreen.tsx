import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Clock3, Dumbbell, Activity } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useWorkoutSessionDetailStore } from '../../store/useWorkoutSessionDetailStore';

export default function WorkoutSessionRecapScreen() {
  const { t, i18n } = useTranslation();
  const { isOpen, session, closeSessionDetail } = useWorkoutSessionDetailStore();

  const groupedExercises = useMemo(() => {
    const sets = session?.performed_sets || [];
    const groups = new Map<string, any[]>();

    sets.forEach((set: any) => {
      const exName = set?.exercises?.name || t('workouts.exercise');
      if (!groups.has(exName)) groups.set(exName, []);
      groups.get(exName)?.push(set);
    });

    return Array.from(groups.entries()).map(([name, values]) => ({
      name,
      sets: values.sort((a, b) => (a?.set_number || 0) - (b?.set_number || 0)),
    }));
  }, [session, t]);

  if (!isOpen || !session) return null;

  const durationSeconds = session?.duration_seconds || 0;
  const durationMin = Math.floor(durationSeconds / 60);
  const durationRem = durationSeconds % 60;
  const completedAt = session?.completed_at
    ? new Date(session.completed_at).toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 160 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeSessionDetail}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '93%',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['#171717', '#D1D5DB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(16,185,129,0.25)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 170 }}
        />

        <View className="w-full items-center pt-3 pb-1">
          <View className="w-12 h-1.5 bg-white/30 rounded-full" />
        </View>

        <View className="flex-row justify-between items-center px-6 mt-1 mb-2">
          <TouchableOpacity
            onPress={closeSessionDetail}
            className="bg-white/10 p-2.5 rounded-full border border-white/10"
          >
            <X size={22} color="#FFF" />
          </TouchableOpacity>
          <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
            <Text className="text-white font-black uppercase text-[10px] tracking-[2px]">
              {t('history.completed')}
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <View className="px-6 pb-4">
          <Text className="text-white font-black text-3xl tracking-tight" numberOfLines={2}>
            {session?.workout_templates?.name || t('home.deleted_template_fallback')}
          </Text>
          <Text className="text-white/85 font-bold text-xs mt-1">{completedAt}</Text>

          <View className="flex-row gap-x-3 mt-4">
            <View className="flex-row items-center bg-black/30 px-3 py-2 rounded-xl border border-white/10">
              <Clock3 size={14} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-2">
                {durationMin}m {durationRem}s
              </Text>
            </View>
            <View className="flex-row items-center bg-black/30 px-3 py-2 rounded-xl border border-white/10">
              <Activity size={14} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-2">
                {session?.performed_sets?.length || 0} {t('history.sets')}
              </Text>
            </View>
            <View className="flex-row items-center bg-black/30 px-3 py-2 rounded-xl border border-white/10">
              <Dumbbell size={14} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-2">
                {(session?.total_volume || 0).toLocaleString()} kg
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {groupedExercises.length === 0 ? (
            <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mt-2">
              <Text className="text-white font-bold text-sm">{t('history.no_workouts')}</Text>
            </View>
          ) : (
            groupedExercises.map((exercise, idx) => (
              <View
                key={`${exercise.name}-${idx}`}
                className="bg-black/30 border border-white/10 rounded-3xl p-4 mb-4"
              >
                <Text className="text-white font-black text-base mb-3 tracking-tight">
                  {idx + 1}. {exercise.name}
                </Text>

                <View className="flex-row border-b border-white/10 pb-2 mb-1">
                  <Text className="text-white/90 font-black text-[10px] uppercase w-10 text-center">
                    Set
                  </Text>
                  <Text className="text-white/90 font-black text-[10px] uppercase flex-1 text-center">
                    Tipo
                  </Text>
                  <Text className="text-white/90 font-black text-[10px] uppercase w-16 text-center">
                    Reps
                  </Text>
                  <Text className="text-white/90 font-black text-[10px] uppercase w-16 text-center">
                    Kg
                  </Text>
                </View>

                {exercise.sets.map((set: any) => (
                  <View key={set.id} className="flex-row items-center py-2 border-b border-white/5">
                    <Text className="text-white font-black text-xs w-10 text-center">
                      {set?.set_number || '-'}
                    </Text>
                    <Text className="text-white/90 font-bold text-[10px] uppercase flex-1 text-center">
                      {t(`difficulty.${set?.set_type || 'normal'}`)}
                    </Text>
                    <Text className="text-white font-bold text-xs w-16 text-center">
                      {set?.reps ?? '-'}
                    </Text>
                    <Text className="text-white font-bold text-xs w-16 text-center">
                      {set?.weight ?? '-'}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
