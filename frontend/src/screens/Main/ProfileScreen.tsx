import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { User, Settings, TrendingUp, Award, BarChart3, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <LinearGradient colors={['#D1D5DB', '#FFFFFF', '#D1D5DB']} className="absolute inset-0" />

      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-10">
          <View className="flex-row justify-between items-center mb-10">
             <View className="flex-row items-center">
              <Text className="text-black text-3xl font-[1000] tracking-tighter">THE</Text>
              <View className="ml-1 bg-black px-1.5 py-0.5">
                <Text className="text-white text-xl font-black italic">LAB</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-black p-3 rounded-2xl">
              <Settings size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* USER INFO */}
          <View className="items-center mb-12">
            <View className="w-32 h-32 bg-black rounded-[48px] items-center justify-center shadow-2xl mb-6">
              <User size={60} color="#00FF00" strokeWidth={1.5} />
            </View>
            <Text className="text-black text-3xl font-[1000] tracking-tighter uppercase">Davide B.</Text>
            <View className="bg-black/5 px-4 py-2 rounded-full mt-2">
              <Text className="text-black/40 font-black text-[10px] uppercase tracking-[3px]">Member since Mar 2026</Text>
            </View>
          </View>

          {/* STATS GRID */}
          <View className="flex-row gap-x-4 mb-10">
             <View className="flex-1 bg-black p-6 rounded-[32px] items-center shadow-lg">
                <TrendingUp size={24} color="#00FF00" />
                <Text className="text-white font-[1000] text-2xl mt-2">14</Text>
                <Text className="text-white/40 font-black text-[8px] uppercase tracking-widest">Sessions</Text>
             </View>
             <View className="flex-1 bg-white/70 border border-black/5 p-6 rounded-[32px] items-center shadow-sm">
                <Award size={24} color="black" />
                <Text className="text-black font-[1000] text-2xl mt-2">3</Text>
                <Text className="text-black/30 font-black text-[8px] uppercase tracking-widest">PRs Set</Text>
             </View>
             <View className="flex-1 bg-white/70 border border-black/5 p-6 rounded-[32px] items-center shadow-sm">
                <BarChart3 size={24} color="black" />
                <Text className="text-black font-[1000] text-2xl mt-2">12</Text>
                <Text className="text-black/30 font-black text-[8px] uppercase tracking-widest">Level</Text>
             </View>
          </View>

          {/* PR RECORD LIST */}
          <Text className="text-black/30 text-[10px] font-black uppercase tracking-[4px] mb-6 px-1">Personal Protocols</Text>
          <View className="gap-y-4">
             {['Bench Press', 'Squat', 'Deadlift'].map((exercise, i) => (
                <TouchableOpacity key={i} className="bg-white/60 border border-black/5 rounded-[32px] p-6 flex-row items-center shadow-sm">
                   <View className="w-2 h-2 rounded-full bg-black mr-4" />
                   <View className="flex-1">
                      <Text className="text-black font-black text-lg tracking-tight">{exercise}</Text>
                      <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Best: {100 + i * 20}kg • 5 Reps</Text>
                   </View>
                   <ChevronRight size={18} color="#CCC" />
                </TouchableOpacity>
             ))}
          </View>

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
