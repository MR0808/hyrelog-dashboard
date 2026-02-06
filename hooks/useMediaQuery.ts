'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport matches the given media query.
 * Uses window.matchMedia; safe for SSR (returns false until mounted).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
