import React, { Component, ErrorInfo, ReactNode } from 'react';

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
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6 font-mono text-center">
          <div className="max-w-md p-6 rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <h2 className="text-base font-bold text-rose-400 mb-2">MOSEB LAB Diagnostics</h2>
            <p className="text-xs text-neutral-400 mb-4">
              A temporary initialization error was intercepted. Click below to reload the 4D environment.
            </p>
            <div className="text-[11px] p-3 rounded-lg bg-black text-neutral-300 font-mono mb-4 text-left overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="py-2 px-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 cursor-pointer"
            >
              Restart Laboratory
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
