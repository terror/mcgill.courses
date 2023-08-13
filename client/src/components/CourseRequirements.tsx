import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { capitalize, punctuate } from '../lib/utils';
import { Requirements } from '../model/Requirements';
import { PiGraphFill } from 'react-icons/pi';
import { FiList } from 'react-icons/fi';
import { CourseGraph } from './CourseGraph';
import { Course } from '../model/Course';

type ReqsBlockProps = {
  title: string;
  text?: string;
};

const transform = (html: string): React.ReactNode[] => {
  const text = html.substring(html.indexOf(':') + 1);

  const doc = new DOMParser().parseFromString(
    capitalize(punctuate(text.trim())),
    'text/html'
  );

  return Array.from(doc.body.childNodes).map((node, index) => {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        const elem = node as HTMLElement;

        if (node.nodeName === 'A') {
          const href = elem.getAttribute('href');

          if (!href) return elem.innerText;

          const courseMatch = href.match(/courses\/(.+)-(.+)/);

          if (!courseMatch) return <a href={href}>{elem.innerText}</a>;

          const courseCode = `${courseMatch[1]}-${courseMatch[2]}`;

          return (
            <Link
              key={index}
              to={`/course/${courseCode}`}
              className='text-gray-800 hover:underline dark:text-gray-200'
            >
              {elem.innerText}
            </Link>
          );
        }

        return <span key={index}>{(node as HTMLElement).innerText}</span>;
      }
      case Node.TEXT_NODE:
        return <span key={index}>{(node as Text).textContent}</span>;
      case Node.COMMENT_NODE:
        return null;
    }
  });
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
  course: Course;
  requirements: Requirements;
};

export const CourseRequirements = ({
  course,
  requirements,
}: RequirementsProps) => {
  const [showGraph, setShowGraph] = useState(false);

  const handleGraphToggle = useCallback(
    () => setShowGraph((prev) => !prev),
    [setShowGraph]
  );

  const ToggleButtonIcon = showGraph ? FiList : PiGraphFill;

  return (
    <div className='relative w-full rounded-md bg-slate-50 dark:bg-neutral-800'>
      <button
        className='absolute right-6 top-3 z-10 cursor-pointer rounded-full p-1 transition duration-150 hover:bg-gray-200'
        onClick={handleGraphToggle}
      >
        <ToggleButtonIcon size={28} className='fill-gray-700' />
      </button>
      {!showGraph ? (
        <div className='space-y-7 p-6'>
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
      ) : (
        <div className=''>
          <CourseGraph course={course} />
        </div>
      )}
    </div>
  );
};
