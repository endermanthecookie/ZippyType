
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import App from './App';

const Fallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-[2rem] p-8 border border-rose-500/20 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 text-rose-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <h2 className="text-xl font-black uppercase tracking-tighter">Something went wrong</h2>
        </div>
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-auto max-h-48">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{error.message}</pre>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
