import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../hooks/useDarkMode';

export const DarkModeToggle = () => {
  const { darkMode, setDarkMode } = useDarkMode();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? (
        <SunIcon className='h-6 w-6 fill-gray-200 stroke-gray-200 stroke-2' />
      ) : (
        <MoonIcon className='h-6 w-6 stroke-gray-600 stroke-2' />
      )}
    </button>
  );
};