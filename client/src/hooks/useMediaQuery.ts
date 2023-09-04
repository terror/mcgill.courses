import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    window
      .matchMedia(query)
      .addEventListener('change', (e) => setMatches(e.matches));
  }, []);

  return matches;
};
