import { useEffect, useRef, useState } from 'react';

export function useThrottledState<T>(initialValue: T, delay: number) {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [throttledValue, setThrottledValue] = useState<T>(initialValue);
  const lastUpdate = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateThrottledValue = () => {
      setThrottledValue(immediateValue);
      lastUpdate.current = Date.now();
      timeoutRef.current = setTimeout(updateThrottledValue, delay);
    };

    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(updateThrottledValue, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [immediateValue, delay]);

  const throttledSetValue = (newValue: T | ((prev: T) => T)) => {
    setImmediateValue(newValue);
  };

  return [throttledValue, throttledSetValue] as const;
}
