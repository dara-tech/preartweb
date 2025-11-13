import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal } from 'lucide-react';
import { toast } from 'sonner';
import io from 'socket.io-client';

// Helper function to check if current user is a viewer
const isViewerUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Decode JWT token (simple base64 decode of payload)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if user role is 'viewer'
    return decodedPayload.role === 'viewer';
  } catch (error) {
    // If there's any error decoding, allow toasts to show
    return false;
  }
};

const RealTimeLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [socket, setSocket] = useState(null);
  const scrollAreaRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    let newSocket = null;
    let connectionTimeout = null;

    const connectSocket = () => {
      try {
        // Use environment variable or fallback to current host
        const wsUrl = import.meta.env.VITE_WS_URL || 
                     (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + 
                     window.location.host;
        
        newSocket = io(wsUrl, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
          autoConnect: true
        });

        newSocket.on('connect', () => {
          setIsConnected(true);
          console.log('Connected to analytics WebSocket');
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
        });

        newSocket.on('disconnect', (reason) => {
          setIsConnected(false);
          console.log('Disconnected from analytics WebSocket:', reason);
        });

        newSocket.on('connect_error', (error) => {
          setIsConnected(false);
          console.error('WebSocket connection error:', error);
        });

        newSocket.on('analytics-log', (logData) => {
          setLogs(prev => [...prev, {
            id: Date.now() + Math.random(),
            timestamp: logData.timestamp,
            level: logData.level,
            message: logData.message,
            data: logData.data
          }]);
        });

        newSocket.on('analytics-complete', (data) => {
          setLogs(prev => [...prev, {
            id: Date.now() + Math.random(),
            timestamp: data.timestamp,
            level: 'success',
            message: `🎉 Analytics completed successfully!`,
            data: data.results
          }]);
          setIsRunning(false);
          // Don't show toasts for viewer users
          if (!isViewerUser()) {
            toast.success('Analytics completed!');
          }
        });

        newSocket.on('analytics-error', (data) => {
          setLogs(prev => [...prev, {
            id: Date.now() + Math.random(),
            timestamp: data.timestamp,
            level: 'error',
            message: `❌ Analytics failed: ${data.error}`,
            data: { error: data.error }
          }]);
          setIsRunning(false);
          // Don't show toasts for viewer users
          if (!isViewerUser()) {
            toast.error('Analytics failed!');
          }
        });

        setSocket(newSocket);

        // Set a timeout to show connection status
        connectionTimeout = setTimeout(() => {
          if (!newSocket.connected) {
            console.warn('WebSocket connection timeout');
          }
        }, 5000);

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    // Delay connection to avoid issues during hot reload
    const connectDelay = setTimeout(connectSocket, 100);

    return () => {
      if (connectDelay) clearTimeout(connectDelay);
      if (connectionTimeout) clearTimeout(connectionTimeout);
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

  const getLogColor = (level) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  const clearLogs = () => {
    setLogs([]);
    // Don't show toasts for viewer users
    if (!isViewerUser()) {
      toast.success('Logs cleared');
    }
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      // Don't show toasts for viewer users
      if (!isViewerUser()) {
        toast.success('Logs copied to clipboard');
      }
    });
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="h-96 bg-black border border-gray-800 rounded-none overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-none"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-none"></div>
            <div className="w-3 h-3 bg-green-500 rounded-none"></div>
          </div>
          <span className="text-gray-300 text-sm font-mono">analytics@:~$</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-none ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-400 text-xs font-mono">
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
          {isRunning && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-none animate-pulse"></div>
              <span className="text-green-400 text-xs font-mono">RUNNING</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Controls */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
        <button
          onClick={clearLogs}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-mono rounded-none transition-colors"
        >
          clear
        </button>
        <button
          onClick={copyLogs}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono rounded-none transition-colors"
        >
          copy
        </button>
        <button
          onClick={downloadLogs}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-mono rounded-none transition-colors"
        >
          save
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            id="autoScroll"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-3 h-3 text-green-500 bg-gray-700 border-gray-600 rounded-none focus:ring-green-500"
          />
          <label htmlFor="autoScroll" className="text-gray-400 text-xs font-mono">
            auto-scroll
          </label>
        </div>
      </div>

      {/* Terminal Body */}
      <ScrollArea ref={scrollAreaRef} className="h-64 p-4 bg-black">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-green-400 font-mono">Waiting for analytics logs...</p>
            <p className="text-gray-500 text-sm font-mono mt-1">Start analytics to see real-time output</p>
            <div className="flex items-center justify-center mt-4">
            
              <span className="w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
            </div>
          </div>
        ) : (
            <div className="space-y-0">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 py-0.5 text-sm font-mono"
                >
                  <span className="text-gray-500 text-xs mt-0.5 select-none">
                    [{formatTimestamp(log.timestamp)}]
                  </span>
                  <span className="text-green-400 text-xs mt-0.5 select-none">
                    {log.level === 'success' && '✓'}
                    {log.level === 'error' && '✗'}
                    {log.level === 'warning' && '⚠'}
                    {log.level === 'info' && 'ℹ'}
                  </span>
                  <span className={`flex-1 ${getLogColor(log.level)}`}>
                    {log.message}
                  </span>
                  {log.data && Object.keys(log.data).length > 0 && (
                    <details className="text-xs text-gray-400">
                      <summary className="cursor-pointer hover:text-green-400 transition-colors">
                        [details]
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-900 border border-gray-700 rounded-none text-xs overflow-x-auto text-gray-300">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 py-0.5 text-sm font-mono">
                  <span className="text-gray-500 text-xs">[running]</span>
                  <span className="text-green-400 text-xs">ℹ</span>
                  <span className="text-gray-300">Processing analytics...</span>
                  <span className="w-2 h-4 bg-green-400 animate-pulse"></span>
                </div>
              )}
            </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default RealTimeLogViewer;
