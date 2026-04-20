import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { WorkoutService } from '../../api/workoutService';
import type { ExerciseHistorySet } from '../../api/workoutService';

interface Props {
  exerciseId: string;
}

export default function ExerciseHistoryInline({ exerciseId }: Props) {
  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['exerciseHistory', exerciseId],
    queryFn: () => WorkoutService.getExerciseHistory(exerciseId),
  });

  if (isLoading) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#00FF00" />
      </View>
    );
  }

  if (error || !history || history.length === 0) {
    return (
      <View className="py-3 items-center bg-white/5 rounded-xl mt-2">
        <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
          Nessuno storico precedente
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-2 gap-2">
      {history.slice(0, 2).map((session) => (
        <View key={session.session_id} className="bg-white/5 rounded-xl p-3 border border-white/5">
          <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2">
            {new Date(session.completed_at).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {session.sets.map((set: ExerciseHistorySet) => (
              <View key={set.id} className="bg-black/50 px-2 py-1 rounded-md border border-white/5">
                <Text className="text-gray-300 text-[10px] font-bold">
                  <Text className="text-white">{set.weight || '-'}</Text> kg{' '}
                  <Text className="text-gray-500">×</Text>{' '}
                  <Text className="text-[#00FF00]">{set.reps || '-'}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
