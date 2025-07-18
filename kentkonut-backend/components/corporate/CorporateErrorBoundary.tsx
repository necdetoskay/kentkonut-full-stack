// Corporate Module Error Boundary Component
// Handles errors gracefully and provides fallback UI

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class CorporateErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Corporate Module Error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    // Show user-friendly toast
    toast.error('Bir hata oluştu. Sayfa yenileniyor...');
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // TODO: Implement error logging service (e.g., Sentry, LogRocket)
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        module: 'Corporate',
      };

      // Example: Send to monitoring service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });

      console.error('Error Report:', errorReport);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">Bir Hata Oluştu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>Kurumsal modülde beklenmeyen bir hata meydana geldi.</p>
                <p className="text-sm mt-2">
                  Lütfen sayfayı yenileyin veya ana sayfaya dönün.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <summary className="cursor-pointer font-medium">
                    Hata Detayları (Geliştirici Modu)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Hata:</strong>
                      <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sayfayı Yenile
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Sorun devam ederse, sistem yöneticisi ile iletişime geçin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <CorporateErrorBoundary fallback={fallback}>
      <Component {...props} />
    </CorporateErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Custom fallback components for different scenarios
export const MinimalErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
    <div className="flex items-center gap-2 text-destructive mb-2">
      <Bug className="h-4 w-4" />
      <span className="font-medium">Bir hata oluştu</span>
    </div>
    <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
    <Button onClick={retry} size="sm" variant="outline">
      <RefreshCw className="mr-2 h-4 w-4" />
      Tekrar Dene
    </Button>
  </div>
);

export const TableErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className="rounded-md border p-8 text-center">
    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
    <h3 className="font-medium mb-2">Veri Yüklenirken Hata Oluştu</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Liste görüntülenirken bir sorun meydana geldi.
    </p>
    <Button onClick={retry} variant="outline">
      <RefreshCw className="mr-2 h-4 w-4" />
      Yeniden Yükle
    </Button>
  </div>
);

export const FormErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <Card className="border-destructive/20">
    <CardHeader>
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <CardTitle className="text-lg">Form Hatası</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">
        Form yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <Button onClick={retry} className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Formu Yeniden Yükle
      </Button>
    </CardContent>
  </Card>
);

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Show user-friendly message
    toast.error(
      error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
    );

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service
    }
  }, []);

  return { handleError };
};

export default CorporateErrorBoundary;
