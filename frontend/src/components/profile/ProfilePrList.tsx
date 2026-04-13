import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight, Dumbbell } from 'lucide-react-native';

type PrItem = {
  name: string;
  weight: number;
  reps: number;
  exercise: { id: string };
};

type ProfilePrListProps = {
  prs: PrItem[];
  loading: boolean;
  noRecordsLabel: string;
  bestLabel: (weight: number, reps: number) => string;
  onOpenExercise: (exerciseId: string) => void;
};

export default function ProfilePrList({
  prs,
  loading,
  noRecordsLabel,
  bestLabel,
  onOpenExercise,
}: ProfilePrListProps) {
  if (loading) {
    return <ActivityIndicator size="small" color="#10B981" />;
  }

  if (!prs.length) {
    return (
      <View className="items-center py-6 bg-black/40 border border-white/5 rounded-[32px] border-dashed">
        <Dumbbell size={24} color="#FFFFFF" />
        <Text className="text-white font-bold mt-2 text-xs">{noRecordsLabel}</Text>
      </View>
    );
  }

  return (
    <View className="gap-y-4 mb-20">
      {prs.map((pr, i) => (
        <TouchableOpacity
          key={pr.name}
          onPress={() => onOpenExercise(pr.exercise.id)}
          className="bg-black/60 border border-white/5 rounded-[32px] p-5 py-6 flex-row items-center shadow-lg"
        >
          <View
            className={`w-2.5 h-2.5 rounded-full mr-4 ${i === 0 ? 'bg-[#10B981]' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}
          />
          <View className="flex-1 gap-y-1">
            <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>
              {pr.name}
            </Text>
            <Text className="text-white/90 font-bold text-[10px] uppercase tracking-[1px] mt-1">
              {bestLabel(pr.weight, pr.reps)}
            </Text>
          </View>
          <ChevronRight size={20} color="#D1D5DB" />
        </TouchableOpacity>
      ))}
    </View>
  );
}
