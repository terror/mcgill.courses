import { Transition } from '@headlessui/react';
import { ReactComponentElement } from 'react';
import { FaBars } from 'react-icons/fa';

type BoxToggleProps = {
  title?: string;
  child: ReactComponentElement<any>;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

export const BoxToggle = ({ title, child, open, setOpen }: BoxToggleProps) => {
  return (
    <div className='w-full'>
      <div className='mb-1 flex flex-row rounded-lg bg-slate-50 p-3 dark:bg-neutral-800'>
        <button className='mr-auto' onClick={() => setOpen(!open)}>
          <FaBars className='text-gray-700 dark:text-neutral-400' />
        </button>
        {title ? <h1 className='text-2xl'>{title}</h1> : null}
      </div>
      <Transition
        show={open}
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
