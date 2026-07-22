import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './index.css'
import './i18n'
import App from './App.tsx'

Sentry.init({
  dsn: "https://0942b4d0d1d1208b089ff3528ea7f024@o4511775904366592.ingest.de.sentry.io/4511775925862480",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen p-4 text-center"><h1>Bir şeyler ters gitti. Ekibimiz bilgilendirildi! Lütfen sayfayı yenileyin.</h1></div>}>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
        <HashRouter>
          <App />
        </HashRouter>
      </Suspense>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
