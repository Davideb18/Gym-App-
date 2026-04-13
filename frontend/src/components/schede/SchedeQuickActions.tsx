import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Dumbbell, Users, Layout } from 'lucide-react-native';

type SchedeQuickActionsProps = {
  customLabel: string;
  aiLabel: string;
  exerciseLabel: string;
  onOpenCreate: () => void;
  onOpenLibrary: () => void;
};

export default function SchedeQuickActions({
  customLabel,
  aiLabel,
  exerciseLabel,
  onOpenCreate,
  onOpenLibrary,
}: SchedeQuickActionsProps) {
  return (
    <View className="flex-row justify-between mb-10 gap-x-4">
      <TouchableOpacity
        onPress={onOpenCreate}
        className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg"
        activeOpacity={0.7}
      >
        <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
          <Dumbbell size={18} color="#10B981" />
        </View>
        <Text
          className="text-white text-[10px] font-black uppercase tracking-[2px] text-center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {customLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg">
        <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
          <Layout size={18} color="#3B82F6" />
        </View>
        <Text
          className="text-white text-[10px] font-black uppercase tracking-[2px] text-center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {aiLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onOpenLibrary}
        className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg"
        activeOpacity={0.7}
      >
        <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
          <Users size={18} color="#8B5CF6" />
        </View>
        <Text
          className="text-white text-[10px] font-black uppercase tracking-[2px] text-center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {exerciseLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
