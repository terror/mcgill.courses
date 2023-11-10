import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import App from './App';
import './index.css';
import { ErrorPage } from './pages/ErrorPage';
import AuthProvider from './providers/AuthProvider';
import { DarkModeProvider } from './providers/DarkModeProvider';

const Root = () => {
  // When an error occurs, we want all of the state in the app
  // to reset to prevent further errors
  //
  // One way to do this is just to assign a different key to <App />,
  // which will make React treat it as a different component and
  // rerender it from scratch, with the initial state.
  const [key, setKey] = useState(0);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <DarkModeProvider>
          <ErrorBoundary
            FallbackComponent={ErrorPage}
            onReset={() => setKey(key + 1)}
          >
            <AuthProvider>
              <Toaster richColors />
              <App key={key} />
            </AuthProvider>
          </ErrorBoundary>
        </DarkModeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Root />
);
