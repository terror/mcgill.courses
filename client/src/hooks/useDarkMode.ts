import { useContext } from 'react';

import { DarkModeContext } from '../providers/DarkModeProvider';

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context)
    throw new Error('DarkModeContext must be used inside DarkModeProvider');
  return context;
};
