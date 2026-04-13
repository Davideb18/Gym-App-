import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, Check, Clock } from 'lucide-react-native';

type ActiveWorkoutHeaderProps = {
  routineName: string;
  timeString: string;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  onCollapse: () => void;
  onFinish: () => void;
  finishLabel: string;
};

export default function ActiveWorkoutHeader({
  routineName,
  timeString,
  completedSets,
  totalSets,
  totalVolume,
  onCollapse,
  onFinish,
  finishLabel,
}: ActiveWorkoutHeaderProps) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={onCollapse}
          className="p-2 bg-white/10 rounded-full border border-white/10"
        >
          <ChevronDown size={22} color="#FFF" />
        </TouchableOpacity>
        <Text
          className="text-white font-black text-base uppercase tracking-widest flex-1 text-center mx-3"
          numberOfLines={1}
        >
          {routineName}
        </Text>
        <TouchableOpacity
          onPress={onFinish}
          style={{
            backgroundColor: '#10B981',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 30,
          }}
        >
          <Text
            style={{
              color: '#000',
              fontWeight: '900',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {finishLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center gap-x-3">
        <View className="flex-row items-center bg-[#10B981]/12 px-4 py-2.5 rounded-2xl border border-[#10B981]/20">
          <Clock size={16} color="#10B981" />
          <Text className="text-[#10B981] font-black text-base ml-2 font-mono">{timeString}</Text>
        </View>
        <View className="flex-row items-center bg-blue-500/10 px-4 py-2.5 rounded-2xl border border-blue-500/20">
          <Check size={16} color="#3B82F6" />
          <Text className="text-blue-400 font-black text-base ml-2 font-mono">
            {completedSets}/{totalSets}
          </Text>
        </View>
        <View className="flex-row items-center bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
          <Text className="text-white font-black text-sm font-mono">
            {totalVolume.toLocaleString()} kg
          </Text>
        </View>
      </View>
    </View>
  );
}
