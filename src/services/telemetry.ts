/**
 * Frontend Error Telemetry Service for MOSEB Student Lab.
 * Intercepts UI and runtime exceptions and streams them to the backend Python
 * logging system, persisting them into a dedicated SQLite error database (error_logs.db).
 */

const API_BASE = 'http://127.0.0.1:8000';

export interface FrontendErrorPayload {
  error_type: string;
  message: string;
  component?: string;
  stack_trace?: string;
  url?: string;
  user_agent?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export const logErrorToBackend = async (payload: FrontendErrorPayload): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/telemetry/log-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error_type: payload.error_type || 'ClientRuntimeError',
        message: payload.message || 'Unknown frontend error',
        component: payload.component || 'ReactUI',
        stack_trace: payload.stack_trace || (new Error().stack || ''),
        url: typeof window !== 'undefined' ? window.location.href : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        severity: payload.severity || 'ERROR',
      }),
    });

    if (!response.ok) {
      console.warn('[Telemetry] Error response from backend error logger:', response.status);
    }
  } catch (err) {
    // Fail silently in telemetry to prevent recursive crash loops
    console.warn('[Telemetry] Backend logger unreachable, logged to browser console:', err);
  }
};

/**
 * Initialize global window error handlers once at app launch.
 */
export const initGlobalErrorHandling = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    logErrorToBackend({
      error_type: event.error?.name || 'UncaughtError',
      message: event.message || 'Uncaught JavaScript error',
      component: 'WindowGlobal',
      stack_trace: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      severity: 'ERROR',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logErrorToBackend({
      error_type: 'UnhandledPromiseRejection',
      message: typeof reason === 'string' ? reason : reason?.message || 'Promise rejection',
      component: 'PromiseHandler',
      stack_trace: reason?.stack || '',
      severity: 'ERROR',
    });
  });

  console.log('[Telemetry] MOSEB Lab Error Telemetry initialized.');
};
