import { Combobox, Transition } from '@headlessui/react';
import { useState } from 'react';
import { GoX } from 'react-icons/go';
import ValidCourseCodes from '../assets/ValidCourseCodes.json';
import { classNames } from '../lib/utils';

const termsOptions = ['Fall', 'Winter', 'Summer'];
const levelsOptions = ['1XX', '2XX', '3XX', '4XX', '5XX', '6XX', '7XX'];
const codesOptions = ValidCourseCodes;

type InputBoxProp = {
  selected: string[];
  setSelected: (selected: string[]) => void;
  options: string[];
};

type ExploreFilterProp = {
  selectedCodes: string[];
  setSelectedCodes: (selected: string[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (selected: string[]) => void;
  selectedTerms: string[];
  setSelectedTerms: (selected: string[]) => void;
  variant: 'mobile' | 'desktop';
};

type FilterButtonProp = {
  name: string;
  isSelected: boolean;
  selections: string[];
  setSelections: (selected: string[]) => void;
};

const FilterButton = ({
  name,
  isSelected,
  selections,
  setSelections,
}: FilterButtonProp) => {
  const [selected, setSelected] = useState(isSelected);
  const selectedColor = 'bg-red-600 text-gray-100';
  const unselectedColor =
    'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-100';

  return (
    <button
      className={`mx-2 ml-0 rounded-full px-4 py-2 font-semibold tracking-wider transition duration-150 ease-in-out
    ${selected ? selectedColor : unselectedColor}`}
      onClick={() => {
        setSelected(!selected);
        if (selected) {
          setSelections(selections.filter((selection) => selection !== name));
        } else {
          setSelections(selections.concat(name));
        }
      }}
    >
      {name}
    </button>
  );
};

const CourseCodeBox = ({
  selectedOption,
  selectedOptions,
  setSelectedOptions,
}: {
  selectedOption: string;
  selectedOptions: string[];
  setSelectedOptions: (selected: string[]) => void;
}) => {
  return (
    <div className='mx-1 mt-4 flex h-8 w-28 items-center justify-end rounded-full bg-gray-100 dark:bg-neutral-700'>
      <p className='mx-auto my-auto pl-3 text-xl font-medium tracking-wider text-black dark:text-gray-100'>
        {selectedOption}
      </p>
      <button
        className='my-auto ml-auto p-1 pr-2 text-black'
        onClick={() =>
          setSelectedOptions(
            selectedOptions.filter(
              (option) => option !== selectedOption && option !== ''
            )
          )
        }
      >
        <GoX className='ml-0 h-5 w-5 duration-300 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-700' />
      </button>
    </div>
  );
};

const InputBox = ({ selected, setSelected, options }: InputBoxProp) => {
  const [query, setQuery] = useState('');

  const filteredData =
    query === ''
      ? options
      : options.filter((data) => {
          return data.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className='flex flex-col'>
      <div className='rounded-full border dark:border-neutral-700'>
        <Combobox
          value={selected}
          onChange={(val) => setSelected(val)}
          multiple
        >
          {' '}
          <div className='relative z-10 w-full cursor-default overflow-hidden rounded-full bg-white text-left shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 dark:border-neutral-900 dark:bg-black sm:text-sm'>
            <Combobox.Input
              className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none dark:bg-neutral-800 dark:text-gray-200'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && filteredData.length > 0) {
                  setQuery('');
                }
              }}
              autoComplete='off'
            />
          </div>
          <Transition
            enter='transition ease-in-out duration-100 transform'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='transition ease-in-out duration-75 transform'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <div className='absolute z-50 w-full bg-white'>
              {query !== '' && (
                <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 sm:text-sm'>
                  {filteredData.length > 0 ? (
                    filteredData.map((data) => (
                      <Combobox.Option key={data} value={data}>
                        {({ active }) => (
                          <div
                            className={`${
                              active
                                ? 'bg-red-600 text-gray-100'
                                : 'text-gray-700 dark:text-gray-100'
                            } p-2 text-lg`}
                            onClick={() => {
                              setQuery('');
                            }}
                          >
                            {data}
                          </div>
                        )}
                      </Combobox.Option>
                    ))
                  ) : (
                    <p className='p-2 text-lg text-gray-800 dark:text-gray-100'>
                      Nothing Found.
                    </p>
                  )}
                </Combobox.Options>
              )}
            </div>
          </Transition>
        </Combobox>
      </div>
    </div>
  );
};

const SelectedCourseCodes = ({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (selected: string[]) => void;
}) => {
  return selected.length > 0 ? (
    <div className='flex flex-wrap'>
      {selected.map((item) => (
        <CourseCodeBox
          selectedOption={item}
          selectedOptions={selected}
          setSelectedOptions={(value) => setSelected(value)}
        />
      ))}
    </div>
  ) : null;
};

export const ExploreFilter = ({
  selectedCodes,
  setSelectedCodes,
  selectedLevels,
  setSelectedLevels,
  selectedTerms,
  setSelectedTerms,
  variant,
}: ExploreFilterProp) => {
  return (
    <div
      className={classNames(
        variant === 'mobile' ? 'mx-auto w-full' : 'ml-5 w-96 ',
        'm-2 box-border flex h-fit flex-col flex-wrap rounded-lg border bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200'
      )}
    >
      <h1 className='m-10 mb-2 text-3xl font-semibold'>Filter by:</h1>
      <div className='m-10 mt-2 space-y-5'>
        <div className='space-y-3'>
          <h1 className='text-2xl font-semibold'>Course Code</h1>
          <InputBox
            selected={selectedCodes}
            setSelected={(value) => setSelectedCodes(value)}
            options={codesOptions}
          />
        </div>
        <SelectedCourseCodes
          selected={selectedCodes}
          setSelected={setSelectedCodes}
        />
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>Level</h1>
          {levelsOptions.map((level) => (
            <FilterButton
              name={level}
              isSelected={selectedLevels.includes(level)}
              selections={selectedLevels}
              setSelections={setSelectedLevels}
            />
          ))}
        </div>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>Term</h1>
          {termsOptions.map((term) => (
            <FilterButton
              name={term}
              isSelected={selectedTerms.includes(term)}
              selections={selectedTerms}
              setSelections={setSelectedTerms}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
