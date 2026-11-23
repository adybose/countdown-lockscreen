import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Minute-aligned clock: re-renders at each minute boundary while the app is active,
 * pauses in the background, and refreshes immediately on return (DESIGN §11).
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      const d = new Date();
      const ms = 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50;
      timeout = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, ms);
    };
    const stop = () => {
      if (timeout) clearTimeout(timeout);
      timeout = null;
    };

    schedule();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNow(new Date());
        stop();
        schedule();
      } else {
        stop();
      }
    });
    return () => {
      stop();
      sub.remove();
    };
  }, []);

  return now;
}
