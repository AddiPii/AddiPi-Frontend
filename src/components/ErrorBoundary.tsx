import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-2xl border border-destructive/20 mb-6">
              <AlertTriangle className="text-destructive" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Coś poszło nie tak</h2>
            <p className="text-muted-foreground mb-6">
              Wystąpił nieoczekiwany błąd. Odśwież stronę lub skontaktuj się z administratorem.
            </p>
            {this.state.error && (
              <details className="text-left bg-secondary/50 rounded-lg border border-border p-4 mb-6">
                <summary className="cursor-pointer text-sm font-medium text-foreground mb-2">
                  Szczegóły błędu
                </summary>
                <pre className="text-xs text-destructive overflow-auto font-mono mt-2">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={18} />
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
