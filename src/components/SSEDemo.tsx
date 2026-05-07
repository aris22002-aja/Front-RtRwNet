// ============================================================
// SSE Demo Component — Testing Real-time Communication
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSSE } from '../hooks/useSSE';

const SSE_DEMO_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://backend-worker-staging.aris-22002-priyanto.workers.dev'}/api/sse`;

interface SSEMessage {
  type: string;
  userId?: string;
  email?: string;
  data?: unknown;
  timestamp: number;
}

export default function SSEDemo() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [lastActivity, setLastActivity] = useState<string>('');

  const { status, disconnect, reconnect } = useSSE({
    url: SSE_DEMO_URL,
    reconnectInterval: 3000,
    onMessage: (data) => {
      const message = data as SSEMessage;
      setMessages(prev => [...prev.slice(-49), message]);
      setLastActivity(new Date(message.timestamp).toLocaleTimeString());
    },
    onOpen: () => {
      console.log('[SSE Demo] Connected!');
    },
    onError: (error) => {
      console.error('[SSE Demo] Error:', error);
    },
  });

  const handleSendTest = async () => {
    // For SSE, we send data via REST API
    const token = await user?.getIdToken();
    if (!token) return;

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test-broadcast`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Test from SSE Demo' }),
    });

    console.log('Test broadcast response:', response.status);
  };

  const clearMessages = () => setMessages([]);

  return (
    <div className="sse-demo">
      <div className="sse-header">
        <h3>🔴 Real-time SSE Demo</h3>
        <div className="sse-status">
          Status: 
          <span className={`status-badge status-${status}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="sse-controls">
        <button onClick={reconnect} disabled={status === 'connected'}>
          Reconnect
        </button>
        <button onClick={disconnect} disabled={status === 'disconnected'}>
          Disconnect
        </button>
        <button onClick={handleSendTest}>
          Send Test Event
        </button>
        <button onClick={clearMessages}>
          Clear
        </button>
      </div>

      <div className="sse-messages">
        <div className="sse-messages-header">
          <span>Messages ({messages.length})</span>
          <span>Last activity: {lastActivity || 'None'}</span>
        </div>
        <div className="sse-messages-list">
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet. Connect and wait for real-time updates.</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="sse-message">
                <span className="msg-type">{msg.type}</span>
                <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <pre>{JSON.stringify(msg.data || msg, null, 2)}</pre>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .sse-demo {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          backdrop-filter: blur(10px);
        }
        .sse-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .sse-header h3 {
          margin: 0;
          color: #fff;
        }
        .sse-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-connected {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }
        .status-connecting {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }
        .status-disconnected {
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
        }
        .status-error {
          background: rgba(255, 107, 107, 0.3);
          color: #ff4444;
        }
        .sse-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .sse-controls button {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .sse-controls button:nth-child(1) {
          background: #4a9eff;
          color: white;
        }
        .sse-controls button:nth-child(2) {
          background: #ff6b6b;
          color: white;
        }
        .sse-controls button:nth-child(3) {
          background: #00ff88;
          color: #000;
        }
        .sse-controls button:nth-child(4) {
          background: rgba(255, 255, 255, 0.1);
          color: #888;
        }
        .sse-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .sse-messages-header {
          display: flex;
          justify-content: space-between;
          color: #888;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .sse-messages-list {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          max-height: 300px;
          overflow-y: auto;
        }
        .sse-message {
          padding: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 4px;
        }
        .sse-message:last-child {
          border-bottom: none;
        }
        .sse-message .msg-type {
          display: inline-block;
          background: #4a9eff;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          margin-right: 8px;
        }
        .sse-message .msg-time {
          color: #666;
          font-size: 10px;
        }
        .sse-message pre {
          margin: 4px 0 0;
          font-size: 11px;
          color: #aaa;
          white-space: pre-wrap;
        }
        .empty-state {
          text-align: center;
          color: #666;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}
