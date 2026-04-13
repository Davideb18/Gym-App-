import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, Award, BarChart3 } from 'lucide-react-native';

type ProfileStatsGridProps = {
  workoutsCount: number;
  prCount: number;
  level: number;
  progressPercent: number;
  workoutsLabel: string;
  prsLabel: string;
  levelLabel: string;
};

export default function ProfileStatsGrid({
  workoutsCount,
  prCount,
  level,
  progressPercent,
  workoutsLabel,
  prsLabel,
  levelLabel,
}: ProfileStatsGridProps) {
  return (
    <View className="flex-row gap-x-3 mb-10">
      <View className="flex-1 bg-black/60 p-5 rounded-[32px] items-center border border-white/5 shadow-lg">
        <TrendingUp size={24} color="#10B981" />
        <Text className="text-white font-[1000] text-3xl mt-3">{workoutsCount}</Text>
        <Text
          className="text-gray-400 font-black text-[9px] uppercase tracking-[1px] mt-1 text-center w-full"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {workoutsLabel}
        </Text>
      </View>

      <View className="flex-1 bg-black/60 p-5 rounded-[32px] items-center border border-white/5 shadow-lg">
        <Award size={24} color="#3B82F6" />
        <Text className="text-white font-[1000] text-3xl mt-3">{prCount}</Text>
        <Text
          className="text-gray-400 font-black text-[9px] uppercase tracking-[1px] mt-1 text-center w-full"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {prsLabel}
        </Text>
      </View>

      <View className="flex-1 bg-black/60 p-5 rounded-[32px] items-center border border-white/5 shadow-lg">
        <BarChart3 size={24} color="#8B5CF6" />
        <Text className="text-white font-[1000] text-3xl mt-3">{level}</Text>
        <Text
          className="text-white font-black text-[9px] uppercase tracking-[1px] mt-1 text-center w-full"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {levelLabel}
        </Text>
        <View className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <View className="h-full bg-[#8B5CF6]" style={{ width: `${progressPercent}%` }} />
        </View>
      </View>
    </View>
  );
}
