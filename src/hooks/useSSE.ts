// ============================================================
// useSSE Hook — Real-time Server-Sent Events (SSE)
// Alternative to WebSocket when Workers don't support WS
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getIdToken } from 'firebase/auth';

interface SSEOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
}

interface UseSSEReturn {
  send: (data: unknown) => void; // Note: SSE is one-way, this is for API calls
  disconnect: () => void;
  reconnect: () => void;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// API helper that includes auth token
async function apiCall(endpoint: string, method: string = 'GET', body?: unknown) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) throw new Error('Not authenticated');
  
  const token = await getIdToken(user, true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

export const useSSE = (options: SSEOptions): UseSSEReturn => {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 5000,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');

      // Get Firebase ID Token
      const user = getAuth().currentUser;
      if (!user) {
        console.warn('[SSE] No authenticated user');
        setStatus('disconnected');
        return;
      }

      let token = '';
      try {
        token = await getIdToken(user, true);
      } catch {
        token = '';
      }

      // Security: Use Authorization header via cookie-based auth
      // SSE with Bearer token requires a special flow: set cookie then connect
      // Since EventSource doesn't support custom headers, we use a secure cookie approach
      const sseUrl = `${url}`;
      
      // Set auth cookie via a HEAD request with Authorization
      if (token) {
        try {
          await fetch(sseUrl, {
            method: 'HEAD',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
        } catch {
          // Ignore cookie setting errors - SSE will still try to connect
        }
      }

      const eventSource = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setStatus('connected');
        if (import.meta.env.DEV) console.log('[SSE] Connected:', sseUrl);
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      };

      eventSource.onerror = (error) => {
        setStatus('error');
        if (import.meta.env.DEV) console.error('[SSE] Error:', error);
        onError?.(error);

        eventSource.close();

        // Auto reconnect
        reconnectRef.current = setTimeout(() => {
          eventSourceRef.current = null;
          connect();
        }, reconnectInterval);

        onClose?.();
      };
    } catch (error) {
      setStatus('error');
      if (import.meta.env.DEV) console.error('[SSE] Connection failed:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  // For SSE, we use API calls to send data (not WebSocket send)
  const send = useCallback(async (data: unknown) => {
    // This would typically send to a REST endpoint
    // Example: await apiCall('/api/push', 'POST', data);
    console.warn('[SSE] send() called - use API for sending data');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { send, disconnect, reconnect, status };
};

// Export apiCall for external use
export { apiCall };
