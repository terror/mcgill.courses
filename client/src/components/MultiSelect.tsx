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

  const filtered =
    query === ''
      ? options
      : options.filter((x) => {
          return x.toLowerCase().includes(query.toLowerCase());
        });

  const removeVal = (val: string) => {
    setValues(values.filter((x) => x !== val));
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
        <div className='relative w-72'>
          <div className='relative rounded-md bg-gray-50 p-2 dark:bg-neutral-700'>
            <Combobox.Input
              className='bg-gray-50 outline-none dark:bg-neutral-700 dark:text-gray-200 dark:caret-white'
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => setQuery('')}
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
                  className={({ active }) => `p-2 cursor-pointer
                    ${
                      active
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-900 dark:bg-neutral-600 dark:text-gray-200'
                    }`}
                >
                  <div className='flex space-x-1'>
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
      <div className='flex flex-wrap mt-2 gap-1 w-full'>
        {values.map((val) => (
          <div className='flex px-2.5 py-1 bg-gray-100 dark:bg-neutral-700 dark:text-gray-200 rounded-3xl space-x-1'>
            <div>{val}</div>
            <button type='button' onClick={() => removeVal(val)}>
              <X
                size={18}
                className='hover:stroke-red-600 transition duration-75'
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
