import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Plus, Dumbbell, History, Users, Layout, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../api/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import ExerciseLibrary from '../../components/exercises/ExerciseLibrary';

import { WorkoutTemplate } from '../../../../shared/types';

type WorkoutTemplateRow = Pick<WorkoutTemplate, 'id' | 'name'>;

export default function SchedeScreen() {
  const { session } = useAuthStore();
  
  // -- STATI PER IL POPUP (MODAL) WIKI --
  const [isWikiOpen, setIsWikiOpen] = useState(false);

  // -- FETCH TEMPLATES (Le tue schede) --
  const { data: templates, isLoading: isLoadingTemplates } = useQuery<WorkoutTemplateRow[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as WorkoutTemplateRow[];
    },
    enabled: !!session?.access_token,
  });

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      
      {/* BACKGROUND */}
      <LinearGradient colors={['#D1D5DB', '#FFFFFF', '#D1D5DB']} className="absolute inset-0" />

      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-10">
          {/* HEADER */}
          <View className="flex-row justify-between items-end mb-12">
            <View>
              <View className="flex-row items-center">
                <Text className="text-black text-4xl font-black tracking-tighter">THE</Text>
                <View className="ml-1 bg-black px-1.5 py-0.5">
                  <Text className="text-white text-2xl font-black italic">LAB</Text>
                </View>
              </View>
              <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-[3px] mt-1">
                Workout Templates
              </Text>
            </View>
            <TouchableOpacity className="bg-black p-3.5 rounded-2xl shadow-xl" activeOpacity={0.8}>
              <Plus size={24} color="white" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* QUICK ACTIONS */}
          <View className="flex-row justify-between mb-12 gap-x-4">
            <TouchableOpacity className="items-center bg-white/60 p-4 rounded-3xl border border-black/5 flex-1 shadow-sm">
              <View className="bg-black/5 p-2 rounded-xl mb-2">
                <Dumbbell size={18} color="black" />
              </View>
              <Text className="text-black text-[10px] font-black uppercase tracking-widest">Custom</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center bg-white/60 p-4 rounded-3xl border border-black/5 flex-1 shadow-sm">
              <View className="bg-black/5 p-2 rounded-xl mb-2">
                <Layout size={18} color="black" />
              </View>
              <Text className="text-black text-[10px] font-black uppercase tracking-widest">AI Gen</Text>
            </TouchableOpacity>
            
            {/* BOTTONE WIKI: Apre il Modal */}
            <TouchableOpacity 
              onPress={() => setIsWikiOpen(true)}
              className="items-center bg-white/60 p-4 rounded-3xl border border-black/5 flex-1 shadow-sm"
              activeOpacity={0.7}
            >
              <View className="bg-black/5 p-2 rounded-xl mb-2">
                <Users size={18} color="black" />
              </View>
              <Text className="text-black text-[10px] font-black uppercase tracking-widest">Exercise</Text>
            </TouchableOpacity>
          </View>

          {/* TEMPLATES LIST */}
          <View>
            <Text className="text-black/30 text-[10px] font-black uppercase tracking-[4px] mb-6 ml-1">
              My Routines
            </Text>

            {isLoadingTemplates ? (
              <ActivityIndicator color="#000" />
            ) : templates && templates.length > 0 ? (
              templates.map((template) => (
                <TouchableOpacity key={template.id} className="bg-white/70 border border-black/5 rounded-[32px] p-6 mb-5 flex-row items-center shadow-lg shadow-black/5" activeOpacity={0.7}>
                  <View className="bg-black p-3.5 rounded-2xl mr-5 shadow-md">
                    <Dumbbell size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black font-black text-xl tracking-tight">{template.name}</Text>
                  </View>
                  <View className="bg-black/5 p-2 rounded-full">
                    <ChevronRight size={18} color="#999" strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-white/40 border border-dashed border-black/20 rounded-[40px] p-12 items-center">
                <View className="bg-black/5 p-5 rounded-full mb-4">
                  <History size={32} color="#BBB" />
                </View>
                <Text className="text-gray-400 text-center font-bold text-sm uppercase tracking-widest leading-loose">
                  No routines found.{"\n"}tap + to build your lab.
                </Text>
              </View>
            )}
          </View>
          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>

       <ExerciseLibrary 
        visible={isWikiOpen} 
        onClose={() => setIsWikiOpen(false)}
      />

    </View>
  );
}