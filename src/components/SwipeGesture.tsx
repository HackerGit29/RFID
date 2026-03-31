import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

interface SwipeGestureProps {
  children: ReactNode;
  enabled?: boolean;
  threshold?: number;
  onSwipeLeft?: () => void;
}

export default function SwipeGesture({
  children,
  enabled = true,
  threshold = 100,
  onSwipeLeft,
}: SwipeGestureProps) {
  const navigate = useNavigate();

  const bind = useDrag(
    ({
      movement: [mx],
      direction: [dirX],
      velocity: [velX],
      swipe: [swipeX],
    }) => {
      // Swipe left detection (quick swipe to the left)
      if (swipeX?.[0] === -1 && dirX[0] === -1 && velX[0] > 0.5) {
        handleSwipeBack();
      }
    },
    {
      swipe: {
        distance: threshold,
        velocity: 0.5,
      },
      filterTaps: true,
      pointer: { touch: true },
      target: window,
    }
  );

  const handleSwipeBack = async () => {
    // Haptic feedback on native platforms
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: Haptics.ImpactStyle.Medium });
    }

    // Custom swipe handler or default back navigation
    if (onSwipeLeft) {
      onSwipeLeft();
    } else {
      navigate(-1);
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      {...bind}
      className="h-full w-full"
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
}
