import { useRef, useCallback, useMemo } from 'react';
import { Animated, PanResponder, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

interface UseSwipeDownCloseOptions {
  onClose?: () => void;
  restrictStartY?: boolean;
  startYThreshold?: number;
}

export function useSwipeDownClose({ 
  onClose, 
  restrictStartY = false, 
  startYThreshold = height * 0.58 
}: UseSwipeDownCloseOptions) {
  
  const panY = useRef(new Animated.Value(height)).current;

  const closeAnimated = useCallback(() => {
    if (!onClose) return;
    Animated.timing(panY, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, panY]);

  const openAnimated = useCallback(() => {
    panY.setValue(height);
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [panY]);

  const panResponder = useMemo(() => {
    const shouldStartGesture = (dy: number, dx: number, y0: number) => {
      if (!onClose) return false;
      if (restrictStartY && y0 > startYThreshold) return false;
      return dy > 4 && Math.abs(dy) > Math.abs(dx);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        shouldStartGesture(gestureState.dy, gestureState.dx, gestureState.y0),
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        shouldStartGesture(gestureState.dy, gestureState.dx, gestureState.y0),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.0) {
          closeAnimated();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
        }
      },
    });
  }, [closeAnimated, onClose, panY, restrictStartY, startYThreshold]);

  return {
    panY,
    panHandlers: panResponder.panHandlers,
    closeAnimated,
    openAnimated,
  };
}
