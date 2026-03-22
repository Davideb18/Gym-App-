import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, Pressable, PanResponder, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, PlayCircle, Activity, TrendingUp, Flame, History, Info } from 'lucide-react-native';
import { useSwipeDownClose } from '../../hooks/useSwipeDownClose';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  // Per ora passiamo dei dati finti per vedere la UI
  exerciseName?: string;
  muscle?: string;
}

export default function ExerciseDetailModal({ visible, onClose, exerciseName = 'Panca Piana', muscle = 'Petto' }: Props) {
  
  // STATO PER CAMBIARE SEZIONE (Info Esercizio vs Cronologia)
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  // HOOK CENTRALIZZATO PER SWIPE (FASE 2)
  const { panY, panHandlers, closeAnimated, openAnimated } = useSwipeDownClose({ onClose });

  // Questa funzione fa scattare l'entrata animata dal basso (risolve il fatto che riaprendolo spariva)!
  React.useEffect(() => {
    if (visible) {
      setActiveTab('info');
      openAnimated();
    }
  }, [visible, openAnimated]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={closeAnimated}>
      
      {/* Sfondo Overlay Nero Semi-trasparente Universale (Risolto il bug del grigio orribile) */}
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        
        {/* Sfondo cliccabile per chiudere cliccando fuori */}
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={closeAnimated} />

        {/* Contenitore Principale con Animazione per lo Swipe */}
        <Animated.View 
          className="w-full h-[90%] rounded-t-[40px] overflow-hidden flex shadow-2xl bg-white"
          style={{ 
             transform: [{ translateY: panY }] 
          }}
        >
          {/* Sfondo sfumato coerente con il tema login */}
          <LinearGradient
            colors={['#d4d4d8', '#e4e4e7', '#ffffff']}
            locations={[0, 0.35, 1]}
            style={{ flex: 1 }}
          >
            {/* Header TRASCINABILE */}
            <View {...panHandlers} className="px-6 pt-4 pb-6 bg-transparent" style={{ zIndex: 10 }}>
              
              {/* Pillola/Handle grigio scuro per indicare lo swipe */}
              <View className="w-16 h-1.5 bg-black/20 rounded-full self-center mb-6" />

              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="text-black text-4xl font-[1000] tracking-tighter leading-10">{exerciseName}</Text>
                  <View className="flex-row items-center mt-2">
                    <View className="w-2 h-2 rounded-full bg-[#FF4500] mr-2" />
                    <Text className="text-[#FF4500] font-bold uppercase text-[12px] tracking-[3px]">
                      {muscle} • Bilanciere
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  onPress={closeAnimated} 
                  className="w-12 h-12 bg-black/5 rounded-full items-center justify-center border border-black/5"
                >
                  <X size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            {/* TAB SELECTOR: Info / Cronologia */}
            <View className="flex-row mx-6 mb-6 bg-gray-100 rounded-[20px] p-1.5">
              <TouchableOpacity 
                onPress={() => setActiveTab('info')}
                className={`flex-1 py-3.5 rounded-[16px] flex-row justify-center items-center ${activeTab === 'info' ? 'bg-[#D1D5DB]' : 'bg-transparent'}`}
              >
                <Info size={16} color={activeTab === 'info' ? '#374151' : '#9CA3AF'} style={{ marginRight: 8 }} />
                <Text style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, color: activeTab === 'info' ? '#374151' : '#9CA3AF' }}>
                  Istruzioni
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setActiveTab('history')}
                className={`flex-1 py-3.5 rounded-[16px] flex-row justify-center items-center ${activeTab === 'history' ? 'bg-[#D1D5DB]' : 'bg-transparent'}`}
              >
                <History size={16} color={activeTab === 'history' ? '#374151' : '#9CA3AF'} style={{ marginRight: 8 }} />
                <Text style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, color: activeTab === 'history' ? '#374151' : '#9CA3AF' }}>
                  Cronologia
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 w-full px-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              
              {activeTab === 'info' ? (
                <>
                  {/* Box Placeholder per il Video */}
            <View className="w-full h-48 bg-black/5 rounded-3xl mt-4 items-center justify-center border border-black/5 overflow-hidden relative">
               <PlayCircle size={48} color="rgba(0,0,0,0.2)" />
               <View className="absolute bottom-3 right-4 bg-white/80 px-3 py-1 rounded-full">
                 <Text className="text-black text-xs font-bold">1/2 Angolazioni</Text>
               </View>
            </View>

            {/* Griglia Dati / "Categoria Animale" e Info Rapide */}
            <View className="flex-row justify-between mt-6">
              
              {/* Card 1RM */}
              <View className="flex-1 bg-white rounded-3xl p-4 mr-2 border border-black/5 shadow-sm">
                <View className="flex-row items-center mb-2">
                  <TrendingUp size={16} color="#FF4500" />
                  <Text className="text-gray-400 text-xs font-bold ml-1 uppercase">Il tuo 1RM</Text>
                </View>
                <Text className="text-black text-2xl font-black">90 <Text className="text-sm text-gray-500">kg</Text></Text>
              </View>

              {/* Card Rango Animale */}
              <View className="flex-1 bg-white rounded-3xl p-4 ml-2 border border-black/5 shadow-sm overflow-hidden relative">
                <LinearGradient colors={['rgba(255,69,0,0.1)', 'transparent']} className="absolute inset-0 top-1/2" />
                <View className="flex-row items-center mb-2 z-10">
                  <Flame size={16} color="#FF4500" />
                  <Text className="text-gray-400 text-xs font-bold ml-1 uppercase">Livello</Text>
                </View>
                <Text className="text-black text-xl font-black z-10">Gorilla 🦍</Text>
              </View>

            </View>

            {/* Placeholder Grafico */}
            <View className="w-full h-32 bg-white rounded-3xl mt-4 items-center justify-center border border-black/5 p-4 shadow-sm">
               <Activity size={30} color="rgba(0,0,0,0.1)" className="mb-2" />
               <Text className="text-gray-400 text-sm font-medium text-center">
                 Qui andrà il grafico a linee della tua forza nel tempo
               </Text>
            </View>

            {/* Istruzioni Testuali */}
            <View className="mt-8 mb-10">
              <Text className="text-black text-xl font-bold mb-4">Come si esegue</Text>
              <View className="flex-row mb-3">
                <View className="w-6 h-6 bg-[#FF4500]/10 rounded-full items-center justify-center mr-3 mt-1">
                  <Text className="text-[#FF4500] font-bold text-xs">1</Text>
                </View>
                <Text className="text-gray-600 text-base leading-6 flex-1">Sdraiati sulla panca assicurandoti che i piedi siano ben piantati a terra.</Text>
              </View>
              <View className="flex-row mb-3">
                <View className="w-6 h-6 bg-[#FF4500]/10 rounded-full items-center justify-center mr-3 mt-1">
                  <Text className="text-[#FF4500] font-bold text-xs">2</Text>
                </View>
                <Text className="text-gray-600 text-base leading-6 flex-1">Scendi in modo controllato fino a sfiorare il petto con il bilanciere.</Text>
              </View>
            </View>
            </>
          ) : (
                /* -------------------------------------
                   SEZIONE CRONOLOGIA (TAB 2)
                   ------------------------------------- */
                <View className="mt-2">
                  
                  {/* Titolo e Riepilogo Veloce */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>I tuoi Record Reali</Text>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>
                      Qui vedrai l'andamento di <Text style={{ color: '#FF4500', fontWeight: 'bold' }}>{exerciseName}</Text> nel tempo.
                    </Text>
                  </View>

                  {/* Esempio di una "Sessione di Allenamento" passata */}
                  <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 16, borderColor: '#F3F4F6', borderWidth: 1 }}>
                    {/* Header Data */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomColor: '#F3F4F6', borderBottomWidth: 1 }}>
                      <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18 }}>15 Marzo 2026</Text>
                      <View style={{ backgroundColor: 'rgba(255, 69, 0, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
                        <Text style={{ color: '#FF4500', fontWeight: 'bold', fontSize: 12 }}>Push Day</Text>
                      </View>
                    </View>

                    {/* Dettaglio Serie */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', width: 48, textAlign: 'center' }}>Set</Text>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Kg</Text>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Reps</Text>
                    </View>

                    {/* Set 1 */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, marginBottom: 8 }}>
                      <View style={{ backgroundColor: 'white', borderColor: '#E5E7EB', borderWidth: 1, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>1</Text>
                      </View>
                      <Text style={{ color: 'black', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>80</Text>
                      <Text style={{ color: 'black', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>10</Text>
                    </View>

                    {/* Set 2 */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, marginBottom: 8 }}>
                      <View style={{ backgroundColor: 'white', borderColor: '#E5E7EB', borderWidth: 1, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>2</Text>
                      </View>
                      <Text style={{ color: 'black', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>85</Text>
                      <Text style={{ color: 'black', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>8</Text>
                    </View>

                    {/* Set 3 - Record Cromatico */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 69, 0, 0.1)', borderColor: 'rgba(255, 69, 0, 0.3)', borderWidth: 1, padding: 12, borderRadius: 16 }}>
                      <View style={{ backgroundColor: '#FF4500', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>3</Text>
                      </View>
                      <Text style={{ color: '#FF4500', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>90</Text>
                      <Text style={{ color: '#FF4500', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>6</Text>
                    </View>
                  </View>

                  {/* Seconda Sessione Passata (Più vecchia) */}
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 24, padding: 20, marginBottom: 32, borderColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, opacity: 0.7 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomColor: 'rgba(255, 255, 255, 0.1)', borderBottomWidth: 1 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>8 Marzo 2026</Text>
                      <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
                        <Text style={{ color: '#D1D5DB', fontWeight: 'bold', fontSize: 12 }}>Chest & Triceps</Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 12, borderRadius: 16, marginBottom: 8 }}>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', width: 32, textAlign: 'center' }}>1</Text>
                      <Text style={{ color: '#D1D5DB', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' }}>75</Text>
                      <Text style={{ color: '#D1D5DB', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' }}>10</Text>
                    </View>
                  </View>

                </View>
          )}
          </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}