import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry initialization - only in production or when DSN is provided
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn && sentryDsn !== 'YOUR_SENTRY_DSN' && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    environment: import.meta.env.MODE,
  });
} else {
  console.log('Sentry disabled in development mode or no valid DSN provided');
}

createRoot(document.getElementById("root")!).render(<App />);
