import { highlight } from '../lib/dom-utils';

export const Highlight = ({
  text,
  query,
  className,
}: {
  text: string;
  query?: string;
  className?: string;
}) => {
  return <span className={className}>{highlight(text, query)}</span>;
};
