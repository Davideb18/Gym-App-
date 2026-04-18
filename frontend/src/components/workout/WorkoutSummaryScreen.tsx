import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { BarChart } from 'react-native-gifted-charts';
import {
  Trophy,
  Flame,
  Share2,
  Crown,
  Activity,
  Clock,
  Sparkles,
  Target,
  Dumbbell,
} from 'lucide-react-native';
import { useWorkoutSummaryStore } from '../../store/useWorkoutSummaryStore';
import { useTranslation } from 'react-i18next';

export default function WorkoutSummaryScreen() {
  const { t } = useTranslation();
  const { isOpen, summaryData, closeSummary } = useWorkoutSummaryStore();
  const { width } = Dimensions.get('window');

  if (!isOpen || !summaryData) return null;

  const newPrs = summaryData.newPrs || [];
  const muscleGroups = summaryData.muscleGroups || [];
  const coachTips = summaryData.coachTips || [];
  const barData = (summaryData.exerciseVolumeBars || []).map((entry, index) => ({
    value: entry.value,
    label: entry.label,
    frontColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#F97316'][index % 6],
  }));

  return (
    <View className="absolute inset-0 z-[200] elevation-[200]">
      <BlurView intensity={100} tint="dark" className="flex-1">
        <ScrollView className="flex-1 pt-16 px-6" showsVerticalScrollIndicator={false}>
          {/* HEADER CELEBRAZIONE */}
          <View className="items-center mb-8">
            <View className="bg-yellow-500/20 w-24 h-24 rounded-full items-center justify-center border border-yellow-500/30 mb-4 shadow-lg shadow-yellow-900/50">
              <Trophy size={48} color="#EAB308" />
            </View>
            <Text className="text-white text-3xl font-black tracking-tighter text-center uppercase">
              {t('summary.great_job')}
            </Text>
            <Text className="text-gray-400 font-bold mt-2 text-center text-sm">
              {t('summary.routine_crushed', { name: summaryData.routineName })}
            </Text>
          </View>

          <View className="gap-y-4 mb-8">
            {/* TEMPO */}
            <View className="bg-black/40 rounded-[32px] p-6 border border-white/5 flex-row items-center justify-between shadow-inner">
              <View>
                <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">
                  {t('summary.workout_duration')}
                </Text>
                <Text className="text-white font-black text-5xl tracking-tighter">
                  {summaryData.timeString}
                </Text>
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
                <Text
                  className="text-white font-black text-4xl tracking-tighter"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {summaryData.completedSets}
                </Text>
                <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                  {t('summary.total_sets')}
                </Text>
              </View>

              <View className="flex-1 bg-[#10B981]/10 rounded-[32px] p-6 border border-[#10B981]/30 shadow-inner">
                <View className="w-12 h-12 rounded-full bg-[#10B981]/20 items-center justify-center border border-[#10B981]/30 mb-4">
                  <Flame size={24} color="#10B981" />
                </View>
                <Text
                  className="text-[#10B981] font-black text-4xl tracking-tighter"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {(summaryData.totalVolume / 1000).toFixed(1)}k
                </Text>
                <Text className="text-[#10B981]/60 font-bold text-[10px] uppercase tracking-widest mt-1">
                  {t('summary.volume_kg')}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-black/60 rounded-[32px] p-6 mb-8 border border-white/5">
            <Text className="text-white font-black text-lg mb-2 text-center tracking-tight">
              {t('summary.record_block')}
            </Text>
            <Text className="text-white/70 text-xs font-semibold text-center mb-5">
              {newPrs.length > 0
                ? `${newPrs.length} ${t('summary.new_pr')}`
                : t('summary.no_new_records')}
            </Text>

            {newPrs.length > 0 ? (
              <View className="gap-y-3">
                {newPrs.map((record, idx) => (
                  <View
                    key={`${record.exerciseName}-${idx}`}
                    className="bg-black/40 rounded-2xl p-4 border border-yellow-500/20"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 pr-2">
                        <Crown size={14} color="#EAB308" />
                        <Text
                          className="text-white font-black text-base ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {record.exerciseName}
                        </Text>
                      </View>
                      <View className="bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30">
                        <Text className="text-yellow-400 font-black text-[10px] uppercase tracking-[1px]">
                          PR
                        </Text>
                      </View>
                    </View>
                    <Text className="text-white/90 font-bold text-sm">
                      {record.weight} kg x {record.reps}
                    </Text>
                    <Text className="text-white/60 font-bold text-xs mt-1">
                      e1RM {record.e1rm.toFixed(1)} kg
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-4">
                <Sparkles size={18} color="#10B981" />
                <Text className="text-white/80 font-bold text-sm mt-2 text-center">
                  {t('summary.no_new_records')}
                </Text>
              </View>
            )}
          </View>

          <View className="bg-black/60 rounded-[32px] p-6 mb-8 border border-white/5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-black text-lg tracking-tight">
                {t('summary.improvement_chart')}
              </Text>
              <Text className="text-white/60 font-bold text-[10px] uppercase tracking-[1px]">
                {t('summary.chart_hint')}
              </Text>
            </View>

            {barData.length > 0 ? (
              <BarChart
                data={barData}
                width={Math.max(260, width - 96)}
                height={180}
                barWidth={22}
                spacing={12}
                noOfSections={4}
                hideRules
                yAxisColor="transparent"
                xAxisColor="rgba(255,255,255,0.12)"
                yAxisTextStyle={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
                xAxisLabelTextStyle={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
                isAnimated
                roundedTop
              />
            ) : (
              <Text className="text-white/70 text-sm">{t('summary.no_new_records')}</Text>
            )}
          </View>

          <View className="bg-black/60 rounded-[32px] p-6 mb-8 border border-white/5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-black text-lg tracking-tight">
                {t('summary.muscle_focus')}
              </Text>
              <Target size={18} color="#10B981" />
            </View>

            <View className="flex-row flex-wrap gap-2">
              {muscleGroups.length > 0 ? (
                muscleGroups.map((group) => (
                  <View
                    key={group.name}
                    className="px-3 py-2 rounded-full border"
                    style={{ borderColor: `${group.color}40`, backgroundColor: `${group.color}20` }}
                  >
                    <Text className="text-white font-black text-[10px] uppercase tracking-[1px]">
                      {group.name} · {group.count}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-white/70 text-sm">{t('summary.no_new_records')}</Text>
              )}
            </View>
          </View>

          <View className="bg-black/60 rounded-[32px] p-6 mb-8 border border-white/5">
            <Text className="text-white font-black text-lg mb-4 tracking-tight">
              {t('summary.coach_tips')}
            </Text>

            {coachTips.length > 0 ? (
              <View className="gap-y-3">
                {coachTips.map((tip, idx) => (
                  <View
                    key={`${tip}-${idx}`}
                    className="flex-row items-start bg-black/30 rounded-2xl p-4 border border-white/5"
                  >
                    <View className="w-8 h-8 rounded-full bg-[#10B981]/20 items-center justify-center mr-3 border border-[#10B981]/20">
                      <Dumbbell size={14} color="#10B981" />
                    </View>
                    <Text className="text-white/90 text-sm flex-1 leading-5">{tip}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-white/70 text-sm">{t('summary.no_new_records')}</Text>
            )}
          </View>

          <View className="mb-10">
            <Text className="text-gray-400 font-black text-xs uppercase tracking-[4px] mb-4 ml-2">
              {t('summary.progress')}
            </Text>
            {summaryData.exercises.map((ex, idx) => (
              <View
                key={idx}
                className="bg-black/40 p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-white/5"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-3 border border-white/10">
                    <Text className="text-white font-bold text-xs">{ex.setsCompleted}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm tracking-tight" numberOfLines={1}>
                      {ex.name}
                    </Text>
                    <Text className="text-white/50 font-semibold text-[10px] uppercase tracking-[1px] mt-1">
                      {ex.totalVolume.toLocaleString()} kg
                    </Text>
                  </View>
                </View>

                {idx % 2 === 0 ? (
                  <View className="bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30 flex-row items-center">
                    <Crown size={12} color="#EAB308" />
                    <Text className="text-yellow-500 font-black text-[10px] ml-1 uppercase">
                      {t('summary.new_pr')}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-white/5 px-2 py-1 rounded border border-white/5">
                    <Text className="text-gray-500 font-black text-[10px] uppercase">
                      {t('summary.maintained')}
                    </Text>
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
            <Text className="text-black font-black uppercase tracking-widest text-base">
              {t('summary.close_and_save')}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}
