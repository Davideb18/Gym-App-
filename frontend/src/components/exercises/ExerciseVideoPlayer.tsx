import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play, VolumeX, Volume2, Video } from 'lucide-react-native';

interface ExerciseVideoPlayerProps {
  initialVideoUrl?: string | null;
  imageUrl?: string | null;
  onRequestVideo?: () => Promise<string | null>;
}

function VideoPlayerRenderer({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if(player) {
      player.muted = !player.muted;
      setIsMuted(player.muted);
    }
  };

  const isPlaying = player?.playing ?? true;
  const isBuffering = player?.status === 'loading';

  const togglePlayPause = () => {
    if (player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  return (
    <View className="flex-1 relative">
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={false}
      />

      {isBuffering && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}

      <View className="absolute inset-0 justify-between p-3" pointerEvents="box-none">
        <View className="flex-row justify-end" pointerEvents="box-none">
          <TouchableOpacity 
            onPress={toggleMute}
            className="w-8 h-8 bg-black/50 rounded-full items-center justify-center border border-white/10"
          >
            {isMuted ? <VolumeX size={14} color="#FFF" /> : <Volume2 size={14} color="#FFF" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="absolute inset-0 items-center justify-center"
          onPress={togglePlayPause}
          activeOpacity={1}
        >
          {!isPlaying && !isBuffering ? (
             <View className="w-16 h-16 bg-black/60 rounded-full items-center justify-center border border-white/20">
               <Play size={24} color="#FFF" fill="#FFF" className="ml-1" />
             </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ExerciseVideoPlayer({
  initialVideoUrl,
  imageUrl,
  onRequestVideo,
}: ExerciseVideoPlayerProps) {
  const [loadVideo, setLoadVideo] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(initialVideoUrl || null);
  const [isRequestingVideo, setIsRequestingVideo] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handleLoadVideo = async () => {
    if (loadVideo || isRequestingVideo) {
      return;
    }

    if (resolvedVideoUrl) {
      console.log('✅ Video URL già presente, avvio player:', resolvedVideoUrl);
      setLoadVideo(true);
      return;
    }

    if (!onRequestVideo) {
      setRequestError('Video non disponibile');
      return;
    }

    try {
      setIsRequestingVideo(true);
      setRequestError(null);
      console.log('🔍 Richiesta nuovo video URL al backend...');
      const videoUrl = await onRequestVideo();
      console.log('📡 Risposta backend videoUrl:', videoUrl);

      if (!videoUrl) {
        setRequestError('Video non disponibile');
        return;
      }

      setResolvedVideoUrl(videoUrl);
      setLoadVideo(true);
    } catch (error: any) {
      console.error('❌ Errore durante onRequestVideo:', error);
      setRequestError(`Errore connessione: ${error.message || 'Server non raggiungibile'}`);
    } finally {
      setIsRequestingVideo(false);
    }
  };

  return (
    <View className="w-full h-80 bg-black rounded-[32px] overflow-hidden border border-white/5 shadow-lg relative justify-center items-center">
      {loadVideo && resolvedVideoUrl ? (
        <VideoPlayerRenderer videoUrl={resolvedVideoUrl} />
      ) : (
        <>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="absolute inset-0 w-full h-full opacity-60" resizeMode="cover" />
          ) : null}
          <TouchableOpacity 
            onPress={handleLoadVideo}
            activeOpacity={0.8}
            className="items-center justify-center bg-black/70 px-6 py-4 rounded-3xl border border-white/20 flex-row"
          >
            {isRequestingVideo ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Video size={20} color="#10B981" />
            )}
            <Text className="font-bold ml-2 text-white">
              {isRequestingVideo ? 'Caricamento video...' : 'Avvia il video'}
            </Text>
          </TouchableOpacity>
          {requestError ? <Text className="text-red-300 text-xs mt-3">{requestError}</Text> : null}
        </>
      )}
    </View>
  );
}
