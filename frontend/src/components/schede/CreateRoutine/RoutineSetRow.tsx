import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  set: any; // Using exact from DraftExercise sets
  setIndex: number;
  exerciseLocalId: string;
  onOpenSetTypeSelector: (exerciseLocalId: string, setLocalId: string) => void;
  updateSetField: (exerciseLocalId: string, setLocalId: string, field: any, value: any) => void;
  removeSet: (exerciseLocalId: string, setLocalId: string) => void;
}

export default function RoutineSetRow({
  set,
  setIndex,
  exerciseLocalId,
  onOpenSetTypeSelector,
  updateSetField,
  removeSet
}: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-col bg-gray-50/80 rounded-2xl p-2 mb-2 border border-gray-100">
      <View className="flex-row items-center w-full">
         <TouchableOpacity
           activeOpacity={0.7}
           onPress={() => onOpenSetTypeSelector(exerciseLocalId, set.localId)}
           className="w-14 items-center justify-center bg-white h-[46px] rounded-xl shadow-sm border border-gray-200 mr-1"
         >
           <Text className="text-black font-black text-sm text-center">{setIndex + 1}</Text>
           <Text className={`text-[8px] font-black uppercase mt-0.5 text-center px-0.5 tracking-wider ${set.setType === 'normal' ? 'text-gray-400' : 'text-[#FF3B30]'}`}>
             {set.setType === 'normal' ? t('create_routine.set_types.normal') : t(`create_routine.set_types.${set.setType}`).substring(0,4)}
           </Text>
         </TouchableOpacity>
         
         <View className="flex-1 px-1">
            <TextInput
              value={set.intensity || ''}
              onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'intensity', text)}
              keyboardType="numeric"
              placeholder="-"
              placeholderTextColor="#9CA3AF"
              className="bg-white items-center text-center justify-center font-bold text-sm text-black rounded-xl shadow-sm border border-gray-100 h-[46px]"
            />
         </View>

         <View className="flex-1 px-1">
            <TextInput
              value={set.reps || ''}
              onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'reps', text)}
              keyboardType="numeric"
              placeholder="-"
              placeholderTextColor="#9CA3AF"
              className="bg-white items-center text-center justify-center font-bold text-sm text-black rounded-xl shadow-sm border border-gray-100 h-[46px]"
            />
         </View>

         <View className="w-16 px-1">
            <TextInput
              value={set.restSeconds || ''}
              onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'restSeconds', text)}
              keyboardType="numeric"
              placeholder="90"
              placeholderTextColor="#9CA3AF"
              className="bg-white items-center text-center justify-center font-bold text-sm text-black rounded-xl shadow-sm border border-gray-100 h-[46px]"
            />
         </View>

         <View className="w-8 items-center justify-center">
           <TouchableOpacity onPress={() => removeSet(exerciseLocalId, set.localId)} className="w-full h-[46px] items-center justify-center">
             <X size={18} color="#9CA3AF" />
           </TouchableOpacity>
         </View>
      </View>

      {/* EXTRA FIELDS PER PREMIUM SET TYPES */}
      {set.setType === 'dropset' && (
        <View className="flex-row items-center mt-3 px-1 mb-1">
           <View className="flex-1 mr-2">
              <Text className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{t('create_routine.set_fields.drops')}</Text>
              <TextInput 
                value={set.dropsetDrops || ''}
                onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'dropsetDrops', text)}
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-center text-black shadow-sm shadow-black/5"
                placeholder="es. 2" 
              />
           </View>
           <View className="flex-1">
              <Text className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{t('create_routine.set_fields.reduction')}</Text>
              <TextInput 
                value={set.dropsetPercent || ''}
                onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'dropsetPercent', text)}
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-center text-black shadow-sm shadow-black/5"
                placeholder="es. 20" 
              />
           </View>
        </View>
      )}

      {set.setType === 'cluster' && (
        <View className="flex-row items-center mt-3 px-1 mb-1">
           <View className="flex-1 mr-2">
              <Text className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{t('create_routine.set_fields.mini_sets')}</Text>
              <TextInput 
                value={set.clusterMiniSets || ''}
                onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'clusterMiniSets', text)}
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-center text-black shadow-sm shadow-black/5"
                placeholder="es. 4" 
              />
           </View>
           <View className="flex-1">
              <Text className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{t('create_routine.set_fields.intra_rest')}</Text>
              <TextInput 
                value={set.clusterIntraRest || ''}
                onChangeText={(text) => updateSetField(exerciseLocalId, set.localId, 'clusterIntraRest', text)}
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-center text-black shadow-sm shadow-black/5"
                placeholder="es. 15" 
              />
           </View>
        </View>
      )}
            {/* SPIEGAZIONI TECNICHE AVANZATE SENZA INPUT EXTRA */}
      {set.setType === 'rest_pause' && (
        <View className="mt-3 px-2 mb-1">
           <Text className="text-[11px] text-[#FF4500] font-bold mb-0.5">{t('create_routine.tips.rest_pause_title')}</Text>
           <Text className="text-[11px] text-gray-500 font-medium leading-relaxed">{t('create_routine.tips.rest_pause_body')}</Text>
        </View>
      )}

      {set.setType === 'myo_reps' && (
        <View className="mt-3 px-2 mb-1">
           <Text className="text-[11px] text-[#FF4500] font-bold mb-0.5">{t('create_routine.tips.myo_reps_title')}</Text>
           <Text className="text-[11px] text-gray-500 font-medium leading-relaxed">{t('create_routine.tips.myo_reps_body')}</Text>
        </View>
      )}

    </View>
  );
}
