import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, Info } from 'lucide-react-native';
import { LiveExercise } from '../../../store/useActiveWorkout';

type ActiveWorkoutExerciseCardProps = {
  exercise: LiveExercise;
  index: number;
  difficultyLabel: (setType: string) => string;
  parseNumber: (raw: string) => number | undefined;
  onOpenExercise: (exerciseId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: 'real_weight' | 'real_reps',
    value?: number,
  ) => void;
  onToggleSet: (exerciseId: string, setId: string) => void;
};

export default function ActiveWorkoutExerciseCard({
  exercise,
  index,
  difficultyLabel,
  parseNumber,
  onOpenExercise,
  onUpdateSet,
  onToggleSet,
}: ActiveWorkoutExerciseCardProps) {
  return (
    <View className="mb-5 bg-black/25 rounded-3xl p-4 border border-white/10">
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          onPress={() => onOpenExercise(exercise.exercise_id)}
          className="flex-1 mr-2"
        >
          <Text className="text-white font-black text-lg tracking-tighter" numberOfLines={1}>
            {index + 1}. {exercise.exercise_name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onOpenExercise(exercise.exercise_id)}
          className="p-2 rounded-full bg-white/10 border border-white/10"
        >
          <Info size={15} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-2 px-1">
        <Text className="flex-1 text-gray-400 font-bold uppercase text-[9px] tracking-widest">
          Set
        </Text>
        <Text className="w-16 text-center text-gray-400 font-bold uppercase text-[9px] tracking-widest">
          KG
        </Text>
        <Text className="w-16 text-center text-gray-400 font-bold uppercase text-[9px] tracking-widest">
          Reps
        </Text>
        <Text className="w-12 text-center text-gray-400 font-bold uppercase text-[9px] tracking-widest">
          ✓
        </Text>
      </View>

      {exercise.sets.map((set) => (
        <View
          key={set.id}
          className={`flex-row items-center py-2 px-1 rounded-xl mb-1 ${set.is_completed ? 'bg-[#10B981]/15 border border-[#10B981]/20' : 'border border-transparent'}`}
        >
          <View className="flex-1 flex-row items-center">
            <Text
              className={`font-black text-xs ${set.is_completed ? 'text-[#10B981]' : 'text-white'}`}
            >
              {set.set_number}
            </Text>
            <View className="ml-2 px-1.5 py-0.5 bg-white/10 rounded">
              <Text className="text-gray-400 font-bold text-[7px] uppercase">
                {difficultyLabel(set.set_type)}
              </Text>
            </View>
          </View>
          <View
            className={`w-16 bg-black/40 rounded-lg mx-1 border ${set.is_completed ? 'border-transparent opacity-40' : 'border-white/10'}`}
          >
            <TextInput
              className="text-center text-white font-black py-1.5 text-sm"
              keyboardType="numeric"
              maxLength={8}
              placeholder={
                set.last_weight
                  ? String(set.last_weight)
                  : set.target_weight
                    ? String(set.target_weight)
                    : '-'
              }
              placeholderTextColor="#9CA3AF"
              value={set.real_weight ? String(set.real_weight) : ''}
              onChangeText={(v) => onUpdateSet(exercise.id, set.id, 'real_weight', parseNumber(v))}
              editable={!set.is_completed}
            />
          </View>
          <View
            className={`w-16 bg-black/40 rounded-lg mx-1 border ${set.is_completed ? 'border-transparent opacity-40' : 'border-white/10'}`}
          >
            <TextInput
              className="text-center text-white font-black py-1.5 text-sm"
              keyboardType="numeric"
              maxLength={4}
              placeholder={
                set.last_reps
                  ? String(set.last_reps)
                  : set.target_reps
                    ? String(set.target_reps)
                    : '-'
              }
              placeholderTextColor="#9CA3AF"
              value={set.real_reps ? String(set.real_reps) : ''}
              onChangeText={(v) => onUpdateSet(exercise.id, set.id, 'real_reps', parseNumber(v))}
              editable={!set.is_completed}
            />
          </View>
          <TouchableOpacity
            onPress={() => onToggleSet(exercise.id, set.id)}
            style={{
              width: 48,
              height: 32,
              marginLeft: 4,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: set.is_completed ? '#10B981' : 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: set.is_completed ? 'transparent' : 'rgba(255,255,255,0.1)',
            }}
          >
            <Check
              size={17}
              color={set.is_completed ? '#000' : '#6B7280'}
              strokeWidth={set.is_completed ? 3 : 2}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
