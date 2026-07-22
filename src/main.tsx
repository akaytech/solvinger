import { StrictMode, Suspense, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.tsx'
import { initAuthListener } from './firebaseCore'

// Firebase oturumunu store ile senkronlayan tek listener'ı başlat.
// Böylece açılışta gerçek oturum durumu doğrulanır; token yenileme veya
// sunucu tarafı oturum iptali otomatik olarak arayüze yansır.
initAuthListener();

// Asenkron Sentry başlatma (Ana render'ı bloke etmemesi için gecikmeli)
setTimeout(() => {
  import('@sentry/react').then((Sentry) => {
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
  }).catch(console.error);
}, 2000); 

class ErrorBoundary extends Component<{children: ReactNode, fallback: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) {
    import('@sentry/react').then(Sentry => Sentry.captureException(error, { contexts: { react: { componentStack: info?.componentStack } } })).catch(console.error);
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen p-4 text-center"><h1>Bir şeyler ters gitti. Ekibimiz bilgilendirildi! Lütfen sayfayı yenileyin.</h1></div>}>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
        <HashRouter>
          <App />
        </HashRouter>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
