import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Lock, Unlock} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SetType } from '../../../../../shared/types';

export const SET_TYPES: { label: string, value: SetType, premium: boolean }[] = [
  { label: 'Normal', value: 'normal', premium: false },
  { label: 'Warmup', value: 'warmup', premium: true },
  { label: 'Failure', value: 'failure', premium: true },
  { label: 'Backoff', value: 'backoff', premium: true },
  { label: 'Dropset', value: 'dropset', premium: true },
  { label: 'Cluster', value: 'cluster', premium: true },
  { label: 'Myo-reps', value: 'myo_reps', premium: true },
  { label: 'Rest-Pause', value: 'rest_pause', premium: true },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: SetType, premium: boolean) => void;
  isPremium: boolean;
}

export default function SetTypeSelectorModal({ visible, onClose, onSelect, isPremium }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        className="flex-1 justify-center bg-black/60 px-6"
      >
        <View className="bg-white rounded-[32px] overflow-hidden shadow-2xl">
          <View className="p-6 border-b border-gray-100 bg-gray-50">
            <Text className="text-xl font-black text-black text-center tracking-tight">{t('create_routine.set_types.title')}</Text>
          </View>
          <ScrollView style={{ maxHeight: 380 }}>
            {SET_TYPES.map((type, idx) => (
              <TouchableOpacity
                key={type.value}
                activeOpacity={0.7}
                onPress={() => onSelect(type.value, type.premium)}
                className={`flex-row justify-between items-center px-6 py-5 ${idx < SET_TYPES.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <Text className={`text-lg font-bold ${type.premium && !isPremium ? 'text-gray-400' : 'text-black'}`}>
                  {t(`difficulty.${type.value}`)}
                </Text>
                
                {type.premium && (
                  <View className={`flex-row items-center px-3 py-1.5 rounded-full ${isPremium ? 'bg-black' : 'bg-[#EAB308]'}`}>
                    {isPremium ? (
                      <Unlock size={12} color="#FFF" />
                    ) : (
                      <Lock size={12} color="#000" />
                    )}
                    <Text className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isPremium ? 'text-white' : 'text-black'}`}>
                      {isPremium ? t('create_routine.set_types.unlocked') : t('create_routine.set_types.premium')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
