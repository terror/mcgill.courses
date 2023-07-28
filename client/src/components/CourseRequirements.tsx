import { Link } from 'react-router-dom';
import { Requirements } from '../model/Requirements';

type ReqsBlockProps = {
  title: string;
  text?: string;
};

const capitalize = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const punctuate = (s: string): string => {
  return s.charAt(s.length - 1) === '.' ? s : s + '.';
};

const transform = (html: string): React.ReactNode[] => {
  const parser = new DOMParser();

  const split = html.split(':');
  const text = capitalize(
    punctuate(split.length <= 1 ? html.trim() : split[1].trim())
  );

  const doc = parser.parseFromString(text, 'text/html');

  const elems: React.ReactNode[] = Array.from(doc.body.childNodes).map(
    (node) => {
      switch (node.nodeType) {
        case Node.ELEMENT_NODE: {
          const elem = node as HTMLElement;
          if (node.nodeName === 'A') {
            const href = elem.getAttribute('href');
            if (!href) return elem.innerText;

            const courseMatch = href.match(/courses\/(.+)-(.+)/);
            if (!courseMatch) {
              return <a href={href}>{elem.innerText}</a>;
            }
            const courseCode = (courseMatch[1] + courseMatch[2]).toUpperCase();

            return (
              <Link
                to={`/course/${courseCode}`}
                className='text-gray-800 hover:underline dark:text-gray-200'
              >
                {elem.innerText}
              </Link>
            );
          }
          return (node as HTMLElement).innerText;
        }
        case Node.TEXT_NODE:
          return (node as Text).textContent;
        case Node.COMMENT_NODE:
          return null;
      }
    }
  );

  return elems;
};

const ReqsBlock = ({ title, text }: ReqsBlockProps) => {
  return (
    <div>
      <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
        {title}
      </h2>
      {text ? (
        <div className='text-gray-500 dark:text-gray-400'>
          {transform(text)}
        </div>
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
