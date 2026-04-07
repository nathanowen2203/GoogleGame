import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 up to `target` using ease-out-cubic.
 * @param {number} target  - Final value
 * @param {number} duration - Animation duration in ms (default 900)
 * @param {boolean} enabled - Set true to start counting (e.g. when revealed)
 */
export function useCountUp(target, duration = 900, enabled = false) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }
    if (target === 0) {
      setValue(0);
      return;
    }

    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, enabled]);

  return value;
}
