import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Timer, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ActiveWorkoutRestTimerProps = {
  timeLeft: number;
  restLabel: string;
  onReduce: () => void;
  onAdd: () => void;
  onSkip: () => void;
};

export default function ActiveWorkoutRestTimer({
  timeLeft,
  restLabel,
  onReduce,
  onAdd,
  onSkip,
}: ActiveWorkoutRestTimerProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <LinearGradient
        colors={['rgba(23,23,23,0.97)', 'rgba(28,37,53,0.97)']}
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View className="flex-row items-center">
          <View className="bg-blue-500/20 p-2 rounded-full mr-3 border border-blue-500/30">
            <Timer size={22} color="#60A5FA" />
          </View>
          <View>
            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">
              {restLabel}
            </Text>
            <Text className="text-white text-2xl font-black font-mono">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={onReduce}
            className="bg-white/10 px-3 py-2 rounded-xl border border-white/10"
          >
            <Text className="text-white text-sm font-bold">-15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAdd}
            className="bg-white/10 px-3 py-2 rounded-xl border border-white/10"
          >
            <Text className="text-white text-sm font-bold">+15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSkip}
            className="bg-red-500/20 p-2.5 rounded-full border border-red-500/30"
          >
            <X size={18} color="#F87171" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
