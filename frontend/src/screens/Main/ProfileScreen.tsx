import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { User, Settings, TrendingUp, Award, BarChart3, ChevronRight, Moon, Globe } from 'lucide-react-native';

import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [darkTheme, setDarkTheme] = useState(true);

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Mar 2026';

  const handleSignOut = () => {
    Alert.alert("Logout", "Sei sicuro di voler uscire?", [
      { text: "Annulla", style: "cancel" },
      { text: "Esci", style: "destructive", onPress: () => signOut() }
    ]);
  }

  return (
    <View className="flex-1 bg-[#040404]">
      <StatusBar style="light" />
      
      {/* Sfondo HomeScreen */}
      <View className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#10B981]/5 to-transparent opacity-80" />

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
              className="bg-white/10 p-3 rounded-full border border-white/5"
              onPress={handleSignOut}
            >
              <Settings size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Sezione Avatar e Nome */}
          <View className="items-center mb-10">
            <View className="w-32 h-32 bg-black/60 rounded-[48px] items-center justify-center border border-white/10 shadow-2xl mb-6">
              <User size={60} color="#10B981" strokeWidth={1.5} />
            </View>
            <Text className="text-white text-3xl font-[1000] tracking-tighter uppercase drop-shadow-md">{user?.user_metadata?.full_name || user?.email || 'User'}</Text>
            <View className="bg-[#10B981]/10 px-4 py-2 rounded-full mt-3 border border-[#10B981]/20">
              <Text className="text-[#10B981] font-black text-[10px] uppercase tracking-[3px]">Member since {memberSince}</Text>
            </View>
          </View>

          {/* Griglia Statistiche */}
          <View className="flex-row gap-x-4 mb-10">
             <View className="flex-1 bg-[#10B981]/10 p-6 rounded-[32px] items-center border border-[#10B981]/30 shadow-lg shadow-green-900/40">
                <TrendingUp size={24} color="#10B981" />
                <Text className="text-white font-[1000] text-3xl mt-3">14</Text>
                <Text className="text-[#10B981] font-black text-[8px] uppercase tracking-widest mt-1">Workouts</Text>
             </View>
             <View className="flex-1 bg-black/40 border border-white/5 p-6 rounded-[32px] items-center shadow-lg">
                <Award size={24} color="#3B82F6" />
                <Text className="text-white font-[1000] text-3xl mt-3">3</Text>
                <Text className="text-gray-500 font-black text-[8px] uppercase tracking-widest mt-1">PRs Set</Text>
             </View>
             <View className="flex-1 bg-black/40 border border-white/5 p-6 rounded-[32px] items-center shadow-lg">
                <BarChart3 size={24} color="#8B5CF6" />
                <Text className="text-white font-[1000] text-3xl mt-3">12</Text>
                <Text className="text-gray-500 font-black text-[8px] uppercase tracking-widest mt-1">Level</Text>
             </View>
          </View>

          {/* Menu Impostazioni */}
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-4 mt-2 px-1">Settings</Text>
          <View className="bg-black/40 border border-white/5 rounded-[32px] p-2 mb-10 shadow-2xl">
            <TouchableOpacity onPress={() => setDarkTheme(!darkTheme)} className="flex-row items-center justify-between p-4 px-5 border-b border-white/5">
               <View className="flex-row items-center">
                 <View className="bg-white/10 p-2.5 rounded-xl mr-4 border border-white/5">
                   <Moon size={20} color={darkTheme ? "#10B981" : "#FFF"} />
                 </View>
                 <Text className="text-white font-black text-base">Dark Mode</Text>
               </View>
               <View className={`w-12 h-6 rounded-full px-1 items-center flex-row ${darkTheme ? 'bg-[#10B981] justify-end' : 'bg-gray-700 justify-start'}`}>
                 <View className="w-4 h-4 bg-white rounded-full shadow-sm" />
               </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 px-5">
               <View className="flex-row items-center">
                 <View className="bg-white/10 p-2.5 rounded-xl mr-4 border border-white/5">
                   <Globe size={20} color="#FFF" />
                 </View>
                 <Text className="text-white font-black text-base">Language</Text>
               </View>
               <View className="flex-row items-center">
                 <Text className="text-gray-400 font-bold mr-2 uppercase text-xs">EN</Text>
                 <ChevronRight size={18} color="#6B7280" />
               </View>
            </TouchableOpacity>
          </View>

          {/* Lista Protocolli Personali */}
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-4 px-1">Personal Records</Text>
          <View className="gap-y-3">
             {['Bench Press', 'Squat', 'Deadlift'].map((exercise, i) => (
                <TouchableOpacity key={exercise} className="bg-black/40 border border-white/5 rounded-[32px] p-5 py-6 flex-row items-center shadow-lg">
                   <View className={`w-2.5 h-2.5 rounded-full mr-4 ${i === 0 ? 'bg-[#10B981]' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                   <View className="flex-1">
                      <Text className="text-white font-black text-lg tracking-tight">{exercise}</Text>
                      <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Best: {100 + i * 20}kg • 5 Reps</Text>
                   </View>
                   <ChevronRight size={20} color="#6B7280" />
                </TouchableOpacity>
             ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
