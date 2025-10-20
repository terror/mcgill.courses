import { screen } from '@testing-library/react';

import { renderWithRouter } from '../testing/router-wrapper';
import { CourseDescription } from './course-description';

describe('CourseDescription', () => {
  it('renders text content without markup', () => {
    renderWithRouter(<CourseDescription description='Plain text content.' />);

    expect(screen.getByText('Plain text content.')).toBeInTheDocument();
  });

  it('converts course code anchors into internal links', () => {
    const description =
      'See <a href="/courses/comp202">COMP 202</a> for more information.';

    renderWithRouter(<CourseDescription description={description} />);

    const links = screen.getAllByRole('link', { name: 'COMP 202' });
    const courseLink = links.find(
      (link) => link.getAttribute('href') === '/course/COMP-202'
    );

    expect(courseLink).toBeDefined();
    expect(courseLink).toHaveClass(
      'text-gray-800 hover:underline dark:text-gray-200'
    );
  });

  it('keeps external anchors untouched when not a course code', () => {
    const description =
      'Visit the <a href="https://example.com">course outline</a>.';

    renderWithRouter(<CourseDescription description={description} />);

    const externalLink = screen.getByRole('link', { name: 'course outline' });

    expect(externalLink).toHaveAttribute('href', 'https://example.com');
  });
});
