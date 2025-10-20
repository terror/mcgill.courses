import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { MemoryRouterProps } from 'react-router-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

type WrapperProps = {
  children: ReactNode;
};

export const RouterWrapper = ({ children }: WrapperProps) => (
  <BrowserRouter future={routerFutureConfig}>{children}</BrowserRouter>
);

export const renderWithRouter = (ui: ReactElement) =>
  render(ui, { wrapper: RouterWrapper });

type MemoryWrapperOptions = Pick<
  MemoryRouterProps,
  'initialEntries' | 'initialIndex'
>;

export const createMemoryRouterWrapper = (options?: MemoryWrapperOptions) => {
  return ({ children }: WrapperProps) => (
    <MemoryRouter future={routerFutureConfig} {...options}>
      {children}
    </MemoryRouter>
  );
};

export const renderWithMemoryRouter = (
  ui: ReactElement,
  options?: MemoryWrapperOptions
) =>
  render(ui, {
    wrapper: createMemoryRouterWrapper(options),
  });
