import { Transition } from '@headlessui/react';
import { ReactComponentElement } from 'react';
import { FaBars } from 'react-icons/fa';

type BoxToggleProps = {
  title?: string;
  child: ReactComponentElement<any>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const BoxToggle = ({
  title,
  child,
  isOpen,
  setIsOpen,
}: BoxToggleProps) => {
  return (
    <div className='mx-auto flex w-full flex-col sm:px-0'>
      <div className='space-around flex flex-row rounded-lg border p-3 dark:border-neutral-700'>
        <button className='mr-auto' onClick={() => setIsOpen(!isOpen)}>
          <FaBars className='text-gray-700 dark:text-neutral-400' />
        </button>
        {title ? <h1 className='text-2xl'>{title}</h1> : null}
      </div>
      <Transition
        show={isOpen}
        enter='transition ease-out duration-100 transform'
        enterFrom='opacity-0 scale-95'
        enterTo='opacity-100 scale-100'
        leave='transition ease-in duration-75 transform'
        leaveFrom='opacity-100 scale-100'
        leaveTo='opacity-0 scale-95'
      >
        {child}
      </Transition>
    </div>
  );
};
