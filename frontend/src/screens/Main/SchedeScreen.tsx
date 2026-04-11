import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Plus, Dumbbell, History, Users, Layout, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../api/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import ExerciseLibrary from '../../components/exercises/ExerciseLibrary';
import { WorkoutService } from '../../api/workoutService';
import { WorkoutTemplate } from '../../../../shared/types';
import PremiumModal from '../../components/ui/PremiumModal';

import { useWorkoutPreviewStore } from '../../store/useWorkoutPreviewStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';

type WorkoutTemplateRow = Pick<WorkoutTemplate, 'id' | 'name' | 'description' | 'created_at'>;

export default function SchedeScreen() {
  const { session } = useAuthStore();
  const userId = session?.user?.id;
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);
  
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Global Stores per le schermate a tutto schermo (no Modals)
  const { openPreview } = useWorkoutPreviewStore();
  const { openCreate } = useCreateRoutineStore();

  useEffect(() => {
    let mounted = true;
    const loadPremiumStatus = async () => {
      if (!userId) {
        if (mounted) setIsPremium(false);
        return;
      }
      try {
        setIsLoadingPremium(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', userId)
          .single();

        if (error) {
          if (mounted) setIsPremium(false);
          return;
        }

        if (mounted) {
          setIsPremium(!!data?.is_premium);
        }
      } catch {
        if (mounted) setIsPremium(false);
      } finally {
        if (mounted) setIsLoadingPremium(false);
      }
    };

    loadPremiumStatus();
    return () => { mounted = false; };
  }, [userId]);

  const openCreateRoutineFlow = () => {
    if (isLoadingPremium) return;
    const templatesCount = templates?.length ?? 0;
    const freeLimitReached = !isPremium && templatesCount >= 4;
    if (freeLimitReached) {
      setIsPremiumModalOpen(true);
      return;
    }
    openCreate(); // Usa lo store globale per aprire la schermata
  };

  const openRoutine = (templateId: string) => {
    openPreview(templateId); // Usa lo store globale
  };

  const handleDeleteRoutine = (templateId: string, templateName: string) => {
    Alert.alert(
      'Elimina Scheda',
      `Sei sicuro di voler eliminare definitivamente "${templateName}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: async () => {
            try {
              await WorkoutService.deleteTemplate(templateId, userId!);
              await refetchTemplates();
            } catch (err: any) {
              Alert.alert('Errore', err?.message || 'Non è stato possibile eliminare la scheda.');
            }
          }
        }
      ]
    );
  };

  const { 
    data: templates, 
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
    refetch: refetchTemplates
  } = useQuery<WorkoutTemplateRow[]>({
    queryKey: ['templates', userId],
    queryFn: async () => {
      if(!userId) return [];
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: false })
        .eq('profile_id', userId);

      if (error) throw error;
      return (data ?? []) as WorkoutTemplateRow[];
    },
    enabled: !!userId,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchTemplates();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-[#040404]">
      <StatusBar style="light" />
      
      {/* Sfondo HomeScreen */}
      <View className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#10B981]/5 to-transparent opacity-80" />

      <SafeAreaView className="flex-1">
        <ScrollView 
          className="px-5 pt-10"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* HEADER */}
          <View className="flex-row justify-between items-end mb-12">
            <View>
              <View className="flex-row items-center">
                <Text className="text-white text-4xl font-black tracking-tighter">THE</Text>
                <View className="ml-1 bg-[#10B981] px-1.5 py-0.5 rounded shadow-sm shadow-green-900/50">
                  <Text className="text-black text-2xl font-black italic">LAB</Text>
                </View>
              </View>
              <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-[3px] mt-1 ml-1">
                Workout Templates
              </Text>
            </View>
            <TouchableOpacity 
              onPress={openCreateRoutineFlow}
              className="bg-white/10 p-3.5 rounded-2xl shadow-xl border border-white/5" 
              activeOpacity={0.8}
            >
              <Plus size={24} color="white" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Azioni Rapide */}
          <View className="flex-row justify-between mb-12 gap-x-4">
            <TouchableOpacity               
                onPress={openCreateRoutineFlow}
                className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg"
                activeOpacity={0.7}
            >
              <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
                <Dumbbell size={18} color="#10B981" />
              </View>
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">Custom</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg">
              <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
                <Layout size={18} color="#3B82F6" />
              </View>
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">AI Gen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setIsWikiOpen(true)}
              className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg"
              activeOpacity={0.7}
            >
              <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
                <Users size={18} color="#8B5CF6" />
              </View>
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">Exercise</Text>
            </TouchableOpacity>
          </View>

          {/* Lista delle Schede Create */}
          <View>
            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-6 ml-1">
              My Routines
            </Text>

            {isLoadingTemplates ? (
              <ActivityIndicator color="#10B981" />
            ) : isTemplatesError ? (
              <View className="bg-black/60 border border-red-500/20 rounded-[32px] p-6 mb-5 items-center">
                  <Text className="text-red-400 font-bold text-center mb-4">Errore nel caricamento delle routine</Text>
                  <TouchableOpacity onPress={() => refetchTemplates()} className="bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30" activeOpacity={0.8}>
                    <Text className="text-red-400 font-bold">Riprova</Text>
                  </TouchableOpacity>
                </View>
            ) : (
              <View>
                {templates?.map((template) => (
                  <TouchableOpacity 
                    key={template.id} 
                    className="bg-black/60 border border-white/5 rounded-[32px] p-6 mb-5 flex-row items-center shadow-2xl" 
                    activeOpacity={0.7}
                    onPress={() => openRoutine(template.id)}
                    onLongPress={() => handleDeleteRoutine(template.id, template.name)}
                  >
                    <View className="bg-[#10B981]/10 p-4 rounded-2xl mr-5 border border-[#10B981]/20 shadow-md">
                      <Dumbbell size={22} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-black text-xl tracking-tight">{template.name}</Text>
                      {template.description ? <Text className="text-gray-500 font-bold text-xs mt-1" numberOfLines={1}>{template.description}</Text> : null}
                    </View>
                    <View className="bg-white/5 p-2 rounded-full">
                      <ChevronRight size={18} color="#6B7280" strokeWidth={3} />
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={openCreateRoutineFlow}
                  activeOpacity={0.8}
                  className="bg-black/40 border border-dashed border-white/20 rounded-[40px] p-12 items-center mb-5"
                >
                  <View className="bg-white/5 p-5 rounded-full mb-4 border border-white/5">
                    <Plus size={32} color="#fff" />
                  </View>
                  <Text className="text-gray-400 text-center font-bold text-sm uppercase tracking-widest leading-loose">
                    {templates?.length === 0 ? "No routines found.\nTap + to build your lab" : "Add New Routine"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </SafeAreaView>

       <ExerciseLibrary 
        visible={isWikiOpen} 
        onClose={() => setIsWikiOpen(false)}
      />

      <PremiumModal 
        visible={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
        onUpgrade={() => {
          Alert.alert("Premium", "Logica di upgrade in arrivo!");
          setIsPremiumModalOpen(false);
        }}
      />
    </View>
  );
}