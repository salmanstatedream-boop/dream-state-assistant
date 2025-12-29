import React from 'react';
import type { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error) {
    // Log error for debugging (in development only)
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-lg shadow-lg border border-destructive/20 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-muted p-3 rounded text-xs font-mono text-muted-foreground overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={this.handleReset} className="flex-1">
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
