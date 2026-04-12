import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { User, Settings, TrendingUp, Award, BarChart3, ChevronRight, Globe, Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../api/supabaseClient';
import { changeLanguage } from '../../locales/i18n';
import ExerciseDetailModal from '../../components/exercises/ExerciseDetailModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const { openExercise } = useExerciseModal();
  
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })
    : 'Mar 2026';

  const handleSignOut = () => {
    Alert.alert(t('profile.sign_out'), t('profile.sign_out_confirm'), [
      { text: t('common.cancel'), style: "cancel" },
      { text: t('profile.sign_out'), style: "destructive", onPress: () => signOut() }
    ]);
  }

  const handleLanguageSelect = (lng: string) => {
    changeLanguage(lng);
    setLangModalVisible(false);
  };

  const { data: prs, isLoading: loadingPRs } = useQuery({
    queryKey: ['personalRecords', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performed_sets')
        .select(`
          weight,
          reps,
          exercises(id, name, target_muscle_group, equipment, instructions),
          workout_sessions!inner(profile_id)
        `)
        .eq('workout_sessions.profile_id', user!.id)
        .order('weight', { ascending: false })
        .limit(200);

      if (error || !data) return [];
      
      const bestLifts = new Map();
      data.forEach((set: any) => {
        const ex = set.exercises;
        const w = Number(set.weight) || 0;
        if (ex?.name && w > 0) {
          if (!bestLifts.has(ex.name)) {
            bestLifts.set(ex.name, { weight: w, reps: set.reps, exercise: ex });
          } else {
             if (w > bestLifts.get(ex.name).weight) {
                bestLifts.set(ex.name, { weight: w, reps: set.reps, exercise: ex });
             }
          }
        }
      });
      return Array.from(bestLifts.entries())
        .map(([name, stats]: any) => ({ name, weight: stats.weight, reps: stats.reps, exercise: stats.exercise }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);
    },
    enabled: !!user?.id,
  });

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Sfondo Unificato Ibrido (Nero -> Grigio Chiaro) */}
      <LinearGradient colors={['#171717', '#D1D5DB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', width: '100%', height: '100%' }} />

      <SafeAreaView className="flex-1">
        <ScrollView className="px-5 pt-8" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          
            <View className="flex-row justify-between items-center mb-8">
               <View className="flex-row items-center">
                <Text className="text-white text-3xl font-[1000] tracking-tighter">THE</Text>
                <View className="ml-1 bg-[#10B981] px-1.5 py-0.5 rounded shadow-sm shadow-green-900/50">
                  <Text className="text-black text-xl font-black italic">LAB</Text>
                </View>
              </View>
            <TouchableOpacity 
              className="bg-black/40 p-3 rounded-full border border-white/5 shadow-md"
              onPress={handleSignOut}
            >
              <Settings size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Sezione Avatar e Nome */}
          <View className="items-center mb-10 mt-4">
            <View className="w-32 h-32 bg-black/60 rounded-[48px] items-center justify-center border border-white/10 shadow-[8px_8px_20px_rgba(0,0,0,0.3)] mb-6">
              <User size={60} color="#FFF" strokeWidth={1.5} />
            </View>
            <Text className="text-white text-3xl font-[1000] tracking-tighter uppercase drop-shadow-md">{user?.user_metadata?.full_name || user?.email || 'User'}</Text>
            <View className="bg-black/40 px-4 py-2 rounded-full mt-3 border border-white/5">
              <Text className="text-gray-300 font-black text-[10px] uppercase tracking-[3px]">{t('profile.member_since', { date: memberSince })}</Text>
            </View>
          </View>

          {/* Griglia Statistiche */}
          <View className="flex-row gap-x-4 mb-10">
             <View className="flex-1 bg-black/60 p-6 rounded-[32px] items-center border border-white/5 shadow-lg">
                <TrendingUp size={24} color="#10B981" />
                <Text className="text-white font-[1000] text-3xl mt-3">--</Text>
                <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest mt-1">{t('profile.workouts_count')}</Text>
             </View>
             <View className="flex-1 bg-black/60 p-6 rounded-[32px] items-center border border-white/5 shadow-lg">
                <Award size={24} color="#3B82F6" />
                <Text className="text-white font-[1000] text-3xl mt-3">{prs?.length || 0}</Text>
                <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest mt-1">{t('profile.prs_set')}</Text>
             </View>
             <View className="flex-1 bg-black/60 p-6 rounded-[32px] items-center border border-white/5 shadow-lg">
                <BarChart3 size={24} color="#8B5CF6" />
                <Text className="text-white font-[1000] text-3xl mt-3">12</Text>
                <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest mt-1">{t('profile.level')}</Text>
             </View>
          </View>

          {/* Menu Impostazioni */}
          <Text className="text-gray-800 text-[10px] font-black uppercase tracking-[4px] mb-4 mt-2 px-1">{t('profile.settings')}</Text>
          <View className="bg-black/40 border border-white/5 rounded-[32px] p-2 mb-10 shadow-lg">
            <TouchableOpacity onPress={() => setLangModalVisible(true)} className="flex-row items-center justify-between p-4 px-5">
               <View className="flex-row items-center">
                 <View className="bg-white/5 p-2.5 rounded-xl mr-4 border border-white/5">
                   <Globe size={20} color="#FFF" />
                 </View>
                 <Text className="text-white font-black text-base">{t('profile.language')}</Text>
               </View>
               <View className="flex-row items-center">
                 <Text className="text-gray-400 font-bold mr-2 uppercase text-xs">{i18n.language.toUpperCase()}</Text>
                 <ChevronRight size={18} color="#9CA3AF" />
               </View>
            </TouchableOpacity>
          </View>

          {/* Lista Protocolli Personali */}
          <Text className="text-gray-800 text-[10px] font-black uppercase tracking-[4px] mb-4 px-1">{t('profile.prs_set')}</Text>
          <View className="gap-y-4 mb-20">
             {loadingPRs ? (
                <ActivityIndicator size="small" color="#10B981" />
             ) : prs && prs.length > 0 ? (
                prs.map((pr: any, i: number) => (
                  <TouchableOpacity 
                    key={pr.name} 
                    onPress={() => openExercise(pr.exercise.id)}
                    className="bg-black/60 border border-white/5 rounded-[32px] p-5 py-6 flex-row items-center shadow-lg"
                  >
                     <View className={`w-2.5 h-2.5 rounded-full mr-4 ${i === 0 ? 'bg-[#10B981]' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                     <View className="flex-1 gap-y-1">
                        <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>{pr.name}</Text>
                        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">{t('profile.best', { weight: pr.weight, reps: pr.reps })}</Text>
                     </View>
                     <ChevronRight size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                ))
             ) : (
                <View className="items-center py-6 bg-black/40 border border-white/5 rounded-[32px] border-dashed">
                  <Dumbbell size={24} color="#666" />
                  <Text className="text-gray-500 font-bold mt-2 text-xs">{t('profile.no_records')}</Text>
                </View>
             )}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Modal Selezione Lingua */}
      <Modal visible={langModalVisible} animationType="slide" transparent onRequestClose={() => setLangModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setLangModalVisible(false)} />
            <View style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44, backgroundColor: '#171717' }}>
              <LinearGradient colors={['#171717', '#262626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
              <View className="w-10 h-1.5 bg-white/30 rounded-full self-center mb-5" />
            
            <Text className="text-white text-xl font-black mb-6 px-4">{t('profile.language')}</Text>

            {[
              { id: 'it', label: 'Italiano', flag: '🇮🇹' },
              { id: 'en', label: 'English', flag: '🇺🇸' },
              { id: 'es', label: 'Español', flag: '🇪🇸' }
            ].map((lang) => (
              <TouchableOpacity 
                key={lang.id} 
                onPress={() => handleLanguageSelect(lang.id)}
                className={`flex-row items-center justify-between p-5 mb-3 rounded-[24px] border ${i18n.language === lang.id ? 'bg-[#10B981]/20 border-[#10B981]/40' : 'bg-black/20 border-white/5'}`}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-4">{lang.flag}</Text>
                  <Text className="text-white font-black text-lg">{lang.label}</Text>
                </View>
                {i18n.language === lang.id && <View className="w-3 h-3 rounded-full bg-[#10B981]" />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              onPress={() => setLangModalVisible(false)} 
              className="mt-4 py-4 items-center bg-white/10 rounded-[24px] border border-white/10"
            >
              <Text className="text-white font-bold">{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}
