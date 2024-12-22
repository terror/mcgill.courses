import { escapeRegExp } from 'lodash';

export const Highlight = ({
  text,
  query,
  className,
}: {
  text: string;
  query?: string;
  className?: string;
}) => {
  return (
    <span className={className}>
      {text
        .split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
        .map((part, i) => (
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
        ))}
    </span>
  );
};
