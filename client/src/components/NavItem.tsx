import { Link } from 'react-router-dom';
import { classNames } from '../lib/utils';

type NavItemProps = {
  name: string;
  href: string;
};

export const NavItem = ({ name, href }: NavItemProps) => {
  const redUnderlineStyle =
    'before:content before:absolute before:block before:w-full before:h-[2px] before:bottom-0 before:left-0 before:bg-red-600';

  return (
    <Link
      to={href}
      className={classNames(
        'relative text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200 -z-10',
        location.pathname === href
          ? redUnderlineStyle
          : classNames(
            redUnderlineStyle,
            'before:origin-top-left before:scale-x-0 before:transition before:duration-300 before:ease-in-out before:hover:scale-x-100'
          )
      )}
    >
      {name}
    </Link>
  );
};
