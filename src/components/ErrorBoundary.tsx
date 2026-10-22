import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
    void import("@/lib/sentry").then(({ captureException }) => {
      captureException(error, { extra: info as unknown as Record<string, unknown> });
    });
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Reload the page or return to the home page.
            </p>
            {this.state.error && (
              <details className="max-w-xl text-left bg-muted/50 p-3 rounded-lg text-xs font-mono text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">
                  View error details
                </summary>
                <p className="mt-2 text-destructive font-semibold">{this.state.error.toString()}</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[11px]">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <a
                href="/"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Go to Home
              </a>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
