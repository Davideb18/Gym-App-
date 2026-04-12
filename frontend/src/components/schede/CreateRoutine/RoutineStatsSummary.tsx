import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DraftExercise } from '../../../hooks/useWorkoutCreation';

interface Props {
  exercises: DraftExercise[];
}

export default function RoutineStatsSummary({ exercises }: Props) {
  const { t } = useTranslation();
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const workingSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.setType !== 'warmup').length, 0);
    const estimatedTimeSeconds = exercises.reduce((acc, ex) => {
     return acc + ex.sets.reduce((sAcc, s) => {
       // PARTE LOGICA: Stima di ~3.5s per ogni ripetizione
       // Se l'utente non ha ancora scritto nulla, assumiamo 10 reps come fallback.
       const repsCount = parseInt(s.reps || '10', 10); 
       const timeUnderTension = repsCount * 3.5;
       
       const rest = parseInt(s.restSeconds || '90', 10);
       return sAcc + timeUnderTension + rest;
     }, 0);
  }, 0);
  const estimatedTimeMinutes = Math.round(estimatedTimeSeconds / 60);

  return (
    <View className="px-5 mb-5 flex-row justify-between">
      <View className="bg-white/80 px-3 py-3 rounded-2xl flex-1 mr-2 border border-black/5 items-center shadow-sm shadow-black/5">
        <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">{t('create_routine.estimated_time')}</Text>
        <Text className="text-black font-black text-lg">{estimatedTimeMinutes} min</Text>
      </View>
      <View className="bg-white/80 px-3 py-3 rounded-2xl flex-1 mr-2 border border-black/5 items-center shadow-sm shadow-black/5">
        <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">{t('create_routine.total_sets_label')}</Text>
        <Text className="text-black font-black text-lg">{totalSets}</Text>
      </View>
      <View className="bg-white/80 px-3 py-3 rounded-2xl flex-1 border border-black/5 items-center shadow-sm shadow-black/5">
        <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">{t('create_routine.working_sets_label')}</Text>
        <Text className="text-black font-black text-lg">{workingSets}</Text>
      </View>
    </View>
  );
}
