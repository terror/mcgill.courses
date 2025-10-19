import escapeRegExp from 'lodash/escapeRegExp';
import { Link } from 'react-router-dom';

import { isValidCourseCode } from '../lib/utils';

export const parseCourseDescription = (desc: string, query?: string) => {
  const doc = new DOMParser().parseFromString(desc.trim(), 'text/html');

  const nodes = Array.from(doc.body.childNodes).map((node, index) => {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        const elem = node as HTMLElement;

        const content = query
          ? highlight(elem.innerText, query)
          : elem.innerText;

        if (node.nodeName === 'A') {
          const href = elem.getAttribute('href');

          if (!href) return content;

          if (!isValidCourseCode(elem.innerText))
            return <a href={href}>{content}</a>;

          const courseCode = elem.innerText.replace(' ', '-');

          return (
            <Link
              key={index}
              to={`/course/${courseCode}`}
              className='text-gray-800 hover:underline dark:text-gray-200'
            >
              {content}
            </Link>
          );
        }

        return <span key={index}>{content}</span>;
      }
      case Node.TEXT_NODE: {
        const textNode = node as Text;
        const content = query
          ? highlight(textNode.textContent ?? '', query)
          : textNode.textContent;

        return <span key={index}>{content}</span>;
      }
      case Node.COMMENT_NODE:
        return null;
    }
  });

  return nodes;
};

export const highlight = (text: string, query?: string) =>
  text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi')).map((part, i) => (
    <span
      key={i}
      className={
        part.toLowerCase().trim() === query?.toLowerCase().trim()
          ? 'underline'
          : ''
      }
    >
      {part}
    </span>
  ));
