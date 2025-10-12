import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

import type { Review } from '../lib/types';
import { CourseReview, ReviewAttachment } from './course-review';

const toastPromiseMock = vi.hoisted(() =>
  vi.fn((promise: Promise<unknown>) => promise)
);
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => null,
}));

vi.mock('sonner', () => ({
  toast: {
    promise: toastPromiseMock,
    error: toastErrorMock,
    success: vi.fn(),
  },
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

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard'
);

let writeTextMock: Mock;

beforeAll(() => {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    writeTextMock = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockImplementation(() => Promise.resolve());
  } else {
    const mockFn = vi.fn<[text: string], Promise<void>>(() =>
      Promise.resolve()
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockFn,
      },
    });
    writeTextMock = mockFn as unknown as Mock;
  }
});

afterAll(() => {
  if (
    'mockRestore' in writeTextMock &&
    typeof writeTextMock.mockRestore === 'function'
  ) {
    writeTextMock.mockRestore();
  }

  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
  } else if (
    !(
      navigator.clipboard && typeof navigator.clipboard.writeText === 'function'
    )
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).clipboard;
  }
});

afterEach(() => {
  writeTextMock.mockReset();
  toastPromiseMock.mockClear();
  toastErrorMock.mockClear();

  writeTextMock.mockImplementation(() => Promise.resolve());
});

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

  it('renders scroll attachment when requested', () => {
    renderWithRouter(
      <CourseReview
        canModify={false}
        handleDelete={vi.fn()}
        openEditReview={vi.fn()}
        review={baseReview}
        attachment={ReviewAttachment.ScrollButton}
      />
    );

    expect(
      screen.getByRole('link', { name: /scroll to this review/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /copy review link/i,
      })
    ).not.toBeInTheDocument();
  });

  it('copies review link and shows success indicator when copy attachment is used', async () => {
    writeTextMock.mockResolvedValueOnce();

    const { container } = renderWithRouter(
      <CourseReview
        canModify={false}
        handleDelete={vi.fn()}
        openEditReview={vi.fn()}
        review={baseReview}
        attachment={ReviewAttachment.CopyButton}
      />
    );

    const button = screen.getByRole('button', {
      name: /copy review link for comp202/i,
    });

    const [copyIconEl, checkIconEl] = Array.from(
      button.querySelectorAll('svg')
    ) as HTMLElement[];

    expect(copyIconEl).toBeDefined();
    expect(checkIconEl).toBeDefined();

    expect(copyIconEl).toHaveClass('opacity-100');
    expect(checkIconEl).toHaveClass('opacity-0');

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(toastErrorMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(toastPromiseMock).toHaveBeenCalled();
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    const expectedAnchor = `review-${baseReview.courseId}-${baseReview.userId}-${baseReview.timestamp}`;
    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining(`scrollToReview=${expectedAnchor}`)
    );
  });
});
