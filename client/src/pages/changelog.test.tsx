import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, describe, expect, it, vi } from 'vitest';

const createItems = (count: number, month: number) =>
  Array.from({ length: count }, (_, index) => {
    const number = month * 100 + index + 1;
    return {
      number,
      summary: `Summary ${number}`,
      url: `https://example.com/${number}`,
      mergedAt: `2024-${String(month).padStart(2, '0')}-01T00:00:00Z`,
    };
  });

const mockChangelog = {
  'April 2024': createItems(11, 4),
  'March 2024': createItems(2, 3),
};

vi.mock('../components/layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => (
    <div data-testid='layout'>{children}</div>
  ),
}));

vi.mock('../assets/changelog.json', () => ({
  default: mockChangelog,
}));

const renderChangelog = async () => {
  const { Changelog } = await import('./changelog');

  return render(
    <HelmetProvider>
      <Changelog />
    </HelmetProvider>
  );
};

describe('Changelog page', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders months in descending chronological order', async () => {
    await renderChangelog();

    const headings = screen.getAllByRole('heading', { level: 2 });

    expect(headings.map((heading) => heading.textContent)).toEqual([
      'April 2024',
      'March 2024',
    ]);
  });

  it('limits entries to five by default and expands when requested', async () => {
    const user = userEvent.setup();
    await renderChangelog();

    const aprilSection = screen.getByText('April 2024').closest('div');
    expect(aprilSection).toBeTruthy();

    const withinApril = within(aprilSection as HTMLElement);
    expect(withinApril.getAllByRole('link')).toHaveLength(5);

    const toggleButton = withinApril.getByRole('button', { name: 'Show all' });

    await user.click(toggleButton);
    expect(withinApril.getAllByRole('link')).toHaveLength(11);
    expect(toggleButton).toHaveTextContent('Show less');

    await user.click(toggleButton);
    expect(withinApril.getAllByRole('link')).toHaveLength(5);
    expect(toggleButton).toHaveTextContent('Show all');
  });
});
