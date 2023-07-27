import { Requirements } from '../model/Requirements';

type ReqsBlockProps = {
  title: string;
  text?: string;
};

const transform = (html: string): string => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, 'text/html');

  const links = doc.querySelectorAll('a');

  links.forEach((link) => {
    const href = link.getAttribute('href');

    if (href) {
      const courseMatch = href.match(/courses\/(.+)-(.+)/);

      if (courseMatch)
        link.setAttribute(
          'href',
          '/course/' + (courseMatch[1] + courseMatch[2]).toUpperCase()
        );
    }
  });

  const capitalize = (s: string): string => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const punctuate = (s: string): string => {
    return s.charAt(s.length - 1) === '.' ? s : s + '.';
  };

  const replaced = doc.body.innerHTML;

  return ((split: string[]) =>
    split.length <= 1
      ? capitalize(punctuate(replaced.trim()))
      : capitalize(punctuate(split[1].trim())))(replaced.split(':'));
};

const ReqsBlock = ({ title, text }: ReqsBlockProps) => {
  return (
    <div>
      <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
        {title}
      </h2>
      {text ? (
        <p
          className='text-gray-500 dark:text-gray-400'
          dangerouslySetInnerHTML={{ __html: transform(text) }}
        />
      ) : (
        <p className='text-gray-500 dark:text-gray-400'>
          This course has no {title.toLowerCase()}.
        </p>
      )}
    </div>
  );
};

type RequirementsProps = {
  requirements: Requirements;
};

export const CourseRequirements = ({ requirements }: RequirementsProps) => {
  return (
    <div className='w-full rounded-md bg-slate-50 p-4 dark:bg-neutral-800'>
      <div className='flex-col space-y-3'>
        <div className='m-4 space-y-7'>
          <ReqsBlock
            title='Prerequisites'
            text={requirements.prerequisitesText}
          />
          <ReqsBlock
            title='Corequisites'
            text={requirements.corequisitesText}
          />
          <div>
            <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
              Restrictions
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {requirements.restrictions !== null
                ? requirements.restrictions
                : 'This course has no restrictions.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
