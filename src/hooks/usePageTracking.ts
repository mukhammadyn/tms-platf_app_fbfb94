import { useEffect } from 'react';
import { hit } from '../utils/metrica';

/**
 * Tracks page views via Yandex Metrica.
 * Works without React Router by listening to browser navigation events.
 */
export function usePageTracking(): void {
  useEffect(() => {
    const track = (): void => {
      const url = window.location.href;
      hit(url, { title: document.title });
    };

    // Fire on initial mount
    track();

    // Re-fire on hash-based or history-based navigation
    window.addEventListener('popstate', track);
    window.addEventListener('hashchange', track);

    return () => {
      window.removeEventListener('popstate', track);
      window.removeEventListener('hashchange', track);
    };
  }, []);
}
