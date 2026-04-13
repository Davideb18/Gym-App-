import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';

type ExerciseDetailHeaderProps = {
  loading: boolean;
  name: string;
  muscle: string;
  equipment: string;
  onClose: () => void;
};

export default function ExerciseDetailHeader({
  loading,
  name,
  muscle,
  equipment,
  onClose,
}: ExerciseDetailHeaderProps) {
  return (
    <View className="px-6 pt-2 pb-6 border-b border-white/5">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-4">
          {loading ? (
            <ActivityIndicator size="small" color="#10B981" className="self-start mb-2" />
          ) : (
            <Text
              className="text-white text-3xl font-black tracking-tighter leading-8"
              numberOfLines={2}
            >
              {name}
            </Text>
          )}
          <View className="flex-row items-center mt-2">
            <View className="bg-white/10 px-2 py-0.5 rounded-md mr-2">
              <Text className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                {muscle}
              </Text>
            </View>
            <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
              {equipment}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/5"
        >
          <X size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
