import { useState } from 'react';
import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

import courseCodes from '../assets/courseCodes.json';
import { MultiSelect } from './MultiSelect';
import { ResetButton } from './ResetButton';

const termsOptions = ['Fall', 'Winter', 'Summer'];
type CourseTerm = (typeof termsOptions)[number];
const levelsOptions = ['1XX', '2XX', '3XX', '4XX', '5XX', '6XX', '7XX'];

type ExploreFilterProp = {
  selectedSubjects: string[];
  setSelectedSubjects: (selected: string[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (selected: string[]) => void;
  selectedTerms: string[];
  setSelectedTerms: (selected: string[]) => void;
  variant: 'mobile' | 'desktop';
};

type FilterButtonProp = {
  icon?: JSX.Element;
  isSelected: boolean;
  name: string;
  selections: string[];
  setSelections: (selected: string[]) => void;
};

const FilterButton = ({
  icon,
  isSelected,
  name,
  selections,
  setSelections,
}: FilterButtonProp) => {
  const [selected, setSelected] = useState(isSelected);

  if (isSelected !== selected) setSelected(isSelected);

  const selectedColor = 'bg-red-600 text-gray-100';

  const unselectedColor =
    'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-100';

  return (
    <button
      className={twMerge(
        'rounded-full px-4 py-2 font-semibold tracking-wider transition duration-150 ease-in-out',
        selected ? selectedColor : unselectedColor
      )}
      onClick={() => {
        setSelected(!selected);
        if (selected) {
          setSelections(selections.filter((selection) => selection !== name));
        } else {
          setSelections(selections.concat(name));
        }
      }}
    >
      <div className='flex items-center gap-x-2'>
        {icon && icon}
        {name}
      </div>
    </button>
  );
};

export const ExploreFilter = ({
  selectedSubjects,
  setSelectedSubjects,
  selectedLevels,
  setSelectedLevels,
  selectedTerms,
  setSelectedTerms,
  variant,
}: ExploreFilterProp) => {
  const termToIcon = (term: CourseTerm) => {
    switch (term) {
      case 'Fall':
        return <FaLeaf color='brown' />;
      case 'Winter':
        return <FaRegSnowflake color='skyblue' />;
      case 'Summer':
        return <BsSun color='orange' />;
    }
  };

  return (
    <div
      className={twMerge(
        variant === 'mobile' ? 'w-full' : 'w-96',
        'flex h-fit flex-col flex-wrap rounded-lg bg-slate-50 px-10 py-8 dark:bg-neutral-800 dark:text-gray-200'
      )}
    >
      <div className='flex flex-row'>
        <h1 className='mb-2 text-2xl font-semibold'>Filter</h1>
        <ResetButton
          className='ml-auto'
          onClear={() => {
            setSelectedSubjects([]);
            setSelectedLevels([]);
            setSelectedTerms([]);
          }}
        />
      </div>
      <div className='py-2.5' />
      <h1 className='text-xl font-semibold'>Course Code</h1>
      <div className='py-1.5' />
      <MultiSelect
        options={courseCodes}
        values={selectedSubjects}
        setValues={setSelectedSubjects}
      />
      <div>
        <h1 className='mt-3 text-xl font-semibold'>Level</h1>
        <div className='flex flex-wrap gap-2 py-1'>
          {levelsOptions.map((level, i) => (
            <FilterButton
              key={i}
              name={level}
              isSelected={selectedLevels.includes(level)}
              selections={selectedLevels}
              setSelections={setSelectedLevels}
            />
          ))}
        </div>
      </div>
      <div className='space-y-2'>
        <h1 className='mt-3 text-xl font-semibold'>Term</h1>
        <div className='flex flex-wrap gap-2'>
          {termsOptions.map((term, i) => (
            <FilterButton
              key={i}
              icon={termToIcon(term as CourseTerm)}
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
