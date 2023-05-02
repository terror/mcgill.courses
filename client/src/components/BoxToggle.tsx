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
    <div className='mx-auto flex w-full max-w-xl flex-col px-2 sm:px-0'>
      <div className='space-around flex flex-row rounded-lg border p-3'>
        <button className='mr-auto' onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </button>
        {title ? <h1 className='text-2xl'>{title}</h1> : null}
      </div>
      {isOpen ? (
        <div className='transition duration-200 ease-in-out'>{child}</div>
      ) : null}
    </div>
  );
};
