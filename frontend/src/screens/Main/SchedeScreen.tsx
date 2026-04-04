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
import CreateRoutineModal from '../../components/schede/CreateRoutineModal';
import { WorkoutService } from '../../api/workoutService';
import { DraftExercise } from '../../hooks/useWorkoutCreation';

import { WorkoutTemplate } from '../../../../shared/types';
import PremiumModal from '../../components/ui/PremiumModal';
import WorkoutPreviewModal from '../../components/workout/WorkoutPreviewModal';

type WorkoutTemplateRow = Pick<WorkoutTemplate, 'id' | 'name' | 'description' | 'created_at'>;

export default function SchedeScreen() {
  const { session } = useAuthStore();
  const userId = session?.user?.id;
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);
  
  // -- STATI PER IL POPUP (MODAL) WIKI --
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [createTemplateError, setCreateTemplateError] = useState<string | null>(null);

  // Stato per il pop-up premium
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Stato per la Preview del Workout
  const [isWorkoutPreviewOpen, setIsWorkoutPreviewOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<WorkoutTemplate | null>(null);


  // Effetto per caricare lo stato premium dell'utente all'inizio e ogni volta che cambia l'userId
  useEffect(() => {
  let mounted = true;
  // funzione per caricare lo stato premium dell'utente dal database, 
  // gestendo stati di caricamento e errori
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

      // se tutto va bene, aggiorna lo stato isPremium con il valore ottenuto dal database
      if (mounted) {
        // !!data?.is_premium converte il valore in un booleano, assicurandosi che sia true o false
        setIsPremium(!!data?.is_premium);
      }
    } catch {
      if (mounted) setIsPremium(false);
    } finally {
      if (mounted) setIsLoadingPremium(false);
    }
  };

    // chiama la funzione per caricare lo stato premium quando il componente viene montato o quando cambia l'userId
    loadPremiumStatus();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // -- FUNZIONI PER IL MODAL DI CREAZIONE ROUTINE --
  // apre il modal di creazione routine, controllando prima se l'utente ha raggiunto il limite aprendo il modal premium se necessario
  const openCreateRoutineFlow = () => {
    if (isLoadingPremium) return;
    const templatesCount = templates?.length ?? 0;
    const freeLimitReached = !isPremium && templatesCount >= 4;
    if (freeLimitReached) {
      setIsPremiumModalOpen(true); // <--- Ora apriamo il modal invece di un semplice alert
      return;
    }
    setCreateTemplateError(null);
    setIsCreateOpen(true);
};

  // Chiude il modal di creazione routine, se non siamo in fase di creazione 
  // (per evitare chiusure accidentali durante l'inserimento)
  const closeCreateRoutineFlow = () => {
    if (isCreatingTemplate) return;
    setIsCreateOpen(false);
    setTimeout(() => setTemplateToEdit(null), 300); // delay allowing modal slide down
  };

  // Gestisce la creazione della routine, comunicando con Supabase e gestendo 
  // stati di caricamento ed errori
  const handleCreateRoutineSubmit = async (name: string, description: string | undefined, exercises: DraftExercise[]) => {
    if (!userId) {
      setCreateTemplateError('Utente non autenticato. Riprova il login.');
      return;
    }

    try {
      setIsCreatingTemplate(true);
      setCreateTemplateError(null);

      if (templateToEdit) {
        // Logica di Aggiornamento
        await WorkoutService.updateCompleteWorkoutTemplate(
          templateToEdit.id,
          name,
          description,
          exercises
        );
      } else {
        // Controlla se l'utente ha raggiunto il limite di schede gratuite SOLO IN CREAZIONE
        const templatesCount = templates?.length ?? 0;
        const freeLimitReached = !isPremium && templatesCount >= 4;
        if (freeLimitReached) {
          setCreateTemplateError('Limite schede raggiunto (4/4). Passa al piano Premium per crearne di più.');
          setIsCreatingTemplate(false);
          return;
        }

        // Logica di Creazione
        await WorkoutService.saveCompleteWorkoutTemplate(
          userId,
          name,
          description,
          exercises,
          isPremium
        );
      }

      // Se la creazione/modifica ha successo, chiudiamo il modal e ricarichiamo la lista delle routine
      closeCreateRoutineFlow();
      await refetchTemplates();
    } catch (err: any) {
      setCreateTemplateError(err?.message ?? 'Errore durante la creazione della routine.');
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  // Funzione per aprire la preview della routine
  const openRoutine = (templateId: string, templateName: string) => {
    setSelectedTemplateId(templateId);
    setIsWorkoutPreviewOpen(true);
  };
;

  // Funzione per eliminare una routine tramite Long Press
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
              await WorkoutService.deleteTemplate(templateId, userId!); // userId il ! serve per dire a TypeScript che userId non è null
              await refetchTemplates();
            } catch (err: any) {
              Alert.alert('Errore', err?.message || 'Non è stato possibile eliminare la scheda.');
            }
          }
        }
      ]
    );
  };

  // -- FETCH TEMPLATES (Le tue schede) --
  const { 
    data: templates, 
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
    refetch: refetchTemplates
  } = useQuery<WorkoutTemplateRow[]>({
    queryKey: ['templates', userId], // La query dipende dall'userId
    queryFn: async () => {
      if(!userId) return []; // Se non abbiamo userId, ritorniamo un array vuoto

      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: false })
        .eq('profile_id', userId); // Filtra per l'utente loggato

      if (error) throw error;
      return (data ?? []) as WorkoutTemplateRow[];
    },
    enabled: !!userId, // Esegui solo se abbiamo l'userId
  });

  // Gestione del pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchTemplates();
    setRefreshing(false);
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      
      {/* BACKGROUND */}
      <LinearGradient colors={['#D1D5DB', '#FFFFFF', '#D1D5DB']} className="absolute inset-0" />

      <SafeAreaView className="flex-1">
        <ScrollView 
          className="px-6 pt-10"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
          }
        >
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
            <TouchableOpacity 
              onPress={openCreateRoutineFlow}
              className="bg-black p-3.5 rounded-2xl shadow-xl" 
              activeOpacity={0.8}
            >
              <Plus size={24} color="white" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* QUICK ACTIONS */}
          <View className="flex-row justify-between mb-12 gap-x-4">
            <TouchableOpacity               
                onPress={openCreateRoutineFlow}
                className="items-center bg-white/60 p-4 rounded-3xl border border-black/5 flex-1 shadow-sm"
                activeOpacity={0.7}
            >
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
            ) : isTemplatesError ? (
              <View className="bg-white/60 border border-red-200 rounded-[32px] p-6 mb-5 items-center">
                  <Text className="text-red-600 font-bold text-center mb-4">
                    Errore nel caricamento delle routine
                  </Text>

                  <TouchableOpacity
                    onPress={() => refetchTemplates()}
                    className="bg-black px-4 py-2 rounded-xl"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold">Riprova</Text>
                  </TouchableOpacity>
                </View>
            ) : (
              // Se la cartella è vuota o piena, noi mostriamo comunque il bottone +
              <View>
                {/* 1. Ciclo che stampa le Routine se esistono */}
                {templates?.map((template) => (
                  <TouchableOpacity 
                    key={template.id} 
                    className="bg-white/70 border border-black/5 rounded-[32px] p-6 mb-5 flex-row items-center shadow-lg shadow-black/5" 
                    activeOpacity={0.7}
                    onPress={() => openRoutine(template.id, template.name)}
                    onLongPress={() => handleDeleteRoutine(template.id, template.name)}
                  >
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
                ))}

                {/* 2. Bottone "Add Routine" che si pianta ORA sempre alla fine! */}
                <TouchableOpacity
                  onPress={openCreateRoutineFlow}
                  activeOpacity={0.8}
                  className="bg-white/40 border border-dashed border-black/20 rounded-[40px] p-12 items-center mb-5"
                >
                  <View className="bg-black/5 p-5 rounded-full mb-4">
                    <Plus size={32} color="#BBB" />
                  </View>
                  <Text className="text-gray-400 text-center font-bold text-sm uppercase tracking-widest leading-loose">
                    {templates?.length === 0 ? "No routines found.\nTap + to build your lab" : "Add New Routine"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>

      {/* MODALS 
       Modal della Exercise Library, con visibilità controllata dallo stato isWikiOpen*/}
       <ExerciseLibrary 
        visible={isWikiOpen} 
        onClose={() => setIsWikiOpen(false)}
      />
      { /* Modal di creazione routine, con visibilità controllata dallo stato isCreateOpen, 
      e con funzioni di submit e gestione errori passate come props */ }
      <CreateRoutineModal
        visible={isCreateOpen}
        onClose={closeCreateRoutineFlow}
        onSubmit={handleCreateRoutineSubmit}
        isSubmitting={isCreatingTemplate}
        errorMessage={createTemplateError}
        isPremium={isPremium}
        templateToEdit={templateToEdit}
        onRequirePremium={() => setIsPremiumModalOpen(true)}
      />

      <PremiumModal 
        visible={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
        onUpgrade={() => {
          // Implementeremo la logica di pagamento in futuro
          Alert.alert("Premium", "Logica di upgrade in arrivo!");
          setIsPremiumModalOpen(false);
        }}
      />

      <WorkoutPreviewModal 
        visible={isWorkoutPreviewOpen} 
        onClose={() => setIsWorkoutPreviewOpen(false)} 
        templateId={selectedTemplateId} 
        onEdit={(fullTemplate) => {
           setTemplateToEdit(fullTemplate);
           setIsWorkoutPreviewOpen(false);
           setTimeout(() => setIsCreateOpen(true), 300);
        }}
      />


    </View>
  );
}