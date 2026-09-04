import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in SecondMedic Portal:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.pathname);
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Portal Recovery Mode</h2>
              <p className="text-sm text-slate-400 mt-2">
                A component encountered an unexpected render issue. Don&apos;t worry, your data and configurations are preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-rose-400 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-900/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Portal
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    window.location.href = window.location.pathname;
                  } catch {
                    window.location.reload();
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset View
              </button>
            </div>

            <p className="text-xs text-slate-500">
              SecondMedic Enterprise Diagnostics Architecture
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
