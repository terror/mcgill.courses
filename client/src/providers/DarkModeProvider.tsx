import { PropsWithChildren, createContext, useState } from 'react';

export interface Theme {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export const DarkModeContext = createContext<Theme | undefined>(undefined);

export const DarkModeProvider = ({ children }: PropsWithChildren<any>) => {
  const [darkMode, setDark] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  const setDarkMode = (darkMode: boolean) => {
    setDark(darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
