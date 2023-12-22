import { NavItem } from './NavItem';

export const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Explore', href: '/explore' },
  { name: 'About', href: '/about' },
];

export const Footer = () => {
  return (
    <nav className='flex h-16 w-full flex-row items-center justify-between bg-slate-100 dark:bg-neutral-900'>
      <div className='ml-10 flex flex-row'>
        {navigationItems.map((item, i) => (
          <div key={i} className='mx-3'>
            <NavItem name={item.name} href={item.href} key={item.name} />
          </div>
        ))}
      </div>
      <div className='mr-10 space-x-6'>
        <NavItem name={'Privacy Policy'} href={'/privacy'} />
        <NavItem name={'Terms and Conditions'} href={'/tos'} />
      </div>
    </nav>
  );
};
