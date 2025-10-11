import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void;
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void;
  delay?: number;
}

export const useLongPress = ({ onLongPress, onClick, delay = 500 }: UseLongPressOptions) => {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      target.current = event.target;
      timeout.current = setTimeout(() => {
        setIsLongPressActive(true);
        onLongPress(event);
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
      
      if (shouldTriggerClick && !isLongPressActive && onClick && target.current === event.target) {
        onClick(event);
      }
      
      setIsLongPressActive(false);
      target.current = null;
    },
    [onClick, isLongPressActive]
  );

  return {
    onMouseDown: start,
    onMouseUp: (event: React.MouseEvent) => clear(event),
    onMouseLeave: (event: React.MouseEvent) => clear(event, false),
    onTouchStart: start,
    onTouchEnd: (event: React.TouchEvent) => clear(event),
    isLongPressActive,
  };
};
