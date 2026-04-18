import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Play, CheckCircle2, RotateCcw, X } from 'lucide-react-native';
import { useFormCoachStore } from '../../store/useFormCoachStore';
import { resolvePoseExerciseCode } from '../../utils/poseProfileResolver';
import { usePoseKeypointsStream } from '../../hooks/usePoseKeypointsStream';
import PoseOverlayDebug from './PoseOverlayDebug';

export default function FormCoachScreen() {
  const {
    isOpen,
    mode,
    exerciseName,
    mediaUrl,
    repCount,
    liveHint,
    summary,
    closeCoach,
    startCalibration,
    startTracking,
    incrementRep,
    completeTracking,
    backToIntro,
  } = useFormCoachStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [trackingLayout, setTrackingLayout] = useState({ width: 0, height: 0 });
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');

  const exerciseCode = resolvePoseExerciseCode(exerciseName);
  const { frame, source, boneConnections } = usePoseKeypointsStream({
    enabled: isOpen && mode === 'tracking' && !!permission?.granted,
    exerciseCode,
  });

  if (!isOpen) return null;

  const ensureCameraPermission = async () => {
    if (permission?.granted) return true;
    const response = await requestPermission();
    return response.granted;
  };

  const handleStartCalibration = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) return;
    startCalibration();
  };

  const handleStartTracking = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) return;
    startTracking();
  };

  const toggleCameraFacing = () => {
    setCameraFacing((currentFacing) => (currentFacing === 'front' ? 'back' : 'front'));
  };

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 240 }}>
      <LinearGradient
        colors={['#171717', '#4B5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <View className="flex-row items-center justify-between px-6 pt-16 pb-3">
        <Text className="text-white font-black text-base uppercase tracking-widest">
          Coach Tecnica
        </Text>
        <TouchableOpacity
          onPress={closeCoach}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/15"
        >
          <X size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-4">
        <Text className="text-3xl text-white font-black tracking-tight">{exerciseName}</Text>
      </View>

      <View className="flex-1 px-6 pb-8">
        {mode === 'intro' ? (
          <View className="flex-1">
            <View className="bg-black/35 border border-white/10 rounded-3xl p-5 mb-4">
              <Text className="text-gray-300 text-sm mb-3">
                Ti mostro l&apos;esecuzione e poi avviamo il tracking live con correzioni tecniche
                in tempo reale.
              </Text>
              <View className="rounded-2xl bg-black/40 border border-white/10 h-52 items-center justify-center">
                {mediaUrl ? (
                  <Text className="text-gray-300 text-xs px-4 text-center">
                    Media esercizio disponibile e pronto per preview.
                  </Text>
                ) : (
                  <Text className="text-gray-500 text-xs px-4 text-center">
                    Nessun media disponibile: useremo solo guida testuale.
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleStartCalibration}
              className="mt-auto bg-[#10B981] rounded-2xl py-4 items-center"
            >
              <View className="flex-row items-center">
                <Play size={18} color="#000" />
                <Text className="text-black font-black uppercase tracking-widest text-sm ml-2">
                  Avvia Coach
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {mode === 'calibration' ? (
          <View className="flex-1">
            <View className="bg-black/35 border border-white/10 rounded-3xl p-5 mb-4">
              <Text className="text-white font-black text-lg mb-2">Calibrazione</Text>
              <Text className="text-gray-300 text-sm">
                Posizionati a circa 1.5m dalla camera. Quando sei pronto avviamo il tracking.
              </Text>
            </View>

            <View
              className="rounded-3xl bg-black/40 border border-white/10 flex-1 overflow-hidden relative"
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setTrackingLayout({ width, height });
              }}
            >
              <TouchableOpacity
                onPress={toggleCameraFacing}
                className="absolute top-3 right-3 z-20 bg-black/50 border border-white/15 rounded-full px-3 py-2 flex-row items-center"
              >
                <RotateCcw size={14} color="#FFF" />
                <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2">
                  {cameraFacing === 'front' ? 'Front' : 'Back'}
                </Text>
              </TouchableOpacity>

              {permission?.granted ? (
                <CameraView
                  style={{ position: 'absolute', inset: 0 }}
                  facing={cameraFacing}
                  mute={true}
                />
              ) : (
                <View className="flex-1 items-center justify-center px-6">
                  <Camera size={52} color="#10B981" />
                  <Text className="text-gray-300 text-sm mt-3 text-center">
                    Permetti l&apos;accesso alla camera per iniziare la calibrazione.
                  </Text>
                </View>
              )}

              <View className="absolute top-3 left-3 right-3 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                <Text className="text-gray-200 text-xs">
                  Mantieni spalle e anche sempre visibili nel frame.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleStartTracking}
              className="mt-4 bg-[#10B981] rounded-2xl py-4 items-center"
            >
              <Text className="text-black font-black uppercase tracking-widest text-sm">
                Inizia Tracking
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {mode === 'tracking' ? (
          <View className="flex-1">
            <View className="rounded-3xl bg-black/40 border border-white/10 p-5 mb-4">
              <Text className="text-gray-400 text-xs uppercase tracking-widest">Ripetizioni</Text>
              <Text className="text-white font-black text-5xl tracking-tight mt-1">{repCount}</Text>
              <Text className="text-[#10B981] font-bold text-sm mt-3">{liveHint}</Text>
            </View>

            <View className="rounded-3xl bg-black/40 border border-white/10 flex-1 overflow-hidden relative">
              <TouchableOpacity
                onPress={toggleCameraFacing}
                className="absolute top-3 right-3 z-20 bg-black/50 border border-white/15 rounded-full px-3 py-2 flex-row items-center"
              >
                <RotateCcw size={14} color="#FFF" />
                <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2">
                  {cameraFacing === 'front' ? 'Front' : 'Back'}
                </Text>
              </TouchableOpacity>

              {permission?.granted ? (
                <CameraView
                  style={{ position: 'absolute', inset: 0 }}
                  facing={cameraFacing}
                  mute={true}
                />
              ) : (
                <View className="flex-1 items-center justify-center px-6">
                  <Text className="text-gray-300 text-sm text-center">
                    Accesso camera non disponibile. Ritorna a calibrazione e concedi i permessi.
                  </Text>
                </View>
              )}

              <PoseOverlayDebug
                frame={frame}
                width={trackingLayout.width}
                height={trackingLayout.height}
                boneConnections={boneConnections}
              />

              <View className="absolute top-3 left-3 right-3 bg-black/45 border border-white/10 rounded-xl px-3 py-2">
                <Text className="text-[#A7F3D0] font-bold text-xs">Hint live: {liveHint}</Text>
                <Text className="text-gray-300 text-[10px] mt-1">Pose stream: {source}</Text>
              </View>

              <View className="absolute bottom-3 left-3 right-3 bg-black/45 border border-white/10 rounded-xl px-3 py-2">
                <Text className="text-gray-200 text-xs text-center">
                  Overlay keypoints e analisi tecnica verranno connessi nel prossimo step.
                </Text>
              </View>
            </View>

            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={incrementRep}
                className="flex-1 bg-white/10 border border-white/15 rounded-2xl py-4 items-center mr-2"
              >
                <Text className="text-white font-black uppercase tracking-widest text-xs">
                  +1 Rep
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={completeTracking}
                className="flex-1 bg-[#10B981] rounded-2xl py-4 items-center ml-2"
              >
                <Text className="text-black font-black uppercase tracking-widest text-xs">
                  Termina Set
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {mode === 'summary' ? (
          <View className="flex-1">
            <View className="rounded-3xl bg-black/40 border border-white/10 p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <CheckCircle2 size={22} color="#10B981" />
                <Text className="text-white font-black text-lg ml-2">Riepilogo Tecnica</Text>
              </View>
              <Text className="text-gray-300 text-sm">Reps rilevate: {summary?.repCount ?? 0}</Text>
            </View>

            <View className="rounded-3xl bg-black/40 border border-white/10 p-5 mb-4">
              <Text className="text-white font-black text-sm uppercase tracking-widest mb-2">
                Errori principali
              </Text>
              {(summary?.mistakes || []).map((mistake, idx) => (
                <Text key={`${mistake}-${idx}`} className="text-gray-300 text-sm mb-1">
                  - {mistake}
                </Text>
              ))}
            </View>

            <View className="rounded-3xl bg-black/40 border border-white/10 p-5">
              <Text className="text-white font-black text-sm uppercase tracking-widest mb-2">
                Come migliorare
              </Text>
              {(summary?.tips || []).map((tip, idx) => (
                <Text key={`${tip}-${idx}`} className="text-[#A7F3D0] text-sm mb-1">
                  - {tip}
                </Text>
              ))}
            </View>

            <View className="flex-row mt-auto">
              <TouchableOpacity
                onPress={backToIntro}
                className="flex-1 bg-white/10 border border-white/15 rounded-2xl py-4 items-center mr-2"
              >
                <Text className="text-white font-black uppercase tracking-widest text-xs">
                  Nuovo Set
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeCoach}
                className="flex-1 bg-[#10B981] rounded-2xl py-4 items-center ml-2"
              >
                <Text className="text-black font-black uppercase tracking-widest text-xs">
                  Chiudi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
