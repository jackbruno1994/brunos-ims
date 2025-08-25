import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  restaurantId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_change' | 'system' | 'user_action';
}

interface AuditFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string[];
  category?: string[];
  restaurantId?: string;
  search?: string;
}

interface UseAuditWebSocketOptions {
  url?: string;
  filters?: AuditFilter;
  onNewLog?: (log: AuditLog) => void;
  onStatsUpdate?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useAuditWebSocket = (options: UseAuditWebSocketOptions = {}) => {
  const {
    url = 'http://localhost:3001',
    filters,
    onNewLog,
    onStatsUpdate,
    onConnect,
    onDisconnect
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newLogsCount, setNewLogsCount] = useState(0);

  useEffect(() => {
    // Create socket connection
    const socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to audit WebSocket');
      setIsConnected(true);
      setConnectionError(null);
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from audit WebSocket:', reason);
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Audit-specific events
    socket.on('audit-connected', (data) => {
      console.log('🔴 Audit system connected:', data);
    });

    socket.on('audit-log-created', (event) => {
      console.log('🔴 New audit log received:', event.data);
      setLastUpdate(new Date(event.timestamp));
      setNewLogsCount(prev => prev + 1);
      
      if (onNewLog) {
        // Convert timestamp string to Date object for consistency
        const auditLog: AuditLog = {
          ...event.data,
          timestamp: event.data.timestamp
        };
        onNewLog(auditLog);
      }
    });

    socket.on('audit-stats-update', (event) => {
      console.log('🔴 Audit stats updated:', event);
      onStatsUpdate?.();
    });

    // Subscribe to filters if provided
    if (filters) {
      socket.emit('subscribe-filters', filters);
    }

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [url, onConnect, onDisconnect, onNewLog, onStatsUpdate]);

  // Update filter subscription when filters change
  useEffect(() => {
    if (socketRef.current && isConnected && filters) {
      socketRef.current.emit('subscribe-filters', filters);
    }
  }, [filters, isConnected]);

  const resetNewLogsCount = () => {
    setNewLogsCount(0);
  };

  const sendTestLog = () => {
    if (socketRef.current && isConnected) {
      const testLog = {
        userId: 'test_user',
        userName: 'Test User',
        action: 'test_action',
        resource: 'test_resource',
        resourceId: 'test_123',
        details: {
          description: 'This is a test audit log',
          test: true
        },
        severity: 'medium' as const,
        category: 'user_action' as const
      };

      // Send to backend to create and broadcast
      fetch('/api/audit/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testLog),
      }).then(() => {
        console.log('🔴 Test audit log sent');
      }).catch(error => {
        console.error('Failed to send test log:', error);
      });
    }
  };

  return {
    isConnected,
    connectionError,
    lastUpdate,
    newLogsCount,
    resetNewLogsCount,
    sendTestLog,
    socket: socketRef.current
  };
};