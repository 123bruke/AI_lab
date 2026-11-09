import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logErrorToBackend } from '../services/telemetry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MOSEB LAB Uncaught error:', error, errorInfo);
    try {
      logErrorToBackend({
        error_type: error.name || 'ReactComponentCrash',
        message: error.message || 'Component render crash',
        component: 'ErrorBoundary',
        stack_trace: `${error.stack || ''}\nComponentStack: ${errorInfo.componentStack || ''}`,
        severity: 'CRITICAL',
      });
    } catch { }
  }

  private handleClearCacheAndRestart = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch { }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6 font-mono text-center">
          <div className="max-w-md p-8 rounded-3xl border border-white/15 bg-neutral-900 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Laboratory Recovery Console
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A temporary initialization condition was caught. Click below to refresh your virtual session.
            </p>
            <div className="w-full text-[11px] p-3 rounded-xl bg-black text-rose-300 font-mono text-left overflow-auto max-h-28 border border-white/10">
              {this.state.error?.message || 'Initialization anomaly detected.'}
            </div>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-lg shadow-white/10"
              >
                Reload Lab
              </button>
              <button
                onClick={this.handleClearCacheAndRestart}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 border border-white/15 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
