import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import type { Review } from '../lib/types';
import { CourseReview } from './course-review';

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => null,
}));

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    {children}
  </BrowserRouter>
);

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: RouterWrapper });
};

const baseReview: Review = {
  content: 'Short content',
  courseId: 'COMP202',
  difficulty: 3,
  instructors: ['Ada Lovelace'],
  likes: 5,
  rating: 4,
  timestamp: '1700000000000',
  userId: 'user-1',
};

describe('CourseReview', () => {
  it('applies anchor id to wrapper when provided', () => {
    const { container } = renderWithRouter(
      <CourseReview
        anchorId='desktop-review-anchor'
        canModify={false}
        handleDelete={vi.fn()}
        openEditReview={vi.fn()}
        review={baseReview}
      />
    );

    expect(
      container.querySelector('#desktop-review-anchor')
    ).toBeInTheDocument();
  });

  it('expands truncated content when "Show more" is clicked', async () => {
    const longContent = 'a'.repeat(350);

    renderWithRouter(
      <CourseReview
        canModify={false}
        handleDelete={vi.fn()}
        openEditReview={vi.fn()}
        review={{ ...baseReview, content: longContent }}
      />
    );

    expect(
      screen.getByRole('button', { name: /show more/i })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /show more/i }));

    expect(
      screen.queryByRole('button', { name: /show more/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(longContent)).toBeInTheDocument();
  });
});
