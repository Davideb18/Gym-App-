import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play, VolumeX, Volume2 } from 'lucide-react-native';

interface ExerciseVideoPlayerProps {
  videoUrl: string;
}

export default function ExerciseVideoPlayer({ videoUrl }: ExerciseVideoPlayerProps) {
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
    <View className="w-full h-56 bg-black rounded-[32px] overflow-hidden border border-white/5 shadow-lg relative">
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={false}
      />

      {isBuffering ? (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : null}

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
