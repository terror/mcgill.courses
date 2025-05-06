import { useContext } from 'react';

import { DarkModeContext } from '../providers/dark-mode-provider';

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context)
    throw new Error('DarkModeContext must be used inside DarkModeProvider');
  return context;
};
