import { Link } from 'react-router-dom';

import { classNames } from '../lib/classNames';

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
        'text-sm font-semibold leading-6 text-gray-900 relative',
        location.pathname === href
          ? redUnderlineStyle
          : classNames(
              redUnderlineStyle,
              'before:hover:scale-x-100 before:scale-x-0 before:origin-top-left before:transition before:ease-in-out before:duration-300'
            )
      )}
    >
      {name}
    </Link>
  );
};
