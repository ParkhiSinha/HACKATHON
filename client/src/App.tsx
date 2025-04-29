import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import AuthScreen from "@/components/AuthScreen";
import Login from "@/pages/auth/Login";
import { useUser } from "@/lib/auth";

// User pages
import UserDashboard from "@/pages/user/Dashboard";
import ReportCrime from "@/pages/user/ReportCrime";
import MyReports from "@/pages/user/MyReports";

// Police pages
import PoliceDashboard from "@/pages/police/Dashboard";
import Reports from "@/pages/police/Reports";
import CrimeMap from "@/pages/police/CrimeMap";
import Teams from "@/pages/police/Teams";

// WebSocket connection for real-time updates
function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create a reference to track the WebSocket attempts
    let reconnectInterval: ReturnType<typeof setInterval> | null = null;
    let ws: WebSocket | null = null;
    let unmounted = false;
    
    const connectWebSocket = () => {
      try {
        // If already connected or unmounted, don't try to reconnect
        if (connected || unmounted) return;
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;
        
        console.log(`Connecting to WebSocket at ${wsUrl}`);
        
        // Create a new WebSocket instance
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connection established');
          setConnected(true);
          
          // Clear any reconnection attempts
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle specific message types
            if (data.type === 'EMERGENCY_SIGNAL' || data.type === 'EMERGENCY_RESOLVED') {
              queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed');
          setConnected(false);
          
          // Only try to reconnect if the component is still mounted
          if (!unmounted && !reconnectInterval) {
            reconnectInterval = setInterval(() => {
              if (!connected && !unmounted) {
                console.log('Attempting to reconnect WebSocket...');
                connectWebSocket();
              } else if (connected || unmounted) {
                clearInterval(reconnectInterval!);
                reconnectInterval = null;
              }
            }, 5000);
          }
        };
        
        setSocket(ws);
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnected(false);
      }
    };

    // Initial connection
    connectWebSocket();

    // Clean up on unmount
    return () => {
      unmounted = true;
      
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
      
      if (ws) {
        try {
          // First remove all event listeners to prevent reacting to close event
          ws.onclose = null;
          ws.onerror = null;
          ws.onmessage = null;
          ws.onopen = null;
          
          // Then close the connection
          ws.close();
        } catch (e) {
          console.error('Error closing WebSocket during cleanup:', e);
        }
      }
      
      setConnected(false);
      setSocket(null);
    };
  }, []);

  return { socket, connected };
}

function Router() {
  const { data: auth, isLoading } = useUser();
  const { connected } = useWebSocket();
  
  // If loading auth state, show nothing (avoid flash)
  if (isLoading) {
    return null;
  }
  
  // If not authenticated, show auth screens only
  if (!auth) {
    return (
      <Switch>
        <Route path="/" component={AuthScreen} />
        <Route path="/login" component={Login} />
        <Route component={AuthScreen} />
      </Switch>
    );
  }
  
  // Show different routes based on user role
  if (auth.user.role === "police") {
    return (
      <Switch>
        <Route path="/" component={PoliceDashboard} />
        <Route path="/reports" component={Reports} />
        <Route path="/map" component={CrimeMap} />
        <Route path="/teams" component={Teams} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // Civilian routes
  return (
    <Switch>
      <Route path="/" component={UserDashboard} />
      <Route path="/report" component={ReportCrime} />
      <Route path="/my-reports" component={MyReports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
