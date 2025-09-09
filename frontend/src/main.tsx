import React from 'react';
import ReactDOM from 'react-dom/client';

import { ErrorBoundary } from '@/ErrorBoundary';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary
      errorHandler={error => (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong:</h2>
          <pre>{error?.message ?? 'An unknown error occurred.'}</pre>
        </div>
      )}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
