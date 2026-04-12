// frontend/src/components/schede/CreateRoutineScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { X, Save, Plus, Dumbbell, AlignLeft, Layout, Flame } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { WorkoutTemplate } from '../../../../shared/types';
import { WorkoutService } from '../../api/workoutService';
import { useAuthStore } from '../../store/useAuthStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';

export default function CreateRoutineScreen() {
  const { isOpen, templateToEdit, closeCreate } = useCreateRoutineStore();
  const { t } = useTranslation();

  const { session } = useAuthStore();
  const userId = session?.user?.id;

  const [routineName, setRoutineName] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        setRoutineName(templateToEdit.name);
        setRoutineDesc(templateToEdit.description || '');
      } else {
        setRoutineName('');
        setRoutineDesc('');
        setLocalError(null);
      }
    }
  }, [isOpen, templateToEdit]);

  const handleSave = async () => {
    if (!routineName.trim()) {
      Alert.alert(t('common.error'), t('create_routine.name_required'));
      return;
    }
    if (!userId) {
      Alert.alert(t('common.error'), t('create_routine.not_logged_in'));
      return;
    }

    setIsSaving(true);
    setLocalError(null);

    try {
      if (templateToEdit) {
        // Update: aggiorna nome e descrizione mantenendo gli esercizi esistenti
        await WorkoutService.updateCompleteWorkoutTemplate(
          templateToEdit.id,
          routineName.trim(),
          routineDesc.trim() || undefined,
          [] // esercizi gestiti dall'UI di modifica avanzata
        );
        Alert.alert(t('common.success'), t('create_routine.success_updated'));
      } else {
        // Create: crea una nuova scheda vuota
        await WorkoutService.saveCompleteWorkoutTemplate(
          userId,
          routineName.trim(),
          routineDesc.trim() || undefined,
          []
        );
        Alert.alert(t('common.success'), t('create_routine.success_created'));
      }
      closeCreate();
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || t('create_routine.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 z-[105] elevation-[105]">
      {/* Sfondo Oscurato cliccabile */}
      <TouchableOpacity activeOpacity={1} onPress={closeCreate} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      
      {/* Contenitore APPLE STYLE BOTTOM SHEET */}
      <View style={{ position: 'absolute', bottom: 0, width: '100%', height: '93%', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#171717', '#D1D5DB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(16,185,129,0.35)', 'rgba(16,185,129,0.05)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(16,185,129,0.4)' }} />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          
          {/* Maniglietta visiva stile iOS */}
          <View className="w-full items-center pt-3 pb-2">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row justify-between items-center px-6 mb-4 mt-2">
            <TouchableOpacity onPress={closeCreate} className="bg-white/10 p-2.5 rounded-full border border-white/5">
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-white font-black text-sm uppercase tracking-widest">
              {templateToEdit ? t('create_routine.edit_title') : t('create_routine.new_title')}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`${isSaving ? 'bg-white/20' : 'bg-[#10B981]'} p-2.5 rounded-full border border-transparent shadow-lg shadow-green-900/50`}
            >
              <Save size={20} color={isSaving ? '#FFF' : 'black'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 150 }}>
            
            {/* Box Titolo e Desc */}
            <View className="bg-black/40 rounded-3xl p-5 mb-5 border border-white/5">
              <View className="flex-row items-center border-b border-white/10 pb-4 mb-4">
                <View className="bg-white/10 p-2.5 rounded-xl mr-3">
                  <Layout size={20} color="#FFF" />
                </View>
                <TextInput
                  className="flex-1 text-white font-black text-2xl tracking-tight"
                  placeholder={t('create_routine.name_placeholder')}
                  placeholderTextColor="#666"
                  value={routineName}
                  onChangeText={setRoutineName}
                />
              </View>
              
              <View className="flex-row items-center">
                <View className="bg-white/5 p-2 rounded-lg mr-3">
                  <AlignLeft size={16} color="#999" />
                </View>
                <TextInput
                  className="flex-1 text-gray-300 font-medium text-sm"
                  placeholder={t('create_routine.desc_placeholder')}
                  placeholderTextColor="#666"
                  value={routineDesc}
                  onChangeText={setRoutineDesc}
                  multiline
                />
              </View>
            </View>

            {localError ? (
              <View className="mb-4 p-4 bg-red-900/40 rounded-2xl border border-red-500/50">
                <Text className="text-red-400 font-bold text-sm text-center">{localError}</Text>
              </View>
            ) : null}

            {/* Placeholder esercizi */}
            <View className="mb-8">
              <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[4px] mb-4 px-2">
                {t('create_routine.exercises_label')}
              </Text>
              <View className="bg-white/5 border border-white/10 border-dashed rounded-[32px] p-10 items-center justify-center">
                <View className="bg-white/10 p-4 rounded-full mb-4">
                  <Dumbbell size={28} color="#999" />
                </View>
                <Text className="text-gray-400 font-bold text-center text-sm mb-1">
                  {t('create_routine.no_exercises')}
                </Text>
                <Text className="text-gray-600 text-xs text-center">
                  {t('create_routine.no_exercises')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert('In arrivo', 'Libreria esercizi per selezione!')}
              className="bg-[#10B981]/20 border border-[#10B981]/30 rounded-3xl p-5 flex-row items-center justify-center shadow-lg"
            >
              <Plus size={20} color="#10B981" />
              <Text className="text-[#10B981] font-black uppercase text-sm tracking-widest ml-2">
                {t('create_routine.add_exercise')}
              </Text>
            </TouchableOpacity>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
