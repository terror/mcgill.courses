import { render, screen } from '@testing-library/react';

import { Highlight } from './highlight';

describe('Highlight', () => {
  it('renders text without modification when no query is provided', () => {
    render(<Highlight text='Hello World' />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(document.querySelector('.underline')).toBeNull();
  });

  it('underlines matched text irrespective of case', () => {
    render(<Highlight text='Hello World' query='world' />);

    const highlightedSegment = document.querySelector('.underline');

    expect(highlightedSegment).not.toBeNull();
    expect(highlightedSegment).toHaveTextContent('World');
  });

  it('ignores empty queries', () => {
    render(<Highlight text='Sample Text' query='   ' />);

    expect(screen.getByText('Sample Text')).toBeInTheDocument();
    expect(document.querySelector('.underline')).toBeNull();
  });
});
