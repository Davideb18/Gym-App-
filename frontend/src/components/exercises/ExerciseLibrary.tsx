import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next'; // <--- AGGIUNTO
import { Exercise } from '../../../../shared/types'; // (aggiusta il percorso)
import { X, ChevronDown, Check } from 'lucide-react-native';
import { ExerciseService } from '../../api/exerciseService';
import ExerciseDetailModal from './ExerciseDetailModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebounce } from '../../hooks/useDebounce';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

const DIFFICULTIES: Array<'novice' | 'intermediate' | 'advanced'> = ['novice', 'intermediate', 'advanced'];
const DIFFICULTY_WEIGHT: Record<string, number> = { novice: 1, intermediate: 2, advanced: 3 };

const MUSCLE_LABELS: Record<string, string> = {
  Chest: 'Petto',
  Lats: 'Dorsali',
  'Lower Back': 'Lombari',
  Quads: 'Quadricipiti',
  Shoulders: 'Spalle',
  Biceps: 'Bicipiti',
  Triceps: 'Tricipiti',
  Abs: 'Addome',
};

const getLocalizedMuscle = (muscle?: string | null) => {
  if (!muscle) return 'N/A';
  return MUSCLE_LABELS[muscle] || muscle;
};

const getFallbackImageUrl = (exerciseName: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(exerciseName)}&background=E5E7EB&color=111827&size=128&rounded=true`;

export default function ExerciseLibrary({ visible = true, onClose }: Props) {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'difficulty' | 'recent'>('alphabetical');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ExerciseService.getExercises(true);
      setExercises(data);
      setFailedImageIds({});
    } catch (error) {
      console.error('Errore nel caricamento degli esercizi:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchExercises();
    } else {
      setIsDetailOpen(false);
      setSelectedExercise(null);
      setIsSortMenuOpen(false);
    }
  }, [fetchExercises, visible]);

  useEffect(() => {
    if (!visible) {
      setSelectedExercise(null);
      setIsDetailOpen(false);
      setIsSortMenuOpen(false);
    }
  }, [visible]);

  const muscleOptions = useMemo(
    () =>
      Array.from(
        new Set(
          exercises
            .map((ex) => ex.target_muscle)
            .filter((muscle): muscle is string => Boolean(muscle))
        )
      ),
    [exercises]
  );

  const filteredAndSortedExercises = useMemo(() => {
    let result = exercises;

    if (debouncedSearchQuery) {
      const normalizedQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter((exercise) =>
        exercise.name.toLowerCase().includes(normalizedQuery)
      );
    }

    if (selectedMuscle) {
      result = result.filter((exercise) => exercise.target_muscle === selectedMuscle);
    }

    if (selectedDifficulty) {
      result = result.filter((exercise) => exercise.difficulty === selectedDifficulty);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'difficulty') {
        const wA = DIFFICULTY_WEIGHT[a.difficulty || ''] || 0;
        const wB = DIFFICULTY_WEIGHT[b.difficulty || ''] || 0;
        return wA - wB;
      }

      return 0;
    });

    return result;
  }, [exercises, debouncedSearchQuery, selectedMuscle, selectedDifficulty, sortBy]);



   return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={isDetailOpen ? () => setIsDetailOpen(false) : onClose}
    >
      <View
        style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={isDetailOpen ? undefined : onClose}
        />

        <View
          className="w-full h-[92%] rounded-t-[38px] overflow-hidden"
        >
          <LinearGradient
            colors={['#d4d4d8', '#e4e4e7', '#ffffff']}
            locations={[0, 0.35, 1]}
            style={{ flex: 1, paddingTop: 16, paddingHorizontal: 24 }}
          >
          <View className="bg-transparent" style={{ zIndex: 10 }}>
           <View className="items-center mb-4">
              <View className="w-16 h-1.5 bg-black/20 rounded-full" />
           </View>
           <View className="flex-row justify-between items-center mb-6">
              <Text className="text-3xl font-black">{t('exercises.title')}</Text>
              {onClose && (
                <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <X size={20} color="black" />
                </TouchableOpacity>
              )}
           </View>
          </View>
          <View>
         <TextInput 
            className="bg-gray-100 p-4 rounded-2xl mb-4 font-bold text-black"
            placeholder={t('exercises.search_placeholder')}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)} // Aggiorna lo stato quando scrivi!
            />
            
         {/* FILTRI MUSCOLARI (Orizzontali) */}
         <View className="mb-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
               <TouchableOpacity 
                  onPress={() => setSelectedMuscle(null)} 
                  className={`px-4 py-2 rounded-full mr-2 ${selectedMuscle === null ? 'bg-black' : 'bg-gray-100'}`}
               >
                  <Text className={`font-bold ${selectedMuscle === null ? 'text-white' : 'text-gray-600'}`}>Tutti</Text>
               </TouchableOpacity>
              {muscleOptions.map((muscle) => (
                  <TouchableOpacity 
                     key={muscle} 
                     onPress={() => setSelectedMuscle(muscle)} 
                     className={`px-4 py-2 rounded-full mr-2 ${selectedMuscle === muscle ? 'bg-black' : 'bg-gray-100'}`}
                  >
                  <Text className={`font-bold ${selectedMuscle === muscle ? 'text-white' : 'text-gray-600'}`}>{getLocalizedMuscle(muscle)}</Text>
                  </TouchableOpacity>
               ))}
            </ScrollView>
         </View>

         {/* FILTRI DIFFICOLTÀ (Orizzontali) */}
         <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
               <TouchableOpacity 
                  onPress={() => setSelectedDifficulty(null)} 
                  className={`px-4 py-1.5 rounded-full mr-2 border ${selectedDifficulty === null ? 'bg-black border-black' : 'bg-transparent border-gray-300'}`}
               >
                  <Text className={`font-bold text-xs uppercase ${selectedDifficulty === null ? 'text-white' : 'text-gray-500'}`}>Ogni Livello</Text>
               </TouchableOpacity>
              {DIFFICULTIES.map((diff) => (
                  <TouchableOpacity 
                     key={diff} 
                     onPress={() => setSelectedDifficulty(diff)} 
                     className={`px-4 py-1.5 rounded-full mr-2 border ${selectedDifficulty === diff ? 'bg-black border-black' : 'bg-transparent border-gray-300'}`}
                  >
                     <Text className={`font-bold text-xs uppercase ${selectedDifficulty === diff ? 'text-white' : 'text-gray-500'}`}>{t(`difficulty.${diff}`)}</Text>
                  </TouchableOpacity>
               ))}
            </ScrollView>
         </View>

         <View className="flex-row justify-between items-center mb-4 z-50">
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{filteredAndSortedExercises.length} Risultati</Text>
            
            {/* Ordinamento con Menu a Tendina (Dropdown) */}
            <View className="relative">
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="bg-gray-100 pl-4 pr-3 py-2 rounded-xl flex-row items-center border border-gray-200"
              >
                <Text className="text-gray-700 text-xs font-bold mr-2">
                  {sortBy === 'alphabetical' ? 'A-Z (Alfabetico)' : sortBy === 'difficulty' ? 'Difficoltà' : 'Più Recenti'}
                </Text>
                <ChevronDown size={14} color="#4B5563" />
              </TouchableOpacity>

              {/* Box del Menu a discesa */}
              {isSortMenuOpen && (
                <View 
                  className="absolute top-10 right-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 overflow-hidden" 
                  style={{ zIndex: 100, elevation: 5 }}
                >
                  <TouchableOpacity 
                    className={`flex-row justify-between items-center p-3 border-b border-gray-50 ${sortBy === 'alphabetical' ? 'bg-[#FF4500]/5' : ''}`}
                    onPress={() => { setSortBy('alphabetical'); setIsSortMenuOpen(false); }}
                  >
                    <Text className={`text-sm font-bold ${sortBy === 'alphabetical' ? 'text-[#FF4500]' : 'text-gray-600'}`}>A-Z (Alfabetico)</Text>
                    {sortBy === 'alphabetical' && <Check size={16} color="#FF4500" />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className={`flex-row justify-between items-center p-3 border-b border-gray-50 ${sortBy === 'difficulty' ? 'bg-[#FF4500]/5' : ''}`}
                    onPress={() => { setSortBy('difficulty'); setIsSortMenuOpen(false); }}
                  >
                    <Text className={`text-sm font-bold ${sortBy === 'difficulty' ? 'text-[#FF4500]' : 'text-gray-600'}`}>Livello Difficoltà</Text>
                    {sortBy === 'difficulty' && <Check size={16} color="#FF4500" />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className={`flex-row justify-between items-center p-3 ${sortBy === 'recent' ? 'bg-[#FF4500]/5' : ''}`}
                    onPress={() => { setSortBy('recent'); setIsSortMenuOpen(false); }}
                  >
                    <Text className={`text-sm font-bold ${sortBy === 'recent' ? 'text-[#FF4500]' : 'text-gray-600'}`}>Più Recenti</Text>
                    {sortBy === 'recent' && <Check size={16} color="#FF4500" />}
                  </TouchableOpacity>
                </View>
              )}
            </View>
         </View>
         </View>
         
         {/* SE STIAMO CARICANDO MOSTRIAMO LA ROTELLINA, ALTRIMENTI LA LISTA VERA */}
         {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FF4500" />
              <Text className="mt-4 text-gray-500 font-bold">Caricamento esercizi...</Text>
            </View>
         ) : (
           <FlatList
              data={filteredAndSortedExercises}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <ExerciseListItem 
                  item={item} 
                  onSelect={(selectedItem) => {
                    setSelectedExercise(selectedItem);
                    setIsDetailOpen(true);
                  }} 
                />
              )}
            />
         )}

          <ExerciseDetailModal
            visible={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            exerciseName={selectedExercise?.name || 'Esercizio'}
            muscle={getLocalizedMuscle(selectedExercise?.target_muscle)}
            equipment={selectedExercise?.equipment}
            instructions={selectedExercise?.instructions}
            videoUrl={selectedExercise?.video_url}
          />
          </LinearGradient>
        </View>
      </View>
    </Modal>
   )
}

// COMPONENTE ISOLATO PER OGNI ELEMENTO DELLA LISTA (Performance Fix)
const ExerciseListItem = React.memo(({ item, onSelect }: { item: Exercise; onSelect: (item: Exercise) => void }) => {
  const { t } = useTranslation();
  const [hasFailedImage, setHasFailedImage] = useState(false);

  return (
    <TouchableOpacity
      className="flex-row items-center bg-gray-50 p-4 rounded-3xl mb-3"
      activeOpacity={0.85}
      onPress={() => onSelect(item)}
    >
      {item.image_url && !hasFailedImage ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-16 h-16 rounded-2xl mr-4 bg-gray-200"
          resizeMode="cover"
          onError={() => setHasFailedImage(true)}
        />
      ) : (
        <Image
          source={{ uri: getFallbackImageUrl(item.name) }}
          className="w-16 h-16 rounded-2xl mr-4 bg-gray-200"
          resizeMode="cover"
        />
      )}
      <View className="flex-1">
        <Text className="text-black font-bold text-lg">{item.name}</Text>
        <Text className="text-gray-500 font-medium text-xs uppercase mt-1">
          {getLocalizedMuscle(item.target_muscle)} • {t('exercises.difficulty_label')}: {item.difficulty ? t(`difficulty.${item.difficulty}`) : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});