import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronUp } from 'lucide-react-native';
import { useActiveWorkout } from '../../store/useActiveWorkout';

interface MiniWorkoutPlayerProps {
  onPress: () => void;
}

export default function MiniWorkoutPlayer({ onPress }: MiniWorkoutPlayerProps) {
  const { isActive, exercises, startTime } = useActiveWorkout();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  if (!isActive) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const activeExercise = exercises.find(ex => ex.sets.some(s => !s.is_completed)) || exercises[0];
  const nextTarget = activeExercise ? activeExercise.sets.find(s => !s.is_completed) : null;
  const targetText = nextTarget 
    ? `${nextTarget.target_reps || '-'} reps @ ${nextTarget.target_weight || '-'} kg` 
    : 'Da spuntare!';

  return (
    <View className="absolute bottom-[92px] left-4 right-4 z-50">
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="rounded-2xl shadow-xl overflow-hidden shadow-black/40">
        <BlurView intensity={90} tint="dark" className="border border-white/10 rounded-2xl px-4 py-2 flex-row items-center justify-between bg-black/50">
          
          <View className="flex-row items-center flex-1">
             {/* Timer Minimal */}
             <View className="bg-[#00FF00]/10 px-2 py-1 rounded-md mr-3 border border-[#00FF00]/20">
               <Text className="text-[#00FF00] font-black text-xs tracking-tighter">{timeString}</Text>
             </View>
             
             {/* Info Esercizio */}
             <View className="flex-1 mr-2">
                <Text className="text-white font-bold text-xs uppercase tracking-tight" numberOfLines={1}>
                  {activeExercise ? activeExercise.exercise_name : 'Completato'}
                </Text>
                <Text className="text-gray-400 font-medium text-[10px] uppercase">
                  {targetText}
                </Text>
             </View>
          </View>

          <View className="w-8 h-8 items-end justify-center">
             <ChevronUp size={20} color="white" />
          </View>

        </BlurView>
      </TouchableOpacity>
    </View>
  );
}
