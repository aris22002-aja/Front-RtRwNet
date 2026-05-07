// ============================================================
// useWebSocket - Bidirectional WebSocket Hook
// For Cloudflare Workers + Durable Objects
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { getAuth, type User } from "firebase/auth";
import { WS_ENDPOINT } from "../api";

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  from?: string;
  user?: { uid: string; email?: string; name?: string };
  timestamp?: number;
  event?: string;
}

export interface UseWebSocketOptions {
  /** WebSocket endpoint URL (defaults to WS_ENDPOINT from api config) */
  url?: string;
  /** Query param name for token (default: "token") */
  tokenParam?: string;
  /** Reconnection interval in ms (default: 3000) */
  reconnectInterval?: number;
  /** Max reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Enable heartbeat (default: true) */
  enableHeartbeat?: boolean;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Firebase user (optional, auto-gets from useAuth if not provided) */
  user?: User | null;
}

export interface UseWebSocketReturn {
  /** Connection status */
  status: "connecting" | "connected" | "disconnected" | "error";
  /** Error message if any */
  error: string | null;
  /** Send a message */
  send: (message: WebSocketMessage) => void;
  /** Send broadcast message */
  broadcast: (data: unknown) => void;
  /** Send direct message to user */
  directMessage: (uid: string, message: unknown) => void;
  /** Trigger event */
  triggerEvent: (event: string, data: unknown) => void;
  /** Manual reconnect */
  reconnect: () => void;
  /** Disconnect manually */
  disconnect: () => void;
  /** Last received message */
  lastMessage: WebSocketMessage | null;
  /** All messages in session */
  messages: WebSocketMessage[];
  /** Clear messages */
  clearMessages: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = WS_ENDPOINT,
    tokenParam = "token",
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    enableHeartbeat = true,
    heartbeatInterval = 30000,
    user,
  } = options;

  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get Firebase ID token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) {
      // Try to get current user from Firebase Auth
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      return currentUser.getIdToken();
    }
    return user.getIdToken();
  }, [user]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      setStatus("connecting");
      setError(null);

      // Get token
      const token = await getToken();
      if (!token) {
        setStatus("error");
        setError("No Firebase token available");
        return;
      }

      // Build WebSocket URL with token
      const wsUrl = new URL(url);
      wsUrl.searchParams.set(tokenParam, token);

      // Create WebSocket
      const ws = new WebSocket(wsUrl.toString());

      // Handle open
      ws.onopen = () => {
        console.log("[WS] Connected");
        setStatus("connected");
        setError(null);
        reconnectCountRef.current = 0;

        // Start heartbeat
        if (enableHeartbeat) {
          heartbeatTimerRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
            }
          }, heartbeatInterval);
        }
      };

      // Handle message
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessages((prev) => [...prev.slice(-99), message]); // Keep last 100

          // Handle pong (heartbeat response)
          if (message.type === "pong") {
            console.log("[WS] Heartbeat acknowledged");
          }
        } catch (err) {
          console.error("[WS] Failed to parse message:", err);
        }
      };

      // Handle close
      ws.onclose = (event) => {
        console.log(`[WS] Disconnected: ${event.code} - ${event.reason}`);
        setStatus("disconnected");
        clearHeartbeat();

        // Auto-reconnect
        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectTimerRef.current = setTimeout(() => {
            console.log(`[WS] Reconnecting... (${reconnectCountRef.current + 1}/${maxReconnectAttempts})`);
            reconnectCountRef.current++;
            connect();
          }, reconnectInterval);
        } else {
          setError("Max reconnection attempts reached");
        }
      };

      // Handle error
      ws.onerror = (event) => {
        console.error("[WS] Error:", event);
        setStatus("error");
        setError("WebSocket connection error");
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("[WS] Connection failed:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [url, tokenParam, getToken, reconnectInterval, maxReconnectAttempts, enableHeartbeat, heartbeatInterval]);

  // Send message
  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...message, timestamp: Date.now() }));
    } else {
      console.warn("[WS] Cannot send: not connected");
    }
  }, []);

  // Broadcast message
  const broadcast = useCallback((data: unknown) => {
    send({ type: "broadcast", data, timestamp: Date.now() });
  }, [send]);

  // Direct message to user
  const directMessage = useCallback((uid: string, message: unknown) => {
    send({ type: "direct", data: { uid, message }, timestamp: Date.now() });
  }, [send]);

  // Trigger event
  const triggerEvent = useCallback((event: string, data: unknown) => {
    send({ type: "event", event, data, timestamp: Date.now() });
  }, [send]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    connect();
  }, [connect]);

  // Manual disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  // Clear heartbeat timer
  const clearHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      clearHeartbeat();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [connect]);

  return {
    status,
    error,
    send,
    broadcast,
    directMessage,
    triggerEvent,
    reconnect,
    disconnect,
    lastMessage,
    messages,
    clearMessages,
  };
}

// ============================================================
// useAuthWebSocket - Auto-get user from Firebase
// ============================================================
import { useAuth } from "../contexts/AuthContext";

export function useAuthWebSocket(options: Omit<UseWebSocketOptions, "url" | "user"> = {}): UseWebSocketReturn {
  const { user } = useAuth();
  return useWebSocket({ ...options, url: WS_ENDPOINT, user });
}
