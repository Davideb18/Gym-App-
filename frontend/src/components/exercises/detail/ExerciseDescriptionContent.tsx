import React from 'react';
import { View, Text } from 'react-native';
import ExerciseVideoPlayer from '../ExerciseVideoPlayer';
import ExerciseCharts from '../ExerciseCharts';

type ExerciseDescriptionContentProps = {
  initialVideoUrl?: string | null;
  imageUrl?: string | null;
  onRequestVideo?: () => Promise<string | null>;
  instructions: string;
  noInstructionsLabel: string;
  instructionsTitle: string;
  historyData: any[];
  secondaryMuscles?: string | null;
  difficulty?: string | null;
  force?: string | null;
  mechanic?: string | null;
};

export default function ExerciseDescriptionContent({
  initialVideoUrl,
  imageUrl,
  onRequestVideo,
  instructions,
  noInstructionsLabel,
  instructionsTitle,
  historyData,
  secondaryMuscles,
  difficulty,
  force,
  mechanic
}: ExerciseDescriptionContentProps) {
  return (
    <View className="pb-10">
      <ExerciseVideoPlayer
        initialVideoUrl={initialVideoUrl}
        imageUrl={imageUrl}
        onRequestVideo={onRequestVideo}
      />

      {/* Dettagli Agguntivi */}
      <View className="mt-6 flex-row flex-wrap justify-between pr-2">
        {secondaryMuscles ? (
          <View className="bg-black/30 rounded-2xl px-4 py-2 mb-2 w-[48%] border border-white/5">
            <Text className="text-gray-500 text-[10px] uppercase font-bold mb-1">Muscoli Secondari</Text>
            <Text className="text-white text-xs font-bold leading-5">{secondaryMuscles}</Text>
          </View>
        ) : null}
        
        {difficulty ? (
          <View className="bg-black/30 rounded-2xl px-4 py-2 mb-2 w-[48%] border border-white/5">
            <Text className="text-gray-500 text-[10px] uppercase font-bold mb-1">Difficoltà</Text>
            <Text className="text-white text-xs font-bold capitalize">{difficulty}</Text>
          </View>
        ) : null}
        
        {force ? (
          <View className="bg-black/30 rounded-2xl px-4 py-2 mb-2 w-[48%] border border-white/5">
            <Text className="text-gray-500 text-[10px] uppercase font-bold mb-1">Forza</Text>
            <Text className="text-white text-xs font-bold capitalize">{force}</Text>
          </View>
        ) : null}

        {mechanic ? (
          <View className="bg-black/30 rounded-2xl px-4 py-2 mb-2 w-[48%] border border-white/5">
            <Text className="text-gray-500 text-[10px] uppercase font-bold mb-1">Meccanica</Text>
            <Text className="text-white text-xs font-bold capitalize">{mechanic}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner">
        <Text className="text-white text-xl font-black mb-4 tracking-tight">
          {instructionsTitle}
        </Text>
        <Text className="text-gray-400 text-sm leading-6">
          {instructions && instructions.trim().length > 0 ? instructions : noInstructionsLabel}
        </Text>
      </View>

      <ExerciseCharts historyData={historyData} />
    </View>
  );
}
