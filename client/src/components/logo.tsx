import darkModeLogoUrl from '../assets/logo-darkmode.svg';
import lightModeLogoUrl from '../assets/logo-lightmode.svg';
import { useDarkMode } from '../hooks/use-dark-mode';

type LogoProps = {
  darkMode?: boolean;
  size?: number;
  className?: string;
  altText?: string;
};

export const Logo = ({
  size = 48,
  className = '',
  altText = 'mcgill.courses logo',
}: LogoProps) => {
  const [darkMode] = useDarkMode();

  return (
    <img
      className={className}
      src={darkMode ? darkModeLogoUrl : lightModeLogoUrl}
      alt={altText}
      style={{ height: size, width: 'auto' }}
    />
  );
};
