import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    window
      .matchMedia('(min-width: 768px)')
      .addEventListener('change', (e) => setMatches(e.matches));
  }, []);

  return matches;
};
