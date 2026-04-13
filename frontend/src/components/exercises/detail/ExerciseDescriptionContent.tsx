import React from 'react';
import { View, Text } from 'react-native';
import ExerciseVideoPlayer from '../ExerciseVideoPlayer';
import ExerciseCharts from '../ExerciseCharts';

type ExerciseDescriptionContentProps = {
  videoUrl: string;
  instructions: string;
  noInstructionsLabel: string;
  instructionsTitle: string;
  historyData: any[];
};

export default function ExerciseDescriptionContent({
  videoUrl,
  instructions,
  noInstructionsLabel,
  instructionsTitle,
  historyData,
}: ExerciseDescriptionContentProps) {
  return (
    <View className="pb-10">
      <ExerciseVideoPlayer videoUrl={videoUrl} />

      <View className="mt-8 bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner">
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
