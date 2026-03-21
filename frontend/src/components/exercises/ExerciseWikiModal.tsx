import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Dumbbell, X, Search, Lock, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { ExerciseService } from '../../api/exerciseService'; 
// (Assicurati che il percorso di ExerciseService sia corretto in base a dove metti il file)

interface Props {
  visible: boolean;
  onClose: () => void;
  isPremium: boolean; // riceve da fuori se l'utente è premium o no
}

export default function ExerciseWikiModal({ visible, onClose, isPremium }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch exercises ONLY when modal is open
  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', isPremium],
    queryFn: () => ExerciseService.getExercises(isPremium),
    enabled: visible, 
  });

  const filteredExercises = exercises?.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.target_muscle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-50 pt-6">
        
        {/* Modal Header */}
        <View className="flex-row justify-between items-center px-6 mb-6">
          <View>
            <Text className="text-black text-3xl font-black tracking-tight">Esercizi</Text>
            <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-[2px] mt-1">
              MuscleWiki Database
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="bg-black/5 p-3 rounded-full">
            <X size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Premium Banner */}
        {!isPremium && (
          <View className="mx-6 bg-black p-4 rounded-2xl flex-row items-center mb-6">
            <Lock size={20} color="#fbbf24" strokeWidth={2.5} />
            <View className="ml-4 flex-1">
              <Text className="text-white font-bold">Catalogo Limitato</Text>
              <Text className="text-gray-400 text-xs mt-1">Passa a Premium per accedere a tutti gli 800+ esercizi video.</Text>
            </View>
          </View>
        )}

        {/* SearchBar */}
        <View className="px-6 mb-6">
          <View className="bg-white border border-gray-200 rounded-2xl flex-row items-center px-4 py-3 shadow-sm">
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              placeholder="Cerca panca, trazioni..." 
              className="flex-1 ml-3 font-medium text-black"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Lista Esercizi */}
        <ScrollView className="px-6">
          {isLoading ? (
            <ActivityIndicator color="#000" size="large" className="mt-10" />
          ) : filteredExercises && filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <TouchableOpacity 
                key={exercise.id} 
                className="bg-white p-4 rounded-3xl mb-3 flex-row items-center border border-gray-100 shadow-sm"
                activeOpacity={0.7}
                // Qui in futuro metteremo un onPress={() => apriDettaglioEsercizio(exercise)}
              >
                <View className="bg-gray-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                  <Dumbbell size={20} color="#666" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-bold text-lg">{exercise.name}</Text>
                  <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                    {exercise.target_muscle || 'General'}
                  </Text>
                </View>
                <ChevronRight size={18} color="#CCC" />
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-center text-gray-400 font-bold mt-10">Nessun esercizio trovato nel DB.</Text>
          )}
          <View className="h-20" />
        </ScrollView>

      </View>
    </Modal>
  );
}