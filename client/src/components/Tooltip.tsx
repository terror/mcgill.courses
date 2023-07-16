import { Transition } from '@headlessui/react';

type TooltipProps = {
  show: boolean;
  text: string;
  children: React.ReactNode;
};

export const Tooltip = ({ show, text, children }: TooltipProps) => {
  return (
    <div>
      <Transition
        show={show}
        enter='transition-opacity duration-200'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-opacity duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='absolute -top-1 left-0 z-10 w-28 -translate-x-0 -translate-y-full rounded-lg bg-white p-2 text-center text-xs font-bold text-gray-700 dark:bg-neutral-500 dark:text-gray-100'>
          {text}
        </div>
      </Transition>
      {children}
    </div>
  );
};
