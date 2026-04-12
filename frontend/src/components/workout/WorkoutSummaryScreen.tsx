import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Trophy, Flame, Zap, Share2, Crown, Activity, Clock } from 'lucide-react-native';
import { useWorkoutSummaryStore } from '../../store/useWorkoutSummaryStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function WorkoutSummaryScreen() {
  const { t } = useTranslation();
  const { isOpen, summaryData, closeSummary } = useWorkoutSummaryStore();

  if (!isOpen || !summaryData) return null;

  return (
    <View className="absolute inset-0 z-[200] elevation-[200]">
       <BlurView intensity={100} tint="dark" className="flex-1">
          
          <ScrollView className="flex-1 pt-16 px-6" showsVerticalScrollIndicator={false}>
             
             {/* HEADER CELEBRAZIONE */}
             <View className="items-center mb-8">
                <View className="bg-yellow-500/20 w-24 h-24 rounded-full items-center justify-center border border-yellow-500/30 mb-4 shadow-lg shadow-yellow-900/50">
                   <Trophy size={48} color="#EAB308" />
                </View>
                <Text className="text-white text-3xl font-black tracking-tighter text-center uppercase">{t('summary.great_job')}</Text>
                <Text className="text-gray-400 font-bold mt-2 text-center text-sm">
                   {t('summary.routine_crushed', { name: summaryData.routineName })}
                </Text>
             </View>

             <View className="gap-y-4 mb-8">
                
                {/* TEMPO */}
                <View className="bg-black/40 rounded-[32px] p-6 border border-white/5 flex-row items-center justify-between shadow-inner">
                   <View>
                     <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{t('summary.workout_duration')}</Text>
                     <Text className="text-white font-black text-5xl tracking-tighter">{summaryData.timeString}</Text>
                   </View>
                   <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center border border-white/10">
                      <Clock size={32} color="#FFF" />
                   </View>
                </View>

                {/* SERIE E VOLUME */}
                <View className="flex-row gap-x-4">
                   <View className="flex-1 bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner">
                     <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center border border-blue-500/30 mb-4">
                        <Activity size={24} color="#3B82F6" />
                     </View>
                     <Text className="text-white font-black text-4xl tracking-tighter" numberOfLines={1} adjustsFontSizeToFit>{summaryData.completedSets}</Text>
                     <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">{t('summary.total_sets')}</Text>
                   </View>

                   <View className="flex-1 bg-[#10B981]/10 rounded-[32px] p-6 border border-[#10B981]/30 shadow-inner">
                     <View className="w-12 h-12 rounded-full bg-[#10B981]/20 items-center justify-center border border-[#10B981]/30 mb-4">
                        <Flame size={24} color="#10B981" />
                     </View>
                     <Text className="text-[#10B981] font-black text-4xl tracking-tighter" numberOfLines={1} adjustsFontSizeToFit>{(summaryData.totalVolume / 1000).toFixed(1)}k</Text>
                     <Text className="text-[#10B981]/60 font-bold text-[10px] uppercase tracking-widest mt-1">{t('summary.volume_kg')}</Text>
                   </View>
                </View>
             </View>

             {/* CORPO / MUSCOLI (DUMMY PLACEHOLDER) */}
             <View className="bg-black/60 rounded-[32px] p-6 mb-8 border border-white/5 items-center">
                <Text className="text-white font-black text-lg mb-4 text-center tracking-tight">{t('summary.muscle_map')}</Text>
                {/* Dummy Figure */}
                <View className="w-full h-48 bg-white/5 rounded-2xl border border-dashed border-white/10 items-center justify-center">
                   <Text className="text-4xl mb-2">🧍‍♂️</Text>
                   <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest text-center">{t('summary.model_coming_soon')}</Text>
                   <Text className="text-[#10B981] text-[10px] font-black mt-2 bg-[#10B981]/20 px-3 py-1 rounded-full uppercase">{t('exercises.target_muscle_group_mixed')}</Text>
                </View>
             </View>

             {/* LISTA ESERCIZI & PR */}
             <View className="mb-10">
                <Text className="text-gray-400 font-black text-xs uppercase tracking-[4px] mb-4 ml-2">{t('summary.progress')}</Text>
                {summaryData.exercises.map((ex, idx) => (
                   <View key={idx} className="bg-black/40 p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-white/5">
                      <View className="flex-row items-center flex-1">
                         <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-3 border border-white/10">
                            <Text className="text-white font-bold text-xs">{ex.setsCompleted}</Text>
                         </View>
                         <Text className="text-white font-bold text-sm tracking-tight flex-1" numberOfLines={1}>{ex.name}</Text>
                      </View>
                      
                      {idx % 2 === 0 ? (
                         <View className="bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30 flex-row items-center">
                            <Crown size={12} color="#EAB308" />
                            <Text className="text-yellow-500 font-black text-[10px] ml-1 uppercase">{t('summary.new_pr')}</Text>
                         </View>
                      ) : (
                         <View className="bg-white/5 px-2 py-1 rounded border border-white/5">
                            <Text className="text-gray-500 font-black text-[10px] uppercase">{t('summary.maintained')}</Text>
                         </View>
                      )}
                   </View>
                ))}
             </View>

             <View className="h-40" />
          </ScrollView>

          {/* NAVBAR BOTTOM ACTION (No Black Gradient) */}
          <View className="absolute bottom-0 left-0 right-0 p-6 pb-10 flex-row justify-between bg-black/60 border-t border-white/10 backdrop-blur-md">
             <TouchableOpacity 
               onPress={() => {}}
               className="bg-white/10 w-14 h-14 rounded-full items-center justify-center border border-white/10 shadow-lg"
             >
                <Share2 size={24} color="white" />
             </TouchableOpacity>

             <TouchableOpacity 
               onPress={closeSummary}
               className="flex-1 bg-white ml-4 h-14 rounded-[28px] items-center justify-center shadow-xl shadow-white/20"
             >
                <Text className="text-black font-black uppercase tracking-widest text-base">{t('summary.close_and_save')}</Text>
             </TouchableOpacity>
          </View>

       </BlurView>
    </View>
  );
}


