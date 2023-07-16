import { Transition } from '@headlessui/react';

type TooltipProps = {
  show: boolean;
  text: string;
  children: React.ReactNode;
};

export const Tooltip = ({ show, text, children }: TooltipProps) => {
  return (
    <span>
      <Transition
        show={show}
        className='absolute -top-1 left-0 z-10 min-w-fit -translate-x-0 -translate-y-full rounded-md bg-white p-2 text-center text-xs font-medium text-gray-700 dark:bg-neutral-500 dark:text-gray-100'
        enter='transition-opacity duration-200'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-opacity duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div>{text}</div>
      </Transition>
      {children}
    </span>
  );
};
