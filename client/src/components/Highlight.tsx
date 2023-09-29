import _ from 'lodash';
import { twMerge } from 'tailwind-merge';

export const Highlight = ({
  text,
  query,
  className,
}: {
  text: string;
  query?: string;
  className?: string;
}) => {
  const textWithMatchHighlight = text
    .split(new RegExp(`(${_.escapeRegExp(query)})`, 'gi'))
    .map((part, i) => (
      <span
        key={i}
        className={twMerge(
          className,
          part.toLowerCase().trim() === query?.toLowerCase().trim()
            ? 'underline'
            : ''
        )}
      >
        {part}
      </span>
    ));

  return <span className={className}>{textWithMatchHighlight}</span>;
};
