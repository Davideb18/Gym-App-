import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ExerciseVideoPlayerProps {
  imageUrls?: string[] | null;
  imageUrl?: string | null;
}

export default function ExerciseVideoPlayer({ imageUrls, imageUrl }: ExerciseVideoPlayerProps) {
  const AUTO_ADVANCE_INTERVAL_MS = 1000;
  const FADE_DURATION_MS = 900;
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const images = useMemo(() => {
    const cleanList = (imageUrls || []).filter((url): url is string => Boolean(url && url.trim()));
    if (cleanList.length > 0) {
      return cleanList;
    }
    return imageUrl ? [imageUrl] : [];
  }, [imageUrls, imageUrl]);

  useEffect(() => {
    setCurrentIndex(0);
    setPreviousIndex(null);
    setIsPaused(false);
    fadeAnim.setValue(1);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        setPreviousIndex(prev);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: FADE_DURATION_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          setPreviousIndex(null);
        });
        return next;
      });
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [images, isPaused, fadeAnim, AUTO_ADVANCE_INTERVAL_MS, FADE_DURATION_MS]);

  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    Image.getSize(
      images[currentIndex],
      (width, height) => {
        if (width > 0 && height > 0) {
          const ratio = width / height;
          // Limit ratios to keep layout stable on extreme source photos.
          const safeRatio = Math.min(1.8, Math.max(0.6, ratio));
          setAspectRatio(safeRatio);
        }
      },
      () => {
        setAspectRatio(4 / 3);
      },
    );
  }, [images, currentIndex]);

  const togglePause = () => {
    if (images.length > 1) {
      setIsPaused((prev) => !prev);
    }
  };

  return (
    <View
      className="w-full bg-black rounded-[32px] overflow-hidden border border-white/5 shadow-lg relative justify-center items-center"
      style={{ aspectRatio }}
    >
      {images.length > 0 ? (
        <TouchableOpacity activeOpacity={0.95} className="w-full h-full" onPress={togglePause}>
          {previousIndex !== null ? (
            <Image
              source={{ uri: images[previousIndex] }}
              className="absolute inset-0 w-full h-full"
              resizeMode="contain"
            />
          ) : null}

          <Animated.Image
            source={{ uri: images[currentIndex] }}
            style={{ opacity: fadeAnim }}
            className="absolute inset-0 w-full h-full"
            resizeMode="contain"
          />

          {images.length > 1 ? (
            <View className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/55 border border-white/15">
              <Text className="text-white text-[10px] font-bold">
                {currentIndex + 1}/{images.length}
              </Text>
            </View>
          ) : null}

          {images.length > 1 && isPaused ? (
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-black/70 border border-white/20 items-center justify-center">
                <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <Text className="text-white/85 text-[11px] mt-2 font-bold">
                {t('exercises.media_tap_resume')}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View className="items-center">
          <ActivityIndicator size="small" color="#10B981" />
          <Text className="text-gray-300 text-xs mt-2">{t('exercises.media_no_image')}</Text>
        </View>
      )}
    </View>
  );
}
