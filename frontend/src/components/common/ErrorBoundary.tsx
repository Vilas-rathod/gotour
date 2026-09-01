import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-phase crashes so one broken widget cannot blank the whole app.
 * Wrapped around the router and around each independently-failing section.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with a real reporter (Sentry etc.) in production.
    console.error('[GoTour] Unhandled render error', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center"
      >
        <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <AlertTriangle className="size-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold">Something went off the map</h1>
        <p className="text-muted mt-2 text-sm">
          An unexpected error interrupted this page. Try again, and if it keeps happening please
          contact GoTour support.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-w-full overflow-x-auto rounded-lg bg-[var(--surface-muted)] p-3 text-left text-xs">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={this.handleReset} leftIcon={<RotateCcw className="size-4" />}>
            Try again
          </Button>
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }
}
