import { Combobox, Transition } from '@headlessui/react';
import { useState } from 'react';
import { Check, ChevronDown, X } from 'react-feather';

type MultiSelectProps = {
  options: string[];
  values: string[];
  setValues: (values: string[]) => void;
};

export const MultiSelect = ({
  options,
  values,
  setValues,
}: MultiSelectProps) => {
  const [query, setQuery] = useState('');
  // Need to prevent the onBlur (resetting query) from firing when just clicking an option
  const [optionClicked, setOptionClicked] = useState(false);

  const filtered =
    query === ''
      ? options
      : options.filter((x) => {
          return x.toLowerCase().includes(query.toLowerCase());
        });

  const removeVal = (val: string) => {
    setValues(values.filter((x) => x !== val));
  };

  const handleInputBlur = () => {
    // A hack to fix a flickering issue when closing the dropdown
    setTimeout(() => {
      if (!optionClicked) {
        setQuery('');
      }
      setOptionClicked(false);
    }, 200);
  };

  const handleOptionMouseDown = () => {
    setOptionClicked(true);
  };

  const handleOptionMouseUp = () => {
    setOptionClicked(false);
  };

  return (
    <div className='w-full'>
      <Combobox
        value={values}
        onChange={(val) => {
          setValues(val);
        }}
        multiple
      >
        <div className='max-w-72'>
          <div className='relative rounded-md bg-gray-100 p-2 dark:bg-neutral-700'>
            <Combobox.Input
              className='bg-gray-100 outline-none dark:bg-neutral-700 dark:text-gray-200 dark:caret-white'
              onChange={(event) => setQuery(event.target.value)}
              onBlur={handleInputBlur}
            />
            <Combobox.Button className='absolute inset-y-0 flex w-full items-center'>
              <ChevronDown
                className='ml-auto mr-4 h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </Combobox.Button>
          </div>
          <Transition
            enter='transition duration-100 ease-out'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition duration-75 ease-out'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            <Combobox.Options className='autocomplete absolute max-h-80 w-full overflow-scroll rounded-b-md shadow-md'>
              {filtered.map((val, i) => (
                <Combobox.Option
                  key={i}
                  value={val}
                  className={({ active }) => `cursor-pointer p-2
                    ${
                      active
                        ? 'bg-gray-100 dark:bg-neutral-500'
                        : 'bg-white text-gray-900 dark:bg-neutral-600 dark:text-gray-200'
                    }`}
                  onMouseDown={handleOptionMouseDown}
                  onMouseUp={handleOptionMouseUp}
                >
                  <div className='flex justify-between'>
                    <div>{val}</div>
                    {values.includes(val) && (
                      <Check className='stroke-red-600' />
                    )}
                  </div>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      <div className='mt-2 flex w-full flex-wrap gap-1'>
        {values.map((val) => (
          <div className='flex space-x-1 rounded-3xl bg-gray-100 px-2.5 py-1 dark:bg-neutral-700 dark:text-gray-200'>
            <div>{val}</div>
            <button type='button' onClick={() => removeVal(val)}>
              <X
                size={18}
                className='transition duration-75 hover:stroke-red-600'
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
