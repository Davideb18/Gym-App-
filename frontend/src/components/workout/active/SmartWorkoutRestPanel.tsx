import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Timer, X } from 'lucide-react-native';

type SmartWorkoutRestPanelProps = {
  restString: string;
  restLabel: string;
  nextLabel: string;
  setLabel: string;
  repsLabel: string;
  weightLabel: string;
  nextExerciseName?: string;
  nextSetType?: string;
  nextSetNumber?: number;
  nextSetTargetReps?: number | null;
  nextSetTargetWeight?: number | null;
  getSetColor: (type: string) => string;
  difficultyLabel: (type: string) => string;
  onReduce: () => void;
  onAdd: () => void;
  onSkip: () => void;
};

export default function SmartWorkoutRestPanel({
  restString,
  restLabel,
  nextLabel,
  setLabel,
  repsLabel,
  weightLabel,
  nextExerciseName,
  nextSetType,
  nextSetNumber,
  nextSetTargetReps,
  nextSetTargetWeight,
  getSetColor,
  difficultyLabel,
  onReduce,
  onAdd,
  onSkip,
}: SmartWorkoutRestPanelProps) {
  return (
    <View className="px-5 py-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="bg-blue-500/20 p-2.5 rounded-full mr-3 border border-blue-500/30">
            <Timer size={20} color="#60A5FA" />
          </View>
          <View>
            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              {restLabel}
            </Text>
            <Text className="text-white text-3xl font-black font-mono tracking-tighter -mt-1">
              {restString}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onReduce}
            className="bg-white/10 px-3 py-2.5 rounded-xl border border-white/5 shadow-sm"
          >
            <Text className="text-white text-xs font-bold">-15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdd}
            className="bg-white/10 px-3 py-2.5 rounded-xl border border-white/5 shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSkip}
            className="bg-red-500/20 p-2.5 rounded-full border border-red-500/30 ml-1"
          >
            <X size={16} color="#F87171" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      {nextExerciseName && nextSetType && nextSetNumber ? (
        <View className="bg-black/50 rounded-2xl p-3 flex-row items-center justify-between border border-white/5">
          <View className="flex-1 pr-2">
            <Text className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-0.5">
              {nextLabel}
            </Text>
            <Text className="text-white font-bold text-sm" numberOfLines={1}>
              {nextExerciseName}
            </Text>
          </View>
          <View className="items-end">
            <View
              className={`px-2 py-1 rounded-md border ${getSetColor(nextSetType).split(' ')[0]} ${getSetColor(nextSetType).split(' ')[2]}`}
            >
              <Text
                className={`text-[9px] uppercase font-black tracking-wider ${getSetColor(nextSetType).split(' ')[1]}`}
              >
                {setLabel} {nextSetNumber} • {difficultyLabel(nextSetType)}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs font-bold mt-1">
              {nextSetTargetReps || '-'} {repsLabel.toLowerCase()} @ {nextSetTargetWeight || '-'}{' '}
              {weightLabel.toLowerCase()}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
