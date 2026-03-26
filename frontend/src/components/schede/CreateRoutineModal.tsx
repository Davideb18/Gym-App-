import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';

interface CreateRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string, description?: string) => Promise<void>;
    isSubmitting?: boolean;
    errorMessage?: string | null;
}


export default function CreateRoutineModal({
    visible,
    onClose,
    onSubmit,
    isSubmitting = false,
    errorMessage = null,   
} : CreateRoutineModalProps) { 
    // servono per gestire i campi del form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if(!visible) {
            setName('')
            setDescription('')
        }    
    }, [visible]);

    // serve per gestire la pressione del tasto "Crea"
    const handleSubmit = async () => {
        // pulisco i campi da spazi bianchi inutili
        const cleanName = name.trim();
        const cleanDescription = description.trim();

        if(!cleanName) return;

        // chiamo la funzione onSubmit passata come prop, che si occupa di creare la routine
        await onSubmit(cleanName, cleanDescription.length > 0 ? cleanDescription : undefined);
    };

    return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} />

        <LinearGradient
          colors={['#f3f4f6', '#ffffff']}
          style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827' }}>Nuova Scheda</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text style={{ color: '#6b7280', fontWeight: '700', marginBottom: 8 }}>Nome routine</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
            placeholder="Es. Push Day A"
            placeholderTextColor="#9ca3af"
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 14,
            }}
          />

          <Text style={{ color: '#6b7280', fontWeight: '700', marginBottom: 8 }}>Descrizione (opzionale)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
            placeholder="Es. Routine petto/tricipiti"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontWeight: '600',
              color: '#111827',
              minHeight: 90,
              textAlignVertical: 'top',
              marginBottom: 14,
            }}
          />

          {!!errorMessage && (
            <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: 10, marginBottom: 14 }}>
              <Text style={{ color: '#dc2626', fontWeight: '700' }}>{errorMessage}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                backgroundColor: '#e5e7eb',
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: 'center',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#111827', fontWeight: '800' }}>Annulla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || name.trim().length === 0}
              style={{
                flex: 1,
                backgroundColor: '#111827',
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: 'center',
                opacity: isSubmitting || name.trim().length === 0 ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ color: '#ffffff', fontWeight: '800' }}>Continua</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
