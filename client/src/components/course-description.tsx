import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { isValidCourseCode } from '../lib/utils';
import { Highlight } from './highlight';

type CourseDescriptionProps = {
  description: string;
  query?: string;
};

export const CourseDescription = ({
  description,
  query,
}: CourseDescriptionProps) => {
  const content = useMemo(() => {
    const parser = new DOMParser();

    const doc = parser.parseFromString(description.trim(), 'text/html');

    return Array.from(doc.body.childNodes).map((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        const textContent = element.textContent ?? '';
        const trimmedText = textContent.trim();

        if (element.nodeName === 'A') {
          const href = element.getAttribute('href');

          if (!href) {
            return (
              <span key={index}>
                <Highlight text={textContent} query={query} />
              </span>
            );
          }

          if (!isValidCourseCode(trimmedText)) {
            return (
              <a href={href} key={index}>
                <Highlight text={textContent} query={query} />
              </a>
            );
          }

          const courseCode = trimmedText.replace(' ', '-');

          return (
            <Link
              key={index}
              to={`/course/${courseCode}`}
              className='text-gray-800 hover:underline dark:text-gray-200'
            >
              <Highlight text={textContent} query={query} />
            </Link>
          );
        }

        return (
          <span key={index}>
            <Highlight text={textContent} query={query} />
          </span>
        );
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = (node as Text).textContent ?? '';

        return (
          <span key={index}>
            <Highlight text={textContent} query={query} />
          </span>
        );
      }

      return null;
    });
  }, [description, query]);

  return <>{content}</>;
};
